-- Apply once to an existing database after 001-003; preserves existing data.
-- Current study year is separate from graduation_year. Domains are a JSON list.
USE csesa;
ALTER TABLE users
  ADD COLUMN academic_year TINYINT UNSIGNED NULL AFTER graduation_year,
  ADD COLUMN all_domains JSON NULL AFTER academic_year;
