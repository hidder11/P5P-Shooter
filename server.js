'use strict';

const express = require('express');
const app = express();
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use('/assets', express.static('assets'));
app.use('/node_modules', express.static('node_modules'));

const fs = require('fs');
const server = app.listen(3000);
const io = require('socket.io').listen(server);
global.THREE = require('three');
global.DOMParser = require('xmldom').DOMParser;
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var clients = [];
let map;
require('http');
var objects = [];
const scene = new THREE.Scene();
const chatMessages = [];

function newPlayer(player) {
    var geometry = new THREE.BoxGeometry(100, 100, 100);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(player.position.x, player.position.y, player.position.z);
    cube.playerID = player.id;
    cube.player = player;
    objects[player.id] = cube;
    scene.add(cube);
}

function shoot(player, object) {
    let raycasterShoot = new THREE.Raycaster();
    raycasterShoot.set(player.sub(new THREE.Vector3(0, 4, 0)),
        player.getDirection(new THREE.Vector3(0, 0, -1)));
    let hits = raycasterShoot.intersectObjects(collidables.children, true);

    console.log(hits);

    // return {victim: hits[0], raycast: raycasterShoot};
}

io.on('connection', function(socket) {
    let client = new Client(socket.id);
    socket.on('checkUsername', function(name) {
        let available = true;
        for (let player of clients) {
            if (player.name == name) {
                available = false;
                break;
            }
        }
        socket.emit('checkUsername', {available: available, name: name});
    });
    socket.on('userName', function(name) {
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
    socket.on('disconnect', function(data) {
        if (client.name === '') return;
        io.emit('playerDisconnect', client);
        sendMessage(client, ' has left the game.');
        scene.remove(objects[client.id]);
        delete objects[client.id];
        clients.splice(clients.indexOf(client), 1);
    });
    socket.on('disconnecting', function(data) {
        sendMessage(client, ' is leaving the game.');
    });
    socket.on('chatMessage', function(msg){
        console.log('message: ' + msg);
    });
    socket.on('playerData', function(data) {
        if (!client.name) return;
        objects[client.id].position.set(data.position.x, data.position.y,
            data.position.z);
        objects[client.id].rotation.set(data.rotation.x, data.rotation.y,
            data.rotation.z);
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
    socket.on('shot', function(point, target) {
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
    socket.on('chatMessage', function(msg) {
        sendMessage(client, msg);
    });
    socket.on('chatLog', function() {
        socket.emit('chatLog', chatMessages);
    });
    socket.on('log', function(data) {
        console.log(data);
    });
    socket.on('logPlayers', function(data) {
        socket.emit('log', clients);
    });
    socket.on('logMe', function() {
        socket.emit('log', getClientById(client.id));
    });
});

function sendMessage(client, msg) {
    chatMessages.push('<span class="chatName">' + client.name + '</span> : ' +
        msg);
    let msgsToSend = chatMessages;
    if (chatMessages.length > 10) {
        msgsToSend = chatMessages.slice(chatMessages.length - 10);
    }
    io.emit('chatMessage', msgsToSend);
}

function scoreUpdate(socket) {
    socket.emit('scoreUpdate', clients);
    setTimeout(scoreUpdate, 1000, socket);
}

function newData(socket) {
    socket.emit('playerData', clients);
    setTimeout(newData, 1, socket);
}

class Client {
    constructor(id) {
        this.name = '';
        this.id = id;
        this.position = new THREE.Vector3(1000, 0, 1000);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = {_x: 0, _y: 0, _z: 0};
        this.direction = new THREE.Vector3(1, 0, 0);
        this.time = Date.now();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.jump = false;
        this.team = 'none';
        this.health = 100;
        this.kills = 0;
        this.deaths = 0;
    }
}

function getClientById(id) {
    for (let client of clients) {
        if (client.id === id) return client;
    }
    return undefined;
}
