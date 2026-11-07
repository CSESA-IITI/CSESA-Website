-- Development fixtures. Run schema.sql first, then run this file against MySQL.
-- All dummy users have password: DummyPass123!
-- Dummy users are non-admin; create the real admin with the backend CLI.
-- Existing records are preserved, and rerunning this file avoids duplicate fixtures.
USE csesa;
SET NAMES utf8mb4;
START TRANSACTION;

SET @dummy_password = '$2a$10$GsTDw.7gjg/rYV5zDbdymukyDUb.0GfNg7.XYS6ONsiLgMu2aas3u';

INSERT INTO users
  (email, password_hash, first_name, last_name, role, role_title, domain,
   graduation_year, bio, is_onboarded)
VALUES
  ('aarav.seed@example.com', @dummy_password, 'Aarav', 'Shah', 'PRESIDENT', 'President', 'General', '2027', 'Coordinates student initiatives and technical events.', TRUE),
  ('isha.seed@example.com', @dummy_password, 'Isha', 'Patil', 'VICE_PRESIDENT', 'Vice President', 'Web Development', '2027', 'Builds accessible websites and mentors junior developers.', TRUE),
  ('rohan.seed@example.com', @dummy_password, 'Rohan', 'Kulkarni', 'HEAD', 'AI and ML Head', 'Artificial Intelligence', '2028', 'Explores machine learning and practical data science.', TRUE),
  ('ananya.seed@example.com', @dummy_password, 'Ananya', 'Joshi', 'COORDINATOR', 'Events Coordinator', 'General', '2028', 'Organizes workshops, coding contests, and community meetups.', TRUE),
  ('kabir.seed@example.com', @dummy_password, 'Kabir', 'Mehta', 'ASSOCIATE', 'Technical Associate', 'Web Development', '2029', 'Enjoys backend development and open source projects.', TRUE)
ON DUPLICATE KEY UPDATE email = users.email;

SET @aarav = (SELECT id FROM users WHERE email = 'aarav.seed@example.com');
SET @isha = (SELECT id FROM users WHERE email = 'isha.seed@example.com');
SET @rohan = (SELECT id FROM users WHERE email = 'rohan.seed@example.com');
SET @ananya = (SELECT id FROM users WHERE email = 'ananya.seed@example.com');
SET @kabir = (SELECT id FROM users WHERE email = 'kabir.seed@example.com');

INSERT IGNORE INTO skills (name)
VALUES ('React'), ('TypeScript'), ('Node.js'), ('MySQL'), ('Python'), ('Machine Learning'), ('Git'), ('UI/UX Design');

INSERT IGNORE INTO domains (name)
VALUES ('General'), ('Web Development'), ('Artificial Intelligence'), ('Competitive Programming');

INSERT IGNORE INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u JOIN skills s ON
  (u.id = @aarav AND s.name IN ('Git', 'Python')) OR
  (u.id = @isha AND s.name IN ('React', 'TypeScript', 'UI/UX Design')) OR
  (u.id = @rohan AND s.name IN ('Python', 'Machine Learning')) OR
  (u.id = @ananya AND s.name IN ('Git', 'UI/UX Design')) OR
  (u.id = @kabir AND s.name IN ('Node.js', 'MySQL', 'Git'));

INSERT INTO projects (name, description, tech_stack, created_by)
SELECT 'Campus Connect (Demo)', 'A student portal for club announcements, resources, and event discovery.', 'React, TypeScript, Node.js, MySQL', @isha
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Campus Connect (Demo)' AND created_by = @isha);

INSERT INTO projects (name, description, tech_stack, created_by)
SELECT 'Study Buddy AI (Demo)', 'A prototype that groups study notes by topic and suggests revision questions.', 'Python, Machine Learning, React', @rohan
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Study Buddy AI (Demo)' AND created_by = @rohan);

INSERT INTO projects (name, description, tech_stack, created_by)
SELECT 'Code Arena (Demo)', 'A practice dashboard for tracking programming challenges and team progress.', 'TypeScript, Node.js, MySQL', @kabir
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Code Arena (Demo)' AND created_by = @kabir);

SET @campus = (SELECT MIN(id) FROM projects WHERE name = 'Campus Connect (Demo)' AND created_by = @isha);
SET @study = (SELECT MIN(id) FROM projects WHERE name = 'Study Buddy AI (Demo)' AND created_by = @rohan);
SET @arena = (SELECT MIN(id) FROM projects WHERE name = 'Code Arena (Demo)' AND created_by = @kabir);

INSERT IGNORE INTO project_members (project_id, user_id)
VALUES (@campus, @isha), (@campus, @kabir), (@campus, @ananya),
       (@study, @rohan), (@study, @aarav), (@arena, @kabir), (@arena, @isha);

INSERT IGNORE INTO project_domains (project_id, domain_id)
SELECT @campus, id FROM domains WHERE name = 'Web Development';
INSERT IGNORE INTO project_domains (project_id, domain_id)
SELECT @study, id FROM domains WHERE name IN ('Artificial Intelligence', 'Web Development');
INSERT IGNORE INTO project_domains (project_id, domain_id)
SELECT @arena, id FROM domains WHERE name IN ('Competitive Programming', 'Web Development');

-- Relative dates provide past and upcoming events whenever the seed is first run.
INSERT INTO events (title, description, date, location, created_by)
SELECT 'React Essentials Workshop (Demo)', 'Build a small React application and learn components, props, and state.', DATE_ADD(NOW(), INTERVAL 3 DAY), 'Computer Lab 1', @isha
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'React Essentials Workshop (Demo)' AND created_by = @isha);

INSERT INTO events (title, description, date, location, created_by)
SELECT 'Introduction to Machine Learning (Demo)', 'Explore datasets, train a simple model, and discuss real applications.', DATE_ADD(NOW(), INTERVAL 6 DAY), 'Seminar Hall', @rohan
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Introduction to Machine Learning (Demo)' AND created_by = @rohan);

INSERT INTO events (title, description, date, location, created_by)
SELECT 'Campus Hackathon (Demo)', 'Form a team and build a solution to a campus problem over a weekend.', DATE_ADD(NOW(), INTERVAL 21 DAY), 'Innovation Center', @aarav
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Campus Hackathon (Demo)' AND created_by = @aarav);

INSERT INTO events (title, description, date, location, created_by)
SELECT 'Git and Open Source Meetup (Demo)', 'Practice branching, pull requests, and contributing to a shared repository.', DATE_SUB(NOW(), INTERVAL 10 DAY), 'Computer Lab 2', @kabir
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Git and Open Source Meetup (Demo)' AND created_by = @kabir);

INSERT INTO events (title, description, date, location, created_by)
SELECT 'Freshers Tech Orientation (Demo)', 'Meet the association team and discover upcoming technical activities.', DATE_SUB(NOW(), INTERVAL 30 DAY), 'Main Auditorium', @ananya
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Freshers Tech Orientation (Demo)' AND created_by = @ananya);

INSERT INTO contact_messages (name, email, phone, subject, message, is_read)
SELECT 'Priya Demo', 'priya.seed@example.com', '', 'Workshop registration (Demo)', 'How can I register for the upcoming React workshop?', FALSE
WHERE NOT EXISTS (SELECT 1 FROM contact_messages WHERE email = 'priya.seed@example.com' AND subject = 'Workshop registration (Demo)');

INSERT INTO contact_messages (name, email, phone, subject, message, is_read)
SELECT 'Nikhil Demo', 'nikhil.seed@example.com', '', 'Project collaboration (Demo)', 'I would like to help with the Campus Connect project. Who should I contact?', TRUE
WHERE NOT EXISTS (SELECT 1 FROM contact_messages WHERE email = 'nikhil.seed@example.com' AND subject = 'Project collaboration (Demo)');

-- refresh_tokens stays empty: authentication creates real session tokens.
COMMIT;
