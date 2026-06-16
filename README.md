# ShaiTweet

ShaiTweet is a Twitter/X-inspired social platform built as part of an AI-assisted software engineering challenge.

## About

This project recreates the core Twitter/X experience, including authentication, timelines, social interactions, user profiles, image uploads, and reply threads.

The goal is not only to deliver a functional application, but also to demonstrate software architecture decisions, testing practices, development workflow, and effective use of AI-assisted development tools.

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Redux Toolkit
* RTK Query

### Backend

* Node.js
* Express
* PostgreSQL
* JWT Authentication
* bcrypt

### Testing

* Vitest
* Supertest
* React Testing Library
* Playwright

## Environment Variables

### Backend

Create a `.env` file inside `/backend` using the provided `.env.example` template.

| Variable          | Description                    |
| ----------------- | ------------------------------ |
| PORT              | Backend server port            |
| DATABASE_HOST     | PostgreSQL host                |
| DATABASE_PORT     | PostgreSQL port                |
| DATABASE_NAME     | Database name                  |
| DATABASE_USER     | Database user                  |
| DATABASE_PASSWORD | Database password              |
| JWT_SECRET        | Secret used to sign JWT tokens |
| CLIENT_URL        | Frontend URL for CORS          |

### Frontend

Create a `.env` file inside `/frontend` using the provided `.env.example` template.

| Variable     | Description          |
| ------------ | -------------------- |
| VITE_API_URL | Backend API base URL |

## Project Status

> Progress reflects backend implementation and test coverage. Frontend integration will be tracked separately.

### Core Features

* [x] User Registration
* [x] Login / Logout
* [x] Protected Routes
* [ ] User Profile
* [x] Create Tweet
* [x] Delete Tweet
* [x] Timeline Feed
* [ ] Infinite Scroll / Pagination
* [x] Follow / Unfollow
* [x] Like / Unlike
* [x] Followers & Following Lists
* [x] User Search

### Backend API Progress

* [x] User Registration
* [x] Login
* [x] JWT Authentication
* [x] Current User (/me)
* [x] User Timeline
* [x] Personalized Feed
* [x] Create Tweet
* [x] Delete Tweet
* [x] Like Tweet
* [x] Unlike Tweet
* [x] Follow User
* [x] Unfollow User
* [x] Followers List
* [x] Following List
* [x] User Search
* [x] Integration Tests for all implemented endpoints

### Bonus Features

* [ ] Image Uploads
* [ ] Reply Threads

### Quality & Delivery

* [ ] Backend Test Coverage > 80%
* [ ] Frontend Integration Tests
* [ ] End-to-End Authentication Test
* [ ] Seed Data
* [ ] Complete Runbook
* [ ] Technical Documentation
* [ ] Responsive Design


## Author

**Shai Kohn**

React Native & Full-Stack Developer

Portfolio: https://shaidev.vercel.app/