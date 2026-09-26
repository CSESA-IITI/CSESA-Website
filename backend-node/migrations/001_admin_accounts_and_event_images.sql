-- Run once against an existing CSESA MySQL database before deploying this version.
-- These are deliberately plain ALTER statements: the Percona/MySQL build used by
-- CloudPanel does not support ADD COLUMN IF NOT EXISTS.
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE AFTER role;
ALTER TABLE users ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT TRUE AFTER is_admin;
ALTER TABLE users ADD COLUMN role_title VARCHAR(100) NOT NULL DEFAULT '' AFTER role;
ALTER TABLE users MODIFY COLUMN role ENUM('PRESIDENT','VICE_PRESIDENT','HEAD','COORDINATOR','ASSOCIATE') NOT NULL DEFAULT 'ASSOCIATE';
ALTER TABLE events ADD COLUMN image_path VARCHAR(255) NULL AFTER location;

-- The shared CSESA mailbox account manages site content but is not a team member.
UPDATE users
SET is_admin = TRUE, is_public = FALSE, role = 'ASSOCIATE'
WHERE email = 'csesa@iiti.ac.in';
