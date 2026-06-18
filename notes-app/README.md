# Notes App

## Table of Contents
- [About](#about)
- [Usage](#usage)
- [Docker](#docker)
- [CRUD Operations](#crud-operations)
- [ESLint](#eslint)


## About

The example Notes App from the FullStackOpen Part 13, section about Relational Databases.


## Usage

Enter the Server folder
```bash
cd ./server
```

Install dependencies
```bash
npm install
```

Production mode
```bash
npm run start
```

Development mode (with hot reloading of files)
```bash
npm run dev
```

API requests on http://localhost:3001/api


## Docker

### Development build

Features:

- Nginx as a reverse proxy for the server.
- Supports hot reloading of files for the backend.
- Containerized PostgreSQL database with persistent data storage inside `/psql-data`.

Start the orchestration
```bash
docker compose -f ./docker-compose.dev.yml up --build
```

- API requests on http://localhost:8001/api

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


## CRUD operations

**Note**: when running the Docker orchestration, use the proxied Nginx port `8001` for all HTTP requests.

### GET

- Fetch all notes
  ```bash
  curl -X GET http://localhost:3001/api/notes
  ```

- Fetch all users
  ```bash
  curl -X GET http://localhost:3001/api/users
  ```

- Search for a note
  ```bash
  curl -X GET http://localhost:3001/api/notes?search=<search_term>
  ```

- Filter notes by importance (`true` or `false`)
  ```bash
  curl -X GET http://localhost:3001/api/notes?important=true
  ```


### POST

- Create a new note (the important field is **optional**, will be set to `false` by default)
  ```bash
  curl -X POST http://localhost:3001/api/notes -H "Content-Type: application/json"  -H "Authorization: Bearer <token>" -d '{ "content":"My first note", "important":true }'
  ```

- Create a new user
  ```bash
  curl -X POST http://localhost:3001/api/users -H "Content-Type: application/json" -d '{ "username":"admin", "name":"Administrator", "password":"admin" }'
  ```

- Logging in
  ```bash
  curl -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{ "username":"admin", "password":"admin" }'
  ```

### DELETE

- Delete a note
  ```bash
  curl -X DELETE http://localhost:3001/api/notes/<id> -H "Authorization: Bearer <token>"
  ```

- Delete an user
  ```bash
  curl -X DELETE http://localhost:3001/api/users/<id>
  ```

### PUT

- Update the importance of a note
  ```bash
  curl -X PUT http://localhost:3001/api/notes/<id> -H "Content-Type: application/json"  -H "Authorization: Bearer <token>" -d '{ "important":true }'
  ```

- **Admin Only**: Enable or disable an user for logging in (`true` or `false`)
  ```bash
  curl -X PUT http://localhost:3001/api/users/<username> -H "Content-Type: application/json"  -H "Authorization: Bearer <token>" -d '{ "disabled":true }'
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
