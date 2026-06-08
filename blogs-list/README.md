# BlogList

## Table of Contents
- [Running the app](#running-the-app)
- [Docker](#docker)
- [CRUD operations](#crud-operations)
- [Tests](#tests)
- [ESLint](#eslint)


## Running the app

### Setup

Install the server dependencies
```bash
cd ./blogs-list/server && npm install
```

Install the client dependencies
```bash
cd ./blogs-list/client && npm install
```

### Usage

Start the Express server
```bash
npm run start
```

Start the Vite server
```bash
npm run dev
```

- API requests on http://localhost:3001/api
- Web UI access on http://localhost:5173

### CLI

Print all available Blogs on the CLI (does not require to start the server)
```bash
npm run cli
```


## Docker

The app has been orchestrated with Docker Composer using Nginx as a reverse proxy for both the frontend and backend.

### Development build

Build compatible with hot reloading of files
```bash
docker compose -f ./docker-compose.dev.yml up --build
```

- API requests on http://localhost:8000/api
- Web UI access on http://localhost:8000


## CRUD operations

### GET

Fetch all blogs
```bash
curl -X GET http://localhost:3001/api/blogs
```

Fetch all users
```bash
curl -X GET http://localhost:3001/api/users
```

### POST

Create a new blog (likes field is **optional**)
```bash
curl -X POST http://localhost:3001/api/blogs -H "Content-Type: application/json" -d '{ "title":"My blog", "author":"The blogger", "url":"https://myblog.com", "likes":10 }'
```

Create a new user
```bash
curl -X POST http://localhost:3001/api/users -H "Content-Type: application/json" -d '{ "username":"admin", "name":"The admin", "password":"my_passwd" }'
```

Logging in
```bash
curl -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{ "username":"admin", "password":"my_passwd" }'
```

### DELETE

Delete a blog
```bash
curl -X DELETE http://localhost:3001/api/blogs/<id>
```

### PUT

Update the number of likes of a blog
```bash
curl -X PUT http://localhost:3001/api/blogs/<id> -H "Content-Type: application/json" -d '{ "likes":10 }'
```


## Tests

### Backend integration tests

From the root folder of the bloglist app
```bash
npm run test -- ./src/tests/blog_api.test.js
```


## ESLint

Run the server linting
```bash
npm run lint
```
