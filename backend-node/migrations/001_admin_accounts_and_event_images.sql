-- Run once against an existing CSESA MySQL database before deploying this version.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE AFTER role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE AFTER is_admin;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_title VARCHAR(100) NOT NULL DEFAULT '' AFTER role;
ALTER TABLE users MODIFY COLUMN role ENUM('PRESIDENT','VICE_PRESIDENT','HEAD','COORDINATOR','ASSOCIATE') NOT NULL DEFAULT 'ASSOCIATE';
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_path VARCHAR(255) NULL AFTER location;

-- The shared CSESA mailbox account manages site content but is not a team member.
UPDATE users
SET is_admin = TRUE, is_public = FALSE, role = 'ASSOCIATE'
WHERE email = 'csesa@iiti.ac.in';
