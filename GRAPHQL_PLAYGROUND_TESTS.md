# GraphQL Playground Test Collection

All queries below can be copied and pasted directly into GraphQL Playground at `http://localhost:4000/graphql`

## Authentication Setup

For authenticated endpoints, add this header in GraphQL Playground **HTTP HEADERS** tab:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

---

## USER MUTATIONS

### Create User - Successful

```graphql
mutation {
  createUser(input: {
    username: "testuser"
    email: "test@example.com"
    password: "password123"
  }) {
    id
    username
    email
    createdAt
    updatedAt
  }
}
```

### Create User - Duplicate Email (Should Fail)

**Expected Error:** `User with this email or username already exists`

```graphql
mutation {
  createUser(input: {
    username: "testuser2"
    email: "test@example.com"
    password: "password456"
  }) {
    id
    username
    email
  }
}
```

### Create User - Duplicate Username (Should Fail)

**Expected Error:** `User with this email or username already exists`

```graphql
mutation {
  createUser(input: {
    username: "testuser"
    email: "different@example.com"
    password: "password456"
  }) {
    id
    username
    email
  }
}
```

### Login - Successful

**Prerequisites:** Must have created a user with email: `login@example.com`, password: `strongpassword123`

```graphql
mutation {
  login(input: {
    email: "login@example.com"
    password: "strongpassword123"
  }) {
    token
  }
}
```

### Login - Invalid Email (Should Fail)

**Expected Error:** `Invalid email or password`

```graphql
mutation {
  login(input: {
    email: "nonexistent@example.com"
    password: "anypassword"
  }) {
    token
  }
}
```

### Login - Wrong Password (Should Fail)

**Expected Error:** `Invalid email or password`

```graphql
mutation {
  login(input: {
    email: "login@example.com"
    password: "wrongpassword"
  }) {
    token
  }
}
```

---

## POST MUTATIONS

### Create Post - Text Only

**Prerequisites:** Must be authenticated (add JWT token to Authorization header)

```graphql
mutation {
  createPost(input: {
    text: "This is my first post!"
    mediaUrl: null
  }) {
    id
    text
    mediaUrl
    author {
      id
      username
      email
    }
    createdAt
    updatedAt
  }
}
```

### Create Post - With Text and Media

**Prerequisites:** Must be authenticated

```graphql
mutation {
  createPost(input: {
    text: "Check out this image!"
    mediaUrl: "https://example.com/image.jpg"
  }) {
    id
    text
    mediaUrl
    author {
      id
      username
    }
    createdAt
  }
}
```

### Create Post - Without Authentication (Should Fail)

**Expected Error:** `You must be logged in to create a post`

```graphql
mutation {
  createPost(input: {
    text: "This should fail"
    mediaUrl: null
  }) {
    id
    text
  }
}
```

### Create Post - Empty Content (Should Fail)

**Prerequisites:** Must be authenticated

**Expected Error:** `A post must have either text or a media URL.`

```graphql
mutation {
  createPost(input: {
    text: null
    mediaUrl: null
  }) {
    id
    text
  }
}
```

---

## FOLLOW MUTATIONS

### Follow User - Successful

**Prerequisites:** Must be authenticated, target user must exist

**Note:** Replace `USER_ID` with actual user ID

```graphql
mutation {
  followUser(userId: "USER_ID")
}
```

### Follow User - Self (Should Fail)

**Prerequisites:** Must be authenticated

**Expected Error:** `You cannot follow yourself`

**Note:** Replace `YOUR_USER_ID` with your actual user ID

```graphql
mutation {
  followUser(userId: "YOUR_USER_ID")
}
```

### Follow User - Already Following (Should Fail)

**Prerequisites:** Must be authenticated and already following this user

**Expected Error:** `You are already following this user`

```graphql
mutation {
  followUser(userId: "USER_ID")
}
```

### Unfollow User - Successful

**Prerequisites:** Must be authenticated and currently following this user

```graphql
mutation {
  unfollowUser(userId: "USER_ID")
}
```

### Unfollow User - Not Following (Should Fail)

**Prerequisites:** Must be authenticated

**Expected Error:** `You are not following this user`

```graphql
mutation {
  unfollowUser(userId: "USER_ID")
}
```

---

## POST QUERIES

### Get Posts - Retrieve User's Posts

**Note:** Replace `USER_ID` with actual user ID

```graphql
query {
  posts(userId: "USER_ID") {
    id
    text
    mediaUrl
    author {
      id
      username
      email
    }
    createdAt
    updatedAt
  }
}
```

### Get Posts - User With No Posts

**Note:** Replace `USER_ID` with a user that has no posts

**Expected Result:** Empty array `[]`

```graphql
query {
  posts(userId: "USER_ID") {
    id
    text
    author {
      username
    }
  }
}
```

### Get Timeline - Authenticated User's Feed

**Prerequisites:** Must be authenticated (add JWT token to Authorization header)

```graphql
query {
  timeline {
    id
    text
    mediaUrl
    author {
      id
      username
      email
    }
    createdAt
    updatedAt
  }
}
```

### Get Timeline - Without Authentication (Should Fail)

**Expected Error:** `Authentication required`

```graphql
query {
  timeline {
    id
    text
    author {
      username
    }
  }
}
```

---

## FOLLOW QUERIES

### Get Following - Users Someone Follows

**Note:** Replace `USER_ID` with actual user ID

```graphql
query {
  following(userId: "USER_ID") {
    id
    username
    email
    createdAt
  }
}
```

### Get Following - Empty List

**Note:** Replace `USER_ID` with a user that doesn't follow anyone

**Expected Result:** Empty array `[]`

```graphql
query {
  following(userId: "USER_ID") {
    id
    username
  }
}
```

### Get Followers - Users Following Someone

**Note:** Replace `USER_ID` with actual user ID

```graphql
query {
  followers(userId: "USER_ID") {
    id
    username
    email
    createdAt
  }
}
```

### Get Followers - Empty List

**Note:** Replace `USER_ID` with a user that has no followers

**Expected Result:** Empty array `[]`

```graphql
query {
  followers(userId: "USER_ID") {
    id
    username
  }
}
```

---

## COMPLETE TESTING WORKFLOW

Follow these steps in order to test the complete application flow.

### Step 1: Create Test Users

Copy and paste each query one by one.

#### Create User 1

```graphql
mutation {
  createUser(input: {
    username: "user1"
    email: "user1@test.com"
    password: "password123"
  }) {
    id
    username
    email
  }
}
```

**Note:** Copy the returned `id` and save it as `USER_ID_1`

#### Create User 2

```graphql
mutation {
  createUser(input: {
    username: "user2"
    email: "user2@test.com"
    password: "password456"
  }) {
    id
    username
    email
  }
}
```

**Note:** Copy the returned `id` and save it as `USER_ID_2`

#### Create User 3

```graphql
mutation {
  createUser(input: {
    username: "user3"
    email: "user3@test.com"
    password: "password789"
  }) {
    id
    username
    email
  }
}
```

**Note:** Copy the returned `id` and save it as `USER_ID_3`

### Step 2: Login Users and Get JWT Tokens

#### Login User 1

```graphql
mutation {
  login(input: {
    email: "user1@test.com"
    password: "password123"
  }) {
    token
  }
}
```

**Note:** Copy the `token` and save it as `TOKEN_USER_1`. In GraphQL Playground HTTP HEADERS tab, add:
```json
{
  "Authorization": "Bearer TOKEN_USER_1"
}
```

#### Login User 2

```graphql
mutation {
  login(input: {
    email: "user2@test.com"
    password: "password456"
  }) {
    token
  }
}
```

**Note:** Copy the token and save it as `TOKEN_USER_2`

#### Login User 3

```graphql
mutation {
  login(input: {
    email: "user3@test.com"
    password: "password789"
  }) {
    token
  }
}
```

**Note:** Copy the token and save it as `TOKEN_USER_3`

### Step 3: Create Posts as Different Users

Use the appropriate JWT token in Authorization header for each query.

#### User 1 Creates a Post

**Prerequisites:** Use `TOKEN_USER_1` in Authorization header

```graphql
mutation {
  createPost(input: {
    text: "Hello from User 1!"
    mediaUrl: null
  }) {
    id
    text
    author {
      username
    }
    createdAt
  }
}
```

#### User 2 Creates a Post

**Prerequisites:** Switch Authorization header to `TOKEN_USER_2`

```graphql
mutation {
  createPost(input: {
    text: "Post from User 2 with image"
    mediaUrl: "https://example.com/image.jpg"
  }) {
    id
    text
    mediaUrl
    author {
      username
    }
  }
}
```

#### User 3 Creates a Post

**Prerequisites:** Switch Authorization header to `TOKEN_USER_3`

```graphql
mutation {
  createPost(input: {
    text: "User 3 is here!"
    mediaUrl: null
  }) {
    id
    text
    author {
      username
    }
  }
}
```

### Step 4: Create Follow Relationships

#### User 1 Follows User 2

**Prerequisites:** Use `TOKEN_USER_1` in Authorization header. Replace `USER_ID_2` with actual ID

```graphql
mutation {
  followUser(userId: "USER_ID_2")
}
```

#### User 1 Follows User 3

**Prerequisites:** Use `TOKEN_USER_1` in Authorization header. Replace `USER_ID_3` with actual ID

```graphql
mutation {
  followUser(userId: "USER_ID_3")
}
```

#### User 2 Follows User 1

**Prerequisites:** Switch Authorization header to `TOKEN_USER_2`. Replace `USER_ID_1` with actual ID

```graphql
mutation {
  followUser(userId: "USER_ID_1")
}
```

### Step 5: Query Everything

#### Get User 1's Posts

**Note:** Replace `USER_ID_1` with actual user ID. No authentication needed

```graphql
query {
  posts(userId: "USER_ID_1") {
    id
    text
    author {
      username
    }
    createdAt
  }
}
```

#### Get User 1's Timeline

**Prerequisites:** Use `TOKEN_USER_1` in Authorization header

```graphql
query {
  timeline {
    id
    text
    author {
      username
    }
    createdAt
  }
}
```

#### Get Users That User 1 is Following

**Note:** Replace `USER_ID_1` with actual user ID. No authentication needed

```graphql
query {
  following(userId: "USER_ID_1") {
    id
    username
    email
  }
}
```

#### Get Followers of User 1

**Note:** Replace `USER_ID_1` with actual user ID. No authentication needed

```graphql
query {
  followers(userId: "USER_ID_1") {
    id
    username
    email
  }
}
```

---

## Quick Reference

### How to Set Headers in GraphQL Playground

1. Open GraphQL Playground at `http://localhost:4000/graphql`
2. Click the **HTTP HEADERS** tab at the bottom left
3. Paste your header like this:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Authentication required" error | Add JWT token to HTTP HEADERS tab |
| "You must be logged in" error | Login first and copy the token to headers |
| "User with this email or username already exists" | Use different email/username |
| Variables not working | Make sure to use variable syntax and QUERY VARIABLES tab |
| Query not executing | Check syntax - GraphQL is case-sensitive |
