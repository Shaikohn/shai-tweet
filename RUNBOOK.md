# RUNBOOK

This document contains the steps required to install, configure, run, seed, and test ShaiTweet.

---

# Prerequisites

Required software:

* Node.js 22+
* npm 10+
* PostgreSQL 17+

Verify installation:

```bash
node -v
npm -v
psql --version
```

---

# Clone Repository

```bash
git clone https://github.com/Shaikohn/shai-tweet
cd shai-tweet
```

---

# Database Setup

Create the development database:

```sql
CREATE DATABASE "shai-tweet";
```

Create the test database:

```sql
CREATE DATABASE "shai-tweet-test";
```

Apply the schema to both databases:

```bash
psql -h localhost -p 5432 -U postgres -d "shai-tweet" -f ./backend/src/sql/schema.sql

psql -h localhost -p 5432 -U postgres -d "shai-tweet-test" -f ./backend/src/sql/schema.sql
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`.

Example:

```env
PORT=5000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=shai-tweet
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

JWT_SECRET=super-secret-key

CLIENT_URL=http://localhost:5173
```

Create a `.env.test` file using the same variables but pointing to:

```env
DATABASE_NAME=shai-tweet-test
```

---

# Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file using `.env.example`.

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# Seed Data

Populate the development database:

```bash
cd backend
npm run seed
```

The seed creates:

* 10 users
* Tweets
* Follows
* Likes
* Reply threads

---

# Run Backend

Development:

```bash
cd backend
npm run dev
```

Production:

```bash
cd backend
npm start
```

Backend URL:

```txt
http://localhost:5000
```

---

# Run Frontend

Development:

```bash
cd frontend
npm run dev
```

Frontend URL:

```txt
http://localhost:5173
```

Production build:

```bash
cd frontend
npm run build
```

---

# Backend Tests

Run all backend tests:

```bash
cd backend
npm test
```

Run coverage:

```bash
npm run coverage
```

---

# Frontend Tests

Run integration tests:

```bash
cd frontend
npm test
```

Covered flows:

* Login
* Create Tweet
* Follow User

---

# End-to-End Tests

Prerequisites:

* Backend running
* Frontend running
* Seed data loaded

Run Playwright tests:

```bash
cd frontend
npm run test:e2e
```

Covered flow:

* Authentication

---

# Demo Credentials

All seeded users share the same password:

```txt
Password123!
```

Example account:

```txt
Email: shai@example.com
Password: Password123!
```

Additional seeded users:

* [ana@example.com](mailto:ana@example.com)
* [leo@example.com](mailto:leo@example.com)
* [mica@example.com](mailto:mica@example.com)
* [tomi@example.com](mailto:tomi@example.com)
* [valen@example.com](mailto:valen@example.com)
* [nico@example.com](mailto:nico@example.com)
* [juli@example.com](mailto:juli@example.com)
* [sofi@example.com](mailto:sofi@example.com)
* [maxi@example.com](mailto:maxi@example.com)

---

# Verification Checklist

After setup, you should be able to:

* Register a new account
* Log in
* View the timeline feed
* Create tweets
* Like tweets
* Follow users
* Search users
* View profiles
* Open reply threads
* Create replies
* Run backend tests
* Run frontend tests
* Run Playwright tests