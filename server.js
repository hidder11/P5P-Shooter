'use strict';
const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const fs = require('fs');
const THREE = require('Three');
var clients = [];
var clientCounter = 0;

app.listen(3000);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.sockets.on('connection', function(socket) {
    socket.emit('oldPlayers', clients);
    let client = new Client(socket.id);
    clients.push(client);
    io.sockets.emit('newPlayer', client);
    socket.on('disconnect', function(socket) {
        io.sockets.emit('playerDisconnect', client);
        clients.splice(clients.indexOf(client), 1);
    });
    socket.on('playerData', function(data) {
        client.position = data.camera;
    });
    socket.on('log', function(data) {
        console.log(data);
    });
    newData(socket);
});

function newData(socket) {
    socket.emit('playerData', clients);
    setTimeout(function() {
        newData(socket);
    }, 1);
}

class Client {
    constructor(id) {
        this.id = id;
        this.position = {x: 0, y: 0, z: 0};
        this.velocity = {x: 0, y: 0, z: 0};
    }
}