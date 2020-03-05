const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')

const {setupWebsocket} = require ('./websocket')
const routes = require('./routes')
const {username, password} = require('./connectionData')

const app = express()
const server = http.Server(app)

setupWebsocket(server)

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0-bxfxz.mongodb.net/week10?retryWrites=true&w=majority`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

app.use(cors());
app.use(express.json())
app.use(routes)

server.listen(3333)