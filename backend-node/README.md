# CSESA Node API

This replaces the Django API and is designed to run behind CloudPanel's Nginx proxy.

## First deployment

1. Create a MySQL database/user in CloudPanel and copy `.env.example` to `.env`; fill the database and JWT values.
2. Run the schema once: `mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < schema.sql`.
3. Install and build: `npm ci && npm run build`.
4. Create the hidden CSESA admin account after building: `npm run create-admin -- csesa@iiti.ac.in a-long-unique-password`. There is intentionally no public registration route.
5. Start with CloudPanel's Node app manager or systemd: `npm start`. It listens only on `127.0.0.1` by default.

The application expects Nginx to forward `/api/` to port 3000 and `/uploads/` to port 3000. See `cloudpanel-location.conf`.

### Import members (admin only)

On the admin Profile page, choose **Import members** and upload a UTF-8 CSV
export from your spreadsheet (not an XLSX file). The API is
`POST /api/admin/users/import/` with a Bearer token and multipart `file` field.
Limits: 2 MB and 500 data rows. Required headers: `Email Address`, `Name`, `Phone`.
Other recognized headers match the original spreadsheet wording. Headers are
case insensitive. Duplicate emails within a file are skipped (first row wins).
Existing accounts are skipped by default. Enable **Fill missing fields** to repair
existing non-admin accounts: blank fields are populated, passwords and filled
fields are preserved. An Associate with a matching head/lead title is corrected
to HEAD. The response contains `created`, `repaired`, `skipped`, and row reports.
Imports create member accounts, never admin accounts. They remain unonboarded.

Phone text, trimmed at the edges, is bcrypt-hashed as the initial password.
Keep phone cells formatted as text in the spreadsheet to preserve leading zeros
and country codes. Unknown positions use ASSOCIATE and preserve `role_title`;
head/lead positions map to HEAD. AI/ML and WebDev map to the existing domain
codes; Non-tech and LLD are supported, and other domain names are preserved.
All domains are deduplicated and saved as a JSON list in `all_domains`.
Year values such as 2nd and 3rd populate `academic_year`; four-digit years populate
`graduation_year`. Graduation dates are not inferred from email or the current date.
Timestamp is ignored; photo references are handled as described below.
Personal email, department, phone and Instagram are stored in dedicated columns;
private contact details are not added to public API responses.

**Database reset:** `SOURCE schema.sql;` now drops and recreates all application
tables in `csesa`, deleting existing accounts and content. It does not run seeds.
Recreate the admin account or apply your chosen seed afterwards. The import
requires this new schema. Do not source it against data you intend to keep.



## Updating the hosted database

Merging to main does not apply SQL migrations automatically. Back up the hosted
database, then connect to that database using the MySQL client. From the
`backend-node` directory, apply pending migrations before restarting the updated
backend:

```sql
USE your_database_name;
-- Only if 001 has not already been applied:
SOURCE migrations/001_admin_accounts_and_event_images.sql;
-- Only if 002 has not already been applied:
SOURCE migrations/002_import_photo_urls.sql;
-- Adds the optional fields needed by member import:
SOURCE migrations/003_member_import_fields.sql;
SOURCE migrations/004_member_study_year_and_domains.sql;
```

Migration 003 adds `department`, `personal_email`, `phone`, and `instagram_link`
without removing members, passwords, or other content. Existing rows get empty
values for these fields. Migration 002 separately widens the profile photo field.
Migration 004 adds study year and the complete domain list. After applying it,
reimport the original CSV with **Fill missing fields** to repair earlier imports.
These migrations are run once; skip any already applied, including on a local
database created with the updated schema. You can inspect columns with
`SHOW COLUMNS FROM users;` before applying them.

**Do not run `schema.sql` on the hosted database:** it drops the application
tables and deletes their data. It is for fresh installations or local resets.

## Imported profile photos

The CSV `Your Photo` column populates `users.image_path`. Use a public HTTP(S)
image URL, an existing upload filename such as `member.jpg`, or
`uploads/member.jpg` / `/uploads/member.jpg`. Upload paths are normalized to the
filename; URLs are returned directly as `image_url`. Blank cells leave no photo.
Invalid references are left blank with a row warning. Files must already exist
in `backend-node/uploads`; import does not copy files or download remote images.
Remote URLs must serve an image publicly; private Google Drive sharing pages
and local computer paths will not display as photos. Members can replace imported
photos through the existing profile upload flow.

For an existing database, run `SOURCE migrations/002_import_photo_urls.sql;`
to widen the photo field without deleting data. Fresh databases use `schema.sql`.