# Brandie Backend Engineer Assignment

This repository contains the backend implementation for a minimal social media application, built to satisfy the requirements of the **Brandie Backend Engineer Assignment**. The solution is implemented using **Node.js**, **TypeScript**, **GraphQL**, and **PostgreSQL**.

All core functionality—User Authentication, Social Graph Management (Follow/Unfollow), Posting, and Timeline Retrieval—has been completed and validated using a **Test-Driven Development (TDD)** methodology.

---

## Core Features Implemented

The application supports the following functionality, verified by a comprehensive suite of unit and integration tests:

| Capability | GraphQL Operation | Description |
|------------|-------------------|-------------|
| **User Authentication** | `Mutation.createUser`, `Mutation.login` | Handles user creation, password hashing (bcrypt), and session management via JWT. |
| **User Graph** | `Mutation.followUser`, `Mutation.unfollowUser`, `Query.followers`, `Query.following` | Manages the social graph (who follows whom) using a dedicated Relation table in the database. |
| **Posting** | `Mutation.createPost`, `Query.posts` | Allows authenticated users to create text/media posts and retrieve a list of posts by any single user. |
| **Timeline Feed** | `Query.timeline` | Retrieves an authenticated user's chronological feed, combining their own posts and posts from all users they follow. |

---

## 🚀 Getting Started

This application is fully Dockerized for ease of local setup and deployment.

### Prerequisites

- Docker and Docker Compose installed
- Node.js environment (for running tests)

### 1. Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/scodder70/brandie_backend
cd brandie-backend
npm install
```

### 2. Configure Environment Variables

Create a local `.env` file based on the example provided. This file defines database credentials, JWT secrets, and port configurations.

```bash
cp .env.example .env
# Edit .env to set secure JWT_SECRET and confirm database URLs
```

### 3. Start the Database and Run Migrations

Use Docker Compose to start the PostgreSQL database and then run Prisma's initialization sequence.

```bash
# Start the Postgres container (defined in docker-compose.yml)
docker-compose up -d

# Generate Prisma Client and apply migrations
npx prisma migrate dev --name init
```

### 4. Run the Backend

Start the development server:

```bash
npm run dev
```

The GraphQL server will be available at: **http://localhost:4000/**

### 5. Run Tests (Mandatory Validation)

All code was developed using TDD. To ensure the current state is stable:

```bash
npm test
```

---

## 🧠 Design and Architectural Decisions

### 1. TDD and Project Structure

- **Methodology**: The entire project was built using **Test-Driven Development (TDD)**. All business logic exists within Service classes (e.g., `UsersService`), which are covered by database-heavy Integration Tests (`*.spec.ts`). The API layer (resolvers) are covered by lightweight Unit Tests (`*.resolver.spec.ts`) that mock the services. This clearly separates business logic from API plumbing.

- **Modularity**: The application is organized by GraphQL modules (`users`, `posts`, `follow`) to maintain a clear separation of concerns.

### 2. Technology Choices

| Choice | Rationale |
|--------|-----------|
| **GraphQL (Apollo Server)** | Chosen over REST for its efficiency (fetching only required fields) and its power in querying graph-like data structures like the social feed and nested post authors. |
| **PostgreSQL 15 + Prisma** | PostgreSQL is a robust, ACID-compliant choice. Prisma is used as the ORM, simplifying schema management, migration, and the complex nested queries (like the `getTimeline` logic). |
| **Authentication** | JSON Web Tokens (JWT) are used for a lightweight, stateless authentication scheme. This simplifies scaling compared to stateful session cookies, requiring only the token to be present in the `Authorization: Bearer <token>` header. |

### 3. Data Modeling (`prisma/schema.prisma`)

- **Explicit Relation Table**: Instead of a simple many-to-many relationship, an explicit `Relation` table was created. This approach allows for scalability and future features (e.g., adding a `pending` status for private accounts, or a timestamp for tracking follow duration).

- **Timeline Optimization**: The `PostsService.getTimeline` function uses a highly optimized single database query (`prisma.post.findMany` with an `IN` operator) to fetch all required posts and order them chronologically, minimizing round trips and ensuring efficiency for feed retrieval.

---

## 🚧 Trade-offs and Future Improvements

- **N+1 Resolution**: To fully complete the GraphQL data model, a resolver for `Post.author` is technically required. Currently, the Post schema defines the `author: User!` field, but the Apollo Server is not explicitly told how to fetch the User object for every returned post. This usually involves defining a Post field resolver which would call `UsersService.findUserById`. This was left as the last logical step outside the core requirements.

- **Security Headers/Rate Limiting**: Production-ready APIs would require implementing rate limiting on the `login` and `createUser` mutations, and configuring HTTP security headers in the Apollo Server setup.

---

## 📄 License

This project is created as part of the Brandie Backend Engineer Assignment.