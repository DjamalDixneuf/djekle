const jsonServer = require('json-server')
const serverless = require('serverless-http')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const express = require('express');
const app = express();

server.use(middlewares)
server.use(router)

module.exports.handler = serverless(server)
