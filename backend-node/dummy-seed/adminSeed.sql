-- Create or promote the CSESA admin account.
-- All users have password: DummyPass123!
USE csesa;
SET NAMES utf8mb4;

SET @admin_email = 'csesa@iiti.ac.in';
SET @admin_password_hash = '$2a$10$GsTDw.7gjg/rYV5zDbdymukyDUb.0GfNg7.XYS6ONsiLgMu2aas3u';

INSERT INTO users (email, password_hash, role, is_admin, is_public)
VALUES (@admin_email, @admin_password_hash, 'ASSOCIATE', TRUE, FALSE)
ON DUPLICATE KEY UPDATE
  is_admin = TRUE,
  is_public = FALSE;