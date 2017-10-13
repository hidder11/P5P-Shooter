'use strict';

//TODO fix cors

const express = require('express');
const app = express();
app.get('/', function(req, res) {
    res.sendfile('index.html');
});
app.use('/assets', express.static('assets'));
app.use('/node_modules', express.static('node_modules'));

const server = app.listen(3000);
const io = require('socket.io').listen(server);
const THREE = require('three');
var clients = [];

io.on('connection', function(socket) {
    socket.emit('oldPlayers', clients);
    let client = new Client(socket.id);
    io.emit('newPlayer', client);
    clients.push(client);
    socket.on('disconnect', function(socket) {
        io.emit('playerDisconnect', client);
        clients.splice(clients.indexOf(client), 1);
        delete clients[clients.indexOf(client)];
    });
    socket.on('playerData', function(data) {
        client.position = (data.position);
        client.rotation = (data.rotation);
        client.moveLeft = data.moveLeft;
        client.moveRight = data.moveRight;
        client.moveForward = data.moveForward;
        client.moveBackward = data.moveBackward;
        client.jump = data.jump;
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
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = {_x: 0, _y: 0, _z: 0};
        this.time = Date.now();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.jump = false;
        this.team = 'none';
    }
}