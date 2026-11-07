# CSESA Node API

This replaces the Django API and is designed to run behind CloudPanel's Nginx proxy.

## First deployment

1. Create a MySQL database/user in CloudPanel and copy `.env.example` to `.env`; fill the database and JWT values.
2. Run the schema once: `mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < schema.sql`.
3. Install and build: `npm ci && npm run build`.
4. Create the hidden CSESA admin account after building: `npm run create-admin -- csesa@iiti.ac.in a-long-unique-password`. There is intentionally no public registration route.
5. Start with CloudPanel's Node app manager or systemd: `npm start`. It listens only on `127.0.0.1` by default.

The application expects Nginx to forward `/api/` to port 3000 and `/uploads/` to port 3000. See `cloudpanel-location.conf`.
