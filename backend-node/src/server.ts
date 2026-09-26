import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mysql, { Pool, RowDataPacket } from 'mysql2/promise';
import nodemailer from 'nodemailer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set`);
  return value;
};
const port = Number(process.env.PORT || 3000);
const jwtSecret = required('JWT_SECRET');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(__dirname, '../uploads');
const pool: Pool = mysql.createPool({
  host: required('DB_HOST'), port: Number(process.env.DB_PORT || 3306), database: required('DB_NAME'),
  user: required('DB_USER'), password: required('DB_PASSWORD'), waitForConnections: true,
  connectionLimit: 10, charset: 'utf8mb4', timezone: 'Z'
});

type Role = 'PRESIDENT' | 'HEAD' | 'COORDINATOR' | 'ASSOCIATE';
type User = RowDataPacket & { id: number; email: string; role: Role; image_path: string | null };
type AuthedRequest = Request & { user?: User };
const roles: Role[] = ['PRESIDENT', 'HEAD', 'COORDINATOR', 'ASSOCIATE'];
const publicOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: [publicOrigin, 'http://localhost:5173', 'http://localhost:5174'], methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '256kb' }));
app.use('/uploads', express.static(uploadDirectory, { maxAge: '7d', index: false }));

const upload = multer({
  storage: multer.diskStorage({ destination: uploadDirectory, filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});
const asyncRoute = (fn: (req: any, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res)).catch(next);
const fail = (res: Response, status: number, message: string) => res.status(status).json({ detail: message });
const id = (value: string) => { const parsed = Number(value); return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null; };
const isLeadership = (user: User) => ['PRESIDENT', 'HEAD', 'COORDINATOR'].includes(user.role);
const canCreateEvent = (user: User) => ['PRESIDENT', 'HEAD'].includes(user.role);

function accessToken(user: User) { return jwt.sign({ sub: user.id, role: user.role, type: 'access' }, jwtSecret, { expiresIn: '1h' }); }
async function issueTokens(user: User) {
  const tokenId = randomUUID();
  const expires = new Date(Date.now() + 7 * 86400_000);
  await pool.execute('INSERT INTO refresh_tokens (id, user_id, expires_at) VALUES (?, ?, ?)', [tokenId, user.id, expires]);
  return { access: accessToken(user), refresh: jwt.sign({ sub: user.id, jti: tokenId, type: 'refresh' }, jwtSecret, { expiresIn: '7d' }) };
}
async function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return fail(res, 401, 'Authentication credentials were not provided.');
  try {
    const token = jwt.verify(header.slice(7), jwtSecret) as jwt.JwtPayload;
    if (token.type !== 'access' || !token.sub) return fail(res, 401, 'Invalid token.');
    const [rows] = await pool.execute<User[]>('SELECT * FROM users WHERE id = ?', [token.sub]);
    if (!rows[0]) return fail(res, 401, 'User no longer exists.');
    req.user = rows[0]; next();
  } catch { return fail(res, 401, 'Token is invalid or expired.'); }
}
function requireRole(...allowed: Role[]) { return (req: AuthedRequest, res: Response, next: NextFunction) => !req.user || !allowed.includes(req.user.role) ? fail(res, 403, 'You do not have permission to perform this action.') : next(); }

const imageUrl = (req: Request, imagePath: string | null) => imagePath ? `${process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`}/uploads/${imagePath}` : null;
async function serializeUser(req: Request, user: User, compact = false) {
  if (compact) return { id: String(user.id), email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role };
  const [skills] = await pool.execute<RowDataPacket[]>('SELECT s.name FROM skills s JOIN user_skills us ON us.skill_id=s.id WHERE us.user_id=? ORDER BY s.name', [user.id]);
  return { id: String(user.id), email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, domain: user.domain, year: user.graduation_year, bio: user.bio || '', image_url: imageUrl(req, user.image_path), skills, github_link: user.github_link, linkedin_link: user.linkedin_link, is_onboarded: Boolean(user.is_onboarded) };
}
async function getProject(req: Request, projectId: number) {
  const [projects] = await pool.execute<RowDataPacket[]>('SELECT * FROM projects WHERE id=?', [projectId]);
  const project = projects[0]; if (!project) return null;
  const [domains] = await pool.execute<RowDataPacket[]>('SELECT d.id,d.name FROM domains d JOIN project_domains pd ON pd.domain_id=d.id WHERE pd.project_id=?', [projectId]);
  const [members] = await pool.execute<User[]>('SELECT u.* FROM users u JOIN project_members pm ON pm.user_id=u.id WHERE pm.project_id=? ORDER BY u.first_name,u.last_name', [projectId]);
  const [available] = await pool.execute<User[]>('SELECT u.* FROM users u WHERE NOT EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id=? AND pm.user_id=u.id)', [projectId]);
  return { id: project.id, name: project.name, description: project.description, tech_stack: project.tech_stack, github_link: project.github_link, deployment_link: project.deployment_link, created_at: project.created_at, updated_at: project.updated_at, created_by: project.created_by, domains: domains.map(d => d.id), domains_details: domains, team_members_details: await Promise.all(members.map(u => serializeUser(req, u, true))), available_contributors: await Promise.all(available.map(u => serializeUser(req, u, true))) };
}
async function getEvent(req: AuthedRequest, eventId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT e.*, u.id AS user_id, u.email, u.first_name, u.last_name, u.role, u.domain, u.graduation_year, u.bio, u.image_path, u.github_link, u.linkedin_link, u.is_onboarded FROM events e JOIN users u ON u.id=e.created_by WHERE e.id=?', [eventId]);
  const event = rows[0]; if (!event) return null;
  const owner = { ...event, id: event.user_id } as User;
  const canEdit = Boolean(req.user && (req.user.id === event.created_by || ['PRESIDENT', 'HEAD'].includes(req.user.role)));
  return { id: event.id, title: event.title, description: event.description, date: event.date, location: event.location, created_by: await serializeUser(req, owner), can_edit: canEdit, can_delete: canEdit, created_at: event.created_at, updated_at: event.updated_at };
}

app.get('/api/health/', asyncRoute(async (_req, res) => { await pool.query('SELECT 1'); res.json({ ok: true }); }));
app.post('/api/token/', rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }), asyncRoute(async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') return fail(res, 400, 'Email and password are required.');
  const [users] = await pool.execute<User[]>('SELECT * FROM users WHERE email=?', [email.trim().toLowerCase()]);
  if (!users[0] || !await bcrypt.compare(password, users[0].password_hash)) return fail(res, 401, 'No active account found with the given credentials.');
  res.json({ ...(await issueTokens(users[0])), user: await serializeUser(req, users[0]) });
}));
app.post('/api/token/refresh/', asyncRoute(async (req, res) => {
  try {
    const token = jwt.verify(req.body?.refresh, jwtSecret) as jwt.JwtPayload;
    if (token.type !== 'refresh' || !token.jti || !token.sub) return fail(res, 401, 'Invalid refresh token.');
    const [tokens] = await pool.execute<RowDataPacket[]>('SELECT * FROM refresh_tokens WHERE id=? AND user_id=? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP()', [token.jti, token.sub]);
    if (!tokens[0]) return fail(res, 401, 'Refresh token has been revoked.');
    const [users] = await pool.execute<User[]>('SELECT * FROM users WHERE id=?', [token.sub]);
    if (!users[0]) return fail(res, 401, 'User no longer exists.');
    await pool.execute('UPDATE refresh_tokens SET revoked_at=UTC_TIMESTAMP() WHERE id=?', [token.jti]);
    res.json(await issueTokens(users[0]));
  } catch { return fail(res, 401, 'Invalid refresh token.'); }
}));

app.route('/api/profile/').get(authenticate, asyncRoute(async (req: AuthedRequest, res) => res.json(await serializeUser(req, req.user!)))).patch(authenticate, upload.single('image'), asyncRoute(async (req: AuthedRequest, res) => {
  const allowed = ['first_name', 'last_name', 'bio', 'github_link', 'linkedin_link', 'is_onboarded']; const sets: string[] = []; const values: any[] = [];
  for (const field of allowed) if (req.body[field] !== undefined) { sets.push(`${field}=?`); values.push(field === 'is_onboarded' ? ['true', '1', true, 1].includes(req.body[field]) : String(req.body[field]).trim()); }
  if (req.file) { sets.push('image_path=?'); values.push(req.file.filename); }
  if (sets.length) { values.push(req.user!.id); await pool.execute(`UPDATE users SET ${sets.join(', ')} WHERE id=?`, values); }
  if (req.body.skill_names !== undefined) { const names = Array.isArray(req.body.skill_names) ? req.body.skill_names : JSON.parse(req.body.skill_names); if (!Array.isArray(names)) return fail(res, 400, 'skill_names must be an array.'); await pool.execute('DELETE FROM user_skills WHERE user_id=?', [req.user!.id]); for (const raw of names) { const name = String(raw).trim(); if (!name) continue; await pool.execute('INSERT IGNORE INTO skills(name) VALUES(?)', [name]); const [skill] = await pool.execute<RowDataPacket[]>('SELECT id FROM skills WHERE name=?', [name]); await pool.execute('INSERT IGNORE INTO user_skills(user_id,skill_id) VALUES(?,?)', [req.user!.id, skill[0].id]); } }
  const [users] = await pool.execute<User[]>('SELECT * FROM users WHERE id=?', [req.user!.id]); res.json(await serializeUser(req, users[0]));
}));

app.route('/api/admin/users/').get(asyncRoute(async (req, res) => { const [users] = await pool.execute<User[]>('SELECT * FROM users ORDER BY first_name,last_name'); res.json(await Promise.all(users.map(u => serializeUser(req, u)))); })).post(authenticate, requireRole('PRESIDENT'), asyncRoute(async (req, res) => {
  const { email, password, role, domain, year } = req.body ?? {}; if (!email || !password || !roles.includes(role) || !domain || !year || String(password).length < 8) return fail(res, 400, 'Email, password (8+ characters), role, domain, and year are required.');
  try { const [result] = await pool.execute<mysql.ResultSetHeader>('INSERT INTO users(email,password_hash,role,domain,graduation_year) VALUES(?,?,?,?,?)', [String(email).trim().toLowerCase(), await bcrypt.hash(password, 12), role, domain, year]); const [users] = await pool.execute<User[]>('SELECT * FROM users WHERE id=?', [result.insertId]); res.status(201).json(await serializeUser(req, users[0])); } catch (error: any) { if (error.code === 'ER_DUP_ENTRY') return fail(res, 400, 'A user with this email already exists.'); throw error; }
}));
app.get('/api/skills/', authenticate, asyncRoute(async (_req, res) => { const [skills] = await pool.execute<RowDataPacket[]>('SELECT name FROM skills ORDER BY name'); res.json(skills); }));

app.get('/api/domains/', asyncRoute(async (_req, res) => { const [domains] = await pool.execute<RowDataPacket[]>('SELECT id,name FROM domains ORDER BY name'); res.json(domains); }));
app.route('/api/projects/').get(asyncRoute(async (req, res) => { const [projects] = await pool.execute<RowDataPacket[]>('SELECT id FROM projects ORDER BY created_at DESC'); res.json(await Promise.all(projects.map(p => getProject(req, p.id)))); })).post(authenticate, requireRole('PRESIDENT', 'HEAD', 'COORDINATOR'), asyncRoute(async (req: AuthedRequest, res) => {
  const body = req.body ?? {}; if (!body.name?.trim() || !body.description?.trim() || !body.tech_stack?.trim() || !Array.isArray(body.domains) || !body.domains.length) return fail(res, 400, 'Name, description, tech_stack, and at least one domain are required.');
  const conn = await pool.getConnection(); try { await conn.beginTransaction(); const [created] = await conn.execute<mysql.ResultSetHeader>('INSERT INTO projects(name,description,tech_stack,github_link,deployment_link,created_by) VALUES(?,?,?,?,?,?)', [body.name.trim(), body.description.trim(), body.tech_stack.trim(), body.github_link || null, body.deployment_link || null, req.user!.id]); for (const domainId of body.domains) await conn.execute('INSERT INTO project_domains(project_id,domain_id) VALUES(?,?)', [created.insertId, id(String(domainId))]); const members = new Set<number>((body.team_members || []).map((x: unknown) => id(String(x))).filter(Boolean) as number[]); if (body.add_self_as_contributor !== false) members.add(req.user!.id); for (const userId of members) await conn.execute('INSERT INTO project_members(project_id,user_id) VALUES(?,?)', [created.insertId, userId]); await conn.commit(); res.status(201).json(await getProject(req, created.insertId)); } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
}));

app.route('/api/projects/:projectId/').get(asyncRoute(async (req, res) => { const projectId = id(String(req.params.projectId)); const project = projectId && await getProject(req, projectId); return project ? res.json(project) : fail(res, 404, 'Not found.'); })).patch(authenticate, asyncRoute(async (req: AuthedRequest, res) => {
  const projectId = id(String(req.params.projectId)); if (!projectId) return fail(res, 404, 'Not found.'); const [owned] = await pool.execute<RowDataPacket[]>('SELECT created_by FROM projects WHERE id=?', [projectId]); if (!owned[0]) return fail(res, 404, 'Not found.'); if (!isLeadership(req.user!) && owned[0].created_by !== req.user!.id) return fail(res, 403, 'You do not have permission to modify this project.');
  const fields = ['name', 'description', 'tech_stack', 'github_link', 'deployment_link']; const sets: string[] = []; const values: any[] = []; for (const field of fields) if (req.body?.[field] !== undefined) { sets.push(`${field}=?`); values.push(req.body[field] || null); } if (sets.length) { values.push(projectId); await pool.execute(`UPDATE projects SET ${sets.join(', ')} WHERE id=?`, values); } if (Array.isArray(req.body?.domains)) { await pool.execute('DELETE FROM project_domains WHERE project_id=?', [projectId]); for (const domainId of req.body.domains) await pool.execute('INSERT INTO project_domains(project_id,domain_id) VALUES(?,?)', [projectId, id(String(domainId))]); } res.json(await getProject(req, projectId));
})).delete(authenticate, asyncRoute(async (req: AuthedRequest, res) => {
  const projectId = id(String(req.params.projectId)); if (!projectId) return fail(res, 404, 'Not found.'); const [owned] = await pool.execute<RowDataPacket[]>('SELECT created_by FROM projects WHERE id=?', [projectId]); if (!owned[0]) return fail(res, 404, 'Not found.'); if (!isLeadership(req.user!) && owned[0].created_by !== req.user!.id) return fail(res, 403, 'You do not have permission to delete this project.'); await pool.execute('DELETE FROM projects WHERE id=?', [projectId]); res.status(204).end();
}));
app.post('/api/projects/:projectId/contributors/', authenticate, asyncRoute(async (req: AuthedRequest, res) => {
  const projectId = id(String(req.params.projectId)); const { user_ids: userIds, action } = req.body ?? {}; if (!projectId) return fail(res, 404, 'Not found.'); if (!Array.isArray(userIds) || !userIds.length || !['add', 'remove'].includes(action)) return fail(res, 400, 'user_ids and an add/remove action are required.'); const [projects] = await pool.execute<RowDataPacket[]>('SELECT created_by FROM projects WHERE id=?', [projectId]); if (!projects[0]) return fail(res, 404, 'Not found.'); if (!isLeadership(req.user!) && projects[0].created_by !== req.user!.id) return fail(res, 403, 'You do not have permission to manage contributors.'); const validIds = userIds.map((value: unknown) => id(String(value))); if (validIds.some(value => !value)) return fail(res, 400, 'Invalid user IDs.'); const results = []; for (const userId of validIds as number[]) { const [users] = await pool.execute<User[]>('SELECT * FROM users WHERE id=?', [userId]); if (!users[0]) return fail(res, 400, 'Invalid user IDs.'); if (action === 'add') { const [result] = await pool.execute<mysql.ResultSetHeader>('INSERT IGNORE INTO project_members(project_id,user_id) VALUES(?,?)', [projectId, userId]); results.push({ user_id: String(userId), user_name: `${users[0].first_name} ${users[0].last_name}`.trim(), action: 'added', success: result.affectedRows === 1, message: result.affectedRows ? 'User added successfully' : 'User is already a contributor' }); } else { const [result] = await pool.execute<mysql.ResultSetHeader>('DELETE FROM project_members WHERE project_id=? AND user_id=?', [projectId, userId]); results.push({ user_id: String(userId), user_name: `${users[0].first_name} ${users[0].last_name}`.trim(), action: 'removed', success: result.affectedRows === 1, message: result.affectedRows ? 'User removed successfully' : 'User was not a contributor' }); } } const project = await getProject(req, projectId); res.json({ message: `Contributors ${action} operation completed`, results, current_contributors: project!.team_members_details });
}));
app.get('/api/projects/:projectId/available-contributors/', authenticate, asyncRoute(async (req: AuthedRequest, res) => { const projectId = id(String(req.params.projectId)); const [projects] = projectId ? await pool.execute<RowDataPacket[]>('SELECT created_by FROM projects WHERE id=?', [projectId]) : [[]]; if (!projects[0]) return fail(res, 404, 'Not found.'); if (!isLeadership(req.user!) && projects[0].created_by !== req.user!.id) return fail(res, 403, 'You do not have permission to manage contributors.'); const [users] = await pool.execute<User[]>('SELECT u.* FROM users u WHERE NOT EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id=? AND pm.user_id=u.id) ORDER BY u.first_name,u.last_name', [projectId]); const available_contributors = await Promise.all(users.map(u => serializeUser(req, u, true))); res.json({ available_contributors, count: available_contributors.length }); }));

app.route('/api/events/').get(asyncRoute(async (req: AuthedRequest, res) => { const [events] = await pool.execute<RowDataPacket[]>('SELECT id FROM events ORDER BY date DESC'); res.json(await Promise.all(events.map(event => getEvent(req, event.id)))); })).post(authenticate, asyncRoute(async (req: AuthedRequest, res) => { if (!canCreateEvent(req.user!)) return fail(res, 403, 'You do not have permission to create events.'); const { title, description, date, location } = req.body ?? {}; if (!title?.trim() || !description?.trim() || !location?.trim() || !date || Number.isNaN(Date.parse(date)) || new Date(date) <= new Date()) return fail(res, 400, 'A future date, title, description, and location are required.'); const [result] = await pool.execute<mysql.ResultSetHeader>('INSERT INTO events(title,description,date,location,created_by) VALUES(?,?,?,?,?)', [title.trim(), description.trim(), new Date(date), location.trim(), req.user!.id]); res.status(201).json(await getEvent(req, result.insertId)); }));
app.get('/api/events/my_events/', authenticate, asyncRoute(async (req: AuthedRequest, res) => { const [events] = await pool.execute<RowDataPacket[]>('SELECT id FROM events WHERE created_by=? ORDER BY date DESC', [req.user!.id]); res.json(await Promise.all(events.map(event => getEvent(req, event.id)))); }));
app.route('/api/events/:eventId/').get(asyncRoute(async (req: AuthedRequest, res) => { const eventId = id(String(req.params.eventId)); const event = eventId && await getEvent(req, eventId); return event ? res.json(event) : fail(res, 404, 'Not found.'); })).patch(authenticate, asyncRoute(async (req: AuthedRequest, res) => { const eventId = id(String(req.params.eventId)); const event = eventId && await getEvent(req, eventId); if (!event) return fail(res, 404, 'Not found.'); if (!event.can_edit) return fail(res, 403, 'You do not have permission to modify this event.'); const fields = ['title', 'description', 'location', 'date']; const sets: string[] = []; const values: any[] = []; for (const field of fields) if (req.body?.[field] !== undefined) { const value = req.body[field]; if (field === 'date' && (Number.isNaN(Date.parse(String(value))) || new Date(value) <= new Date())) return fail(res, 400, 'Event date must be in the future.'); if (field !== 'date' && !String(value).trim()) return fail(res, 400, `${field} cannot be empty.`); sets.push(`${field}=?`); values.push(field === 'date' ? new Date(value) : String(value).trim()); } if (sets.length) { values.push(eventId); await pool.execute(`UPDATE events SET ${sets.join(', ')} WHERE id=?`, values); } res.json(await getEvent(req, eventId)); })).delete(authenticate, asyncRoute(async (req: AuthedRequest, res) => { const eventId = id(String(req.params.eventId)); const event = eventId && await getEvent(req, eventId); if (!event) return fail(res, 404, 'Not found.'); if (!event.can_delete) return fail(res, 403, 'You do not have permission to delete this event.'); await pool.execute('DELETE FROM events WHERE id=?', [eventId]); res.status(204).end(); }));

const contactLimiter = rateLimit({ windowMs: 60 * 60_000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false });
app.post('/api/contact/', contactLimiter, asyncRoute(async (req, res) => { const { name, email, phone = '', subject = '', message } = req.body ?? {}; if (!name?.trim() || !message?.trim() || !/^\S+@\S+\.\S+$/.test(email || '')) return fail(res, 400, 'A name, valid email address, and message are required.'); await pool.execute('INSERT INTO contact_messages(name,email,phone,subject,message) VALUES(?,?,?,?,?)', [name.trim(), email.trim().toLowerCase(), String(phone).trim(), String(subject).trim(), message.trim()]); if (process.env.SMTP_HOST && process.env.CONTACT_EMAIL) { const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: false, auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined }); void transporter.sendMail({ from: process.env.MAIL_FROM, to: process.env.CONTACT_EMAIL, replyTo: email, subject: `CSESA contact: ${String(subject).trim() || 'No subject'}`, text: `From: ${name} <${email}>\nPhone: ${phone}\n\n${message}` }).catch((error: Error) => console.error('Contact email failed:', error.message)); } res.status(201).json({ message: "Your message has been sent successfully! We'll get back to you soon.", success: true }); }));

app.use((_req, res) => fail(res, 404, 'Not found.'));
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => { if (error instanceof multer.MulterError) return fail(res, 400, error.message); console.error(error); return fail(res, 500, 'An unexpected server error occurred.'); });
pool.query('SELECT 1').then(() => app.listen(port, '127.0.0.1', () => console.log(`CSESA API listening on 127.0.0.1:${port}`))).catch(error => { console.error('Database connection failed:', error.message); process.exit(1); });
