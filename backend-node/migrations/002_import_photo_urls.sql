-- Preserve existing data while allowing full imported photo URLs.
ALTER TABLE users MODIFY COLUMN image_path VARCHAR(2048) NULL;
