# Notes App

## Table of Contents
- [About](#about)
- [Usage](#usage)
- [Docker](#docker)
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


## ESLint

Enter the server folder
```bash
cd ./server
```

Run ESLint
```bash
npm run lint
```
