// Dependencies
const express = require('express')
const mongoose = require('mongoose')

// Routes
const blogsRouter = require('./controllers/blogs.js')
const usersRouter = require('./controllers/users.js')
const loginRouter = require('./controllers/login.js')
const healthRouter = require('./controllers/health.js')

// Utils
const config = require('./utils/config.js')
const middleware = require('./utils/middleware.js')

const app = express()

mongoose.connect(config.MONGODB_URI)

app.use(express.json())
app.use(middleware.tokenExtractor)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/health', healthRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing.js')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.errorHandler)

module.exports = app
