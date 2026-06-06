const healthRouter = require('express').Router()

healthRouter.get('/', async (_req, res) => {
  return res.status(200).send('Server is online')
})

module.exports = healthRouter
