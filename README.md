# ShaiTweet

ShaiTweet is a Twitter/X-inspired social platform built as part of an AI-assisted software engineering challenge.

The project recreates the core Twitter/X experience, including authentication, timelines, social interactions, user profiles, personalized feeds, likes, follows, and reply threads.

The goal was not only to build a functional application, but also to demonstrate software architecture decisions, testing practices, development workflow, and effective use of AI-assisted development tools.

---

# Runbook

## Prerequisites

Required software:

* Node.js 22+
* PostgreSQL 17+
* npm 10+

Verify installation:

```bash
node -v
npm -v
psql --version
```

---

## Clone Repository

```bash
git clone https://github.com/Shaikohn/shai-tweet
cd shai-tweet
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create:

```bash
.env
```

using the provided:

```bash
.env.example
```

template.

### Required Environment Variables

| Variable          | Description          |
| ----------------- | -------------------- |
| PORT              | Backend server port  |
| DATABASE_HOST     | PostgreSQL host      |
| DATABASE_PORT     | PostgreSQL port      |
| DATABASE_NAME     | Development database |
| DATABASE_USER     | PostgreSQL user      |
| DATABASE_PASSWORD | PostgreSQL password  |
| JWT_SECRET        | JWT signing secret   |
| CLIENT_URL        | Frontend URL         |

---

## Test Database Setup

Create a dedicated PostgreSQL database for tests.

Example:

```sql
CREATE DATABASE shai-tweet-test;
```

Create:

```bash
.env.test
```

using the same variables as `.env` but pointing to the test database.

Tests automatically run against the test database.

---

## Seed Data

Populate the development database:

```bash
npm run seed
```

This creates:

* 10 demo users
* Tweets
* Follows
* Likes
* Reply threads

---

## Run Backend

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

---

## Run Tests

Run all tests:

```bash
npm test
```

Run coverage:

```bash
npm run coverage
```

Current backend coverage:

* 86%+
* 83 integration tests

---

## Demo Credentials

All seeded users use:

```txt
Password123!
```

Example accounts:

| Username |
| -------- |
| shai     |
| ana      |
| leo      |
| mica     |
| tomi     |
| valen    |
| nico     |
| juli     |
| sofi     |
| maxi     |

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Redux Toolkit
* RTK Query

## Backend

* Node.js
* Express
* PostgreSQL
* JWT Authentication
* bcrypt

## Testing

* Vitest
* Supertest
* React Testing Library
* Playwright

---

# Architecture

The backend follows a layered architecture:

### Controllers

Handle HTTP requests and responses.

### Services

Contain business rules, validation, and application logic.

### Repositories

Encapsulate database access and SQL queries.

### Database

PostgreSQL stores users, tweets, follows, likes, and replies.

---

# Core Features

* User Registration
* Login / Logout
* JWT Authentication
* User Profiles
* Create Tweets
* Delete Tweets
* Personalized Timeline Feed
* Pagination
* Follow / Unfollow
* Like / Unlike
* Followers & Following Lists
* User Search

---

# Bonus Feature

✅ Reply Threads

The application supports tweet replies and thread retrieval.

The data model also includes an `image_url` field for future image upload support, although image uploads are intentionally outside the current MVP scope.

---

# Technical Decisions

## Why React + Express?

The goal was to use a stack that allows rapid iteration while maintaining clear separation between frontend and backend concerns.

React provides a flexible UI architecture, while Express offers a lightweight and explicit backend layer.

## Timeline Modeling

The timeline is generated dynamically from:

* The authenticated user's tweets
* Tweets from followed users

Results are returned in reverse chronological order with pagination support.

## Authentication

Authentication is implemented using:

* Email and password
* bcrypt password hashing
* JWT access tokens

Protected endpoints require a valid JWT.

## Testing Strategy

The project uses:

* Integration tests for API endpoints
* Validation testing
* Authentication testing
* Separate development and testing databases

The test suite clears only the dedicated test database.

---

# AI-Assisted Development

The project was developed using AI-assisted development tools.

AI was primarily used for:

* Boilerplate generation
* Test generation
* Refactoring suggestions
* Architectural discussions
* Code review assistance

All generated code was manually reviewed, adapted, and validated through testing.

---

# Known Limitations

* Image uploads are not implemented.
* Real-time updates are not implemented.
* Notifications are not implemented.
* Frontend integration and responsive design are still in progress.

---

# Author

**Shai Kohn**

React Native & Full-Stack Developer

Portfolio: https://shaidev.vercel.app
