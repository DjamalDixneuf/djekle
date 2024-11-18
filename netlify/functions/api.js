const jsonServer = require('json-server')
const serverless = require('serverless-http')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)

module.exports.handler = serverless(server)