'use strict';
// load express server
const express = require('express');
const app = express();

// setup express webserver
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use('/assets', express.static('assets'));
app.use('/node_modules', express.static('node_modules'));
const server = app.listen(3000);

// init socket.io
const io = require('socket.io').listen(server);

let clients = [];
const chatMessages = [];

io.on('connection', function (socket) {
    let client = new Client(socket.id);
    socket.on('checkUsername', function (name) {
        let available = true;
        for (let player of clients) {
            if (player.name == name) {
                available = false;
                break;
            }
        }
        socket.emit('checkUsername', {available: available, name: name});
    });
    socket.on('userName', function (name) {
        client.name = name;
        io.emit('newPlayer', client);
        newPlayer(client);
        socket.emit('oldPlayers', clients);
        clients.push(client);
        socket.player = client;
        sendMessage(client, ' has joined the game.');
        newData(socket);
        scoreUpdate(socket);
    });
    socket.on('disconnect', function (data) {
        if (client.name === '') return;
        io.emit('playerDisconnect', client);
        sendMessage(client, ' has left the game.');
        scene.remove(objects[client.id]);
        delete objects[client.id];
        clients.splice(clients.indexOf(client), 1);
    });
    socket.on('disconnecting', function (data) {
        sendMessage(client, ' is leaving the game.');
    });
    socket.on('playerData', function (data) {
        if (!client.name) return;
        if (!objects[client.id]) {
            io.emit('log', 'Problem with ' + client.name);
            return;
        }
        client.position.set(data.position.x, data.position.y, data.position.z);
        client.rotation = (data.rotation);
        if (data.direction) client.direction = data.direction;
        client.moveLeft = data.moveLeft;
        client.moveRight = data.moveRight;
        client.moveForward = data.moveForward;
        client.moveBackward = data.moveBackward;
        client.jump = data.jump;
        client.weapon = data.weapon;
        objects[client.id].updateMatrixWorld();
    });
    socket.on('shot', function (point, target) {
        if (client.health <= 0) return;
        io.emit('shot', {
            weapon: client.weapon,
            client: client,
            bulletTrial: {
                start: client.position,
                end: point,
            },
        });
        if (target && target !== null) {
            let victim = getClientById(target.id);
            if (!victim) return;
            victim.health -= client.weapon.damage;
            socket.to(victim.id).emit('hit', victim.health);
            if (victim.health <= 0) {
                client.kills++;
                victim.deaths++;
                io.emit('kill', victim, client);
                victim.health = 100;
            }
        }
    });
    socket.on('chatMessage', function (msg) {
        sendMessage(client, msg);
    });
});

// prepend client name before message
function sendMessage(client, msg) {
    chatMessages.push('<span class="chatName">' + client.name + '</span> : ' +
        msg);
    let msgsToSend = chatMessages;
    if (chatMessages.length > 10) {
        msgsToSend = chatMessages.slice(chatMessages.length - 10);
    }
    io.emit('chatMessage', msgsToSend);
}

// update client score every second
function scoreUpdate(socket) {
    socket.emit('scoreUpdate', clients);
    setTimeout(scoreUpdate, 1000, socket);
}

//update client conneted players every 16 miliseconds
function newData(socket) {
    socket.emit('playerData', clients);
    setTimeout(newData, 16, socket);
}

function getClientById(id) {
    for (let client of clients) {
        if (client.id === id) return client;
    }
    return undefined;
}

class Client {
    constructor(id) {
        this.name = '';
        this.id = id;
        // start player far away to prevent pre-join kill/sound
        this.position = new THREE.Vector3(1000, 0, 1000);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = {_x: 0, _y: 0, _z: 0};
        this.direction = new THREE.Vector3(1, 0, 0);
        this.team = 'none';
        this.health = 100;
        this.kills = 0;
        this.deaths = 0;
    }
}
