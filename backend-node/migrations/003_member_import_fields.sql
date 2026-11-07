-- Run ONCE against an existing CSESA database before deploying member imports.
-- Select the intended database first (USE your_database;).
-- Preserves all existing rows; existing members receive empty optional fields.
-- Matches schema.sql without running its destructive reset.
-- Plain ALTER statements are compatible with the CloudPanel MySQL/Percona build.
-- Skip this migration on databases already initialized with the updated schema.sql.
use csesa;
ALTER TABLE users
  ADD COLUMN department VARCHAR(150) NOT NULL DEFAULT '' AFTER graduation_year,
  ADD COLUMN personal_email VARCHAR(254) NOT NULL DEFAULT '' AFTER department,
  ADD COLUMN phone VARCHAR(32) NOT NULL DEFAULT '' AFTER personal_email,
  ADD COLUMN instagram_link VARCHAR(2048) NOT NULL DEFAULT '' AFTER phone;
