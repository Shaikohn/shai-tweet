# ShaiTweet

ShaiTweet is a Twitter/X-inspired social platform built as part of an AI-assisted software engineering challenge.

The project recreates core social networking functionality including authentication, personalized timelines, follows, likes, user profiles, search, and reply threads.

## Features

### Core Features

* User registration and authentication
* Personalized timeline feed
* User profiles
* Follow / Unfollow
* Like / Unlike
* User search
* Pagination
* Reply threads

### Bonus Features

* Reply threads with thread view and parent tweet context

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

## Architecture

The backend follows a layered architecture:

* Controllers
* Services
* Repositories
* PostgreSQL

This separation keeps HTTP concerns, business logic, and database access isolated and easier to test.

## Technical Decisions

### Why React + Express?

React and Express allow rapid iteration while maintaining a clear separation between frontend and backend concerns.

### Timeline Modeling

The feed is generated dynamically from:

* The authenticated user's tweets
* Tweets from followed users

Results are returned in reverse chronological order and support pagination.

### Authentication

Authentication is implemented using:

* Email and password
* bcrypt password hashing
* JWT access tokens

Protected endpoints require a valid JWT.

## Testing Strategy

The project includes:

* Backend integration tests
* Validation tests
* Frontend integration tests
* End-to-end authentication tests
* Dedicated test database

Current backend coverage exceeds 80%.

## AI-Assisted Development

The project was developed using AI-assisted development tools.

AI was used for:

* Boilerplate generation
* Test generation
* Refactoring suggestions
* Architectural discussions
* Code review assistance

All generated code was manually reviewed and validated through testing.

## Known Limitations

* Image uploads are not implemented.
* Real-time updates are not implemented.
* Notifications are not implemented.

## Runbook

See:

RUNBOOK.md

## Author

Shai Kohn

React Native & Full-Stack Developer

Portfolio:
https://shaidev.vercel.app