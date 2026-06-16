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
cd ./server && npm run start
```

Start the Vite server
```bash
cd ./client && npm run dev
```

- API requests on http://localhost:3001/api
- Web UI access on http://localhost:5173

### CLI

Print all available Blogs on the CLI (does not require to start the server)
```bash
npm run cli
```


## Docker

Docker Composer orchestration using Nginx as a reverse proxy for the frontend and backend.

### Development build

Features:

- Hot reloading of files for both frontend and backend.

- Containerized PostgreSQL database, with persistent data stored inside `/blogs-list/psql-data`.

Start the orchestration
```bash
docker compose -f ./docker-compose.dev.yml up --build
```

- API requests on http://localhost:8000/api
- Web UI access on http://localhost:8000

Cleanup
```bash
docker compose -f ./docker-compose.dev.yml down -v
```

#### Database access via Client UI

Access the database with the following credentials

- Username: `admin`
- Password: `admin`
- Database: `blogslist`
- Port: `5432`
- Disable the SSL connection if using tools such as **pgAdmin**

#### Database access via psql

Enter the container
```bash
docker exec -it blogslist-dev-db bash
```

Access psql
```bash
psql -U admin -W -d blogslist
```

- Password: `admin`

### Integration tests

**Note**: the test data is stored temporarily inside a PostgreSQL container.

Run all tests
```bash
docker compose -f ./docker-compose.test.yml up --build --abort-on-container-exit
```

Cleanup
```bash
docker compose -f ./docker-compose.test.yml down -v
```


## CRUD operations

**Note**: when running the Docker orchestration, use proxied Nginx port `8000` for all HTTP requests.

### GET

Fetch all blogs
```bash
curl -X GET http://localhost:3001/api/blogs
```

Fetch all users
```bash
curl -X GET http://localhost:3001/api/users
```

#### Search

- Search by the **blog title**
  ```bash
  curl -X GET http://localhost:3001/api/blogs?title=<search_term>
  ```

- Search by the **author's name**
  ```bash
  curl -X GET http://localhost:3001/api/blogs?author=<search_term>
  ```

- Search by **both** the blog title and author's name
  ```bash
  curl -X GET http://localhost:3001/api/blogs?search=<search_term>
  ```

#### Authors

- Get the number of blogs and total likes per author
  ```bash
  curl -X GET http://localhost:3001/api/authors
  ```


### POST

Create a new blog (likes field is **optional**)
```bash
curl -X POST http://localhost:3001/api/blogs -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{ "title":"My blog", "author":"The blogger", "url":"https://myblog.com", "likes":10 }'
```

Create a new user
```bash
curl -X POST http://localhost:3001/api/users -H "Content-Type: application/json" -d '{ "username":"admin", "name":"Administrator", "password":"admin" }'
```

Logging in
```bash
curl -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{ "username":"admin", "password":"admin" }'
```

### DELETE

Delete a blog
```bash
curl -X DELETE http://localhost:3001/api/blogs/<id> -H "Authorization: Bearer <token>"
```

Delete an user
```bash
curl -X DELETE http://localhost:3001/api/users/<id>
```

### PUT

Update the number of likes of a blog
```bash
curl -X PUT http://localhost:3001/api/blogs/<id> -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{ "likes":10 }'
```


## Tests

### Integration tests

Features:

- Implemented using the standard Node.js testing library with Supertest.

- Covers all major valid, invalid and edge-case inputs relevant to the course's exercise requirements.

Enter the server folder
```bash
cd ./server
```

Run all tests
```bash
npm run test
```

Run only the Blogs routes test suites
```bash
npm run test -- ./tests/integration/blogs/*
```

Run only the Users routes test suites
```bash
npm run test -- ./tests/integration/users/*
```

Run only the Login route test suite
```bash
npm run test -- ./tests/integration/login_route.test.js
```


## ESLint

Enter the server folder
```bash
cd ./server
```

Run ESLint
```bash
npm run lint
```
