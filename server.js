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
    if (player.direction)
        raycasterShoot.set(player.position, player.direction);
    let hit = raycasterShoot.intersectObjects(scene.children, true);

    return hit[0];
}

io.on('connection', function(socket) {
    socket.on('testKill', function() {
        io.emit('kill', {victim: client, killer: client});
    });
    socket.on('testMapChange', function(mapNumber) {
        io.emit('mapChange', mapNumber);
    });
    socket.emit('oldPlayers', clients);
    let client = new Client(socket.id);
    io.emit('newPlayer', client);
    newPlayer(client);
    clients.push(client);
    socket.on('disconnect', function() {
        io.emit('playerDisconnect', client);
        clients.splice(clients.indexOf(client), 1);
        delete clients[clients.indexOf(client)];
    });
    socket.on('playerData', function(data) {
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
        client.name = data.name;
    });
    socket.on('shot', function() {
        io.emit('shot', {
            weapon: '',
            client: client,
            bulletTrial: {
                origin: client.position,
                endPoint: new THREE.Vector3(0, 0, 0),
            },
        });
        let hit = shoot(client, [objects[client.id]]);
        if (hit) {
            io.emit('kill', {
                victim: hit.object.player,
                killer: client,
            });
        }
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
        this.name = '';
        this.id = id;
        this.position = new THREE.Vector3(0, 0, 0);
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
        this.heath = 100;
        this.kills = 0;
        this.deaths = 0;
    }
}