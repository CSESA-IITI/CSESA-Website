# CSESA Website

The official website of the Computer Science and Engineering Students Association (CSESA), IIT Indore. It showcases the team, events, projects, and provides member authentication and a contact form.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- API: Node.js, TypeScript, Express
- Database: MySQL
- Authentication: JWT access and rotating refresh tokens

The active API lives in [`backend-node`](./backend-node). The legacy Django code remains in `backend/` for historical reference and is not used by the current application.

## Local development

### Prerequisites

- Node.js 22 or later
- MySQL 8 or compatible MariaDB server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/CSESA-IITI/CSESA-Website.git
cd CSESA-Website
```

### 2. Set up MySQL and the API

Create an empty local MySQL database and a user with full access to that database. Then configure the API:

```bash
cd backend-node
cp .env.example .env
```

Edit `.env` with local, non-production values. At minimum, set `NODE_ENV=development`, your MySQL connection details, and a unique `JWT_SECRET`.

Load the variables and initialise the schema:

```bash
set -a
source .env
set +a
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < schema.sql
```

Install dependencies and start the development API:

```bash
npm ci --include=dev
npm run dev
```

The API listens on `http://127.0.0.1:3000`.

To use management features locally, create the hidden CSESA admin account after building the API:

```bash
npm run build
npm run create-admin -- csesa@iiti.ac.in 'a-long-unique-password'
```

There is intentionally no public registration endpoint.

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm ci --include=dev
npm run dev
```

Vite serves the site at `http://localhost:5173`. In development, it connects to the local API at `http://127.0.0.1:3000/api` by default. Set `VITE_API_BASE_URL` in `frontend/.env.local` only when you need to target a different API.

### 4. Verify builds

Before opening a pull request, run:

```bash
cd backend-node && npm run check && npm run build
cd ../frontend && npm run build
```

## Contributing

Please keep secrets, local `.env` files, generated build files, and database dumps out of Git. Open a pull request with a focused description of the change and any relevant verification steps.

## Maintainers

Deployment, CloudPanel configuration, production credentials, database administration, process supervision, and recovery procedures are maintained in the CSESA internal documentation. Refer to those internal docs before making production changes; do not add operational secrets to this repository.

---

Developed by the CSESA Team.
