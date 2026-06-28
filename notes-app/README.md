# Notes App

## Table of Contents
- [About](#about)
- [Setup](#setup)
- [ENV variables](#env-variables)
- [Usage](#usage)
- [Docker](#docker)
- [CRUD Operations](#crud-operations)
- [Tests](#tests)
- [Migrations](#migrations)
- [ESLint](#eslint)


## About

The example Notes App from the FullStackOpen Part 13, section about Relational Databases.


## Setup

Install the server dependencies
```bash
cd ./notes-app/server && npm install
```

Install the client dependencies
```bash
cd ./notes-app/client && npm install
```


## ENV variables

The `.env` file must contain the following variables scheme
```conf
DATABASE_URL=postgres://<username>:<password>@<hostname>:<port>/notesapp
TEST_DATABASE_URL=postgres://<username>:<password>@<hostname>:<port>/test_notesapp
PORT=3001
SECRET=<insert_your_secret_passphrase_here>
DATABASE_SSL=true
```

- `DATABASE_SSL` should only be set to `false` inside of Docker networks.


## Usage

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


## Docker

### Development build

Features:

- Hot reloading of files for both frontend and backend.

- Containerized PostgreSQL database with persistent data storage inside `/notes-app/psql-data`.

Start the orchestration
```bash
docker compose -f ./docker-compose.dev.yml up --build
```

- API requests on http://localhost:8001/api
- Web UI access on http://localhost:8000

Cleanup
```bash
docker compose -f ./docker-compose.dev.yml down -v
```

#### Database access via Client UI

Access the database with the following credentials

- Username: `admin`
- Password: `admin`
- Database: `notesapp`
- Port: `5433`
- Disable the SSL connection if using tools such as **pgAdmin**

#### Database access via psql

Enter the container
```bash
docker exec -it notesapp-dev-db bash
```

Access psql
```bash
psql -U admin -W -d notesapp
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

**Note**: when running the Docker orchestration, use the proxied Nginx port `8001` for all HTTP requests.

### GET

#### Notes

- Fetch all notes
  ```bash
  curl -X GET http://localhost:3001/api/notes
  ```

- Fetch note by its id
  ```bash
  curl -X GET http://localhost:3001/api/notes/<id>
  ```

- Search for a note
  ```bash
  curl -X GET http://localhost:3001/api/notes?search=<search_term>
  ```

- Filter notes by importance (`true` or `false`)
  ```bash
  curl -X GET http://localhost:3001/api/notes?important=true
  ```

#### Users

- Fetch all users
  ```bash
  curl -X GET http://localhost:3001/api/users
  ```

- Fetch use by its id
  ```bash
  curl -X GET http://localhost:3001/api/users/<id>
  ```

#### Teams

- Fetch all teams
  ```bash
  curl -X GET http://localhost:3001/api/teams
  ```

- Fetch team by its id
  ```bash
  curl -X GET http://localhost:3001/api/teams/<id>
  ```


### POST

- Add a new note (the important field is **optional**, will be set to `false` by default)
  ```bash
  curl -X POST http://localhost:3001/api/notes -H "Content-Type: application/json"  -H "Authorization: Bearer <token>" -d '{ "content":"My first note", "important":true }'
  ```

- Add a new user
  ```bash
  curl -X POST http://localhost:3001/api/users -H "Content-Type: application/json" -d '{ "username":"admin", "name":"Administrator", "password":"admin" }'
  ```

- Logging in
  ```bash
  curl -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{ "username":"admin", "password":"admin" }'
  ```

- Add a new team (**admins only**)
  ```bash
  curl -X POST http://localhost:3001/api/teams -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{ "name":"Team name" }'
  ```

- Add a user to a team (**admins only**)
  ```bash
  curl -X POST http://localhost:3001/api/teams/<id>/users -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{ "username":"user@email.com" }'
  ```


### DELETE

- Remove a note (only the **note owner** can remove it)
  ```bash
  curl -X DELETE http://localhost:3001/api/notes/<id> -H "Authorization: Bearer <token>"
  ```

- Remove a user
  ```bash
  curl -X DELETE http://localhost:3001/api/users/<id>
  ```

- Remove a team (**admins only**)
  ```bash
  curl -X DELETE http://localhost:3001/api/teams/<id> -H "Authorization: Bearer <token>"
  ```

- Remove a user from a team (**admins only**)
  ```bash
  curl -X DELETE http://localhost:3001/api/teams/<id>/users/<user_id> -H "Authorization: Bearer <token>"
  ```


### PUT

- Update the importance of a note
  ```bash
  curl -X PUT http://localhost:3001/api/notes/<id> -H "Content-Type: application/json"  -H "Authorization: Bearer <token>" -d '{ "important":true }'
  ```

- Enable or disable a user from logging in (**admins only**)
  ```bash
  curl -X PUT http://localhost:3001/api/users/<username> -H "Content-Type: application/json"  -H "Authorization: Bearer <token>" -d '{ "disabled":true }'
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

Run only the Notes routes test suites
```bash
npm run test -- ./tests/integration/notes/*
```

Run only the Users routes test suites
```bash
npm run test -- ./tests/integration/users/*
```

Run only the Teams routes test suites
```bash
npm run test -- ./tests/integration/teams/*
```

Run only the Login route test suite
```bash
npm run test -- ./tests/integration/login_route.test.js
```


## Migrations

Undo the last migration
```bash
npm run migration:down
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
