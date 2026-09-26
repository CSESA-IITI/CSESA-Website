import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 12) {
  console.error('Usage: npm run create-admin -- <email> <password-at-least-12-chars>');
  process.exit(1);
}
const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set`);
  return value;
};
const connection = await mysql.createConnection({
  host: env('DB_HOST'), port: Number(process.env.DB_PORT || 3306), user: env('DB_USER'),
  password: env('DB_PASSWORD'), database: env('DB_NAME'), charset: 'utf8mb4'
});
try {
  const normalizedEmail = email.trim().toLowerCase();
  const [existing] = await connection.execute<mysql.RowDataPacket[]>('SELECT id FROM users WHERE email=?', [normalizedEmail]);
  if (existing[0]) throw new Error('A user with that email already exists.');
  await connection.execute('INSERT INTO users(email,password_hash,role,is_admin,is_public) VALUES(?, ?, ?, ?, ?)', [normalizedEmail, await bcrypt.hash(password, 12), 'ASSOCIATE', true, false]);
  console.log(`Created hidden admin account ${normalizedEmail}`);
} finally {
  await connection.end();
}
