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



io.on('connection', function(socket) {
    socket.on('test', function() {
        io.emit('kill', {victim: client, killer: client});
    });
    socket.on('testMap', function() {
        loadMap(1);
    });
    socket.emit('oldPlayers', clients);
    let client = new Client(socket.id);
    io.emit('newPlayer', client);
    clients.push(client);
    socket.on('disconnect', function() {
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
    socket.on('shot', function() {
        io.emit('shot', {
            weapon: '',
            client: client,
            bulletTrial: {
                origin: client.position,
                endPoint: new THREE.Vector3(0, 0, 0),
            },
        });
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

function loadMap(mapNumber) {
    require('./assets/js/ColladaLoader2');
    var DAELoader = new THREE.ColladaLoader();

    var maps = [
        {
            path: 'assets/maps/Arena2.dae',
            scale: 8,
            offset: 0,
            lights: [
                {type: ''},
            ],
            spawnPositionsTeam1: [
                {x: -225, y: 21, z: -135},
                {x: -140, y: 21, z: -90},
                {x: -250, y: 33, z: -35},
                {x: -160, y: 33, z: -25},
                {x: -245, y: 33, z: 115},
                {x: -153, y: 33, z: 70},
                {x: -135, y: 33, z: 145},
                {x: -165, y: 57, z: 22},
                {x: -165, y: 9, z: 110},
                {x: -240, y: 9, z: 145},
                {x: -200, y: 9, z: 65},
                {x: -205, y: 9, z: 25},
            ],
            spawnPositionsTeam2: [
                {x: 225, y: 21, z: 135},
                {x: 140, y: 21, z: 90},
                {x: 250, y: 33, z: 35},
                {x: 160, y: 33, z: 25},
                {x: 245, y: 33, z: -115},
                {x: 153, y: 33, z: -70},
                {x: 135, y: 33, z: -145},
                {x: 165, y: 57, z: -22},
                {x: 140, y: 45, z: -120},
                {x: 165, y: 9, z: -110},
                {x: 240, y: 9, z: -145},
                {x: 200, y: 9, z: -65},
                {x: 205, y: 9, z: -25},
            ],
        }, {
            path: 'assets/maps/Arena.dae',
            scale: 0.2,
            offset: 0,
            lights: [
                {type: ''},
            ],
            spawnPositionsTeam1: [
                {x: -225, y: 21, z: -135},
                {x: -140, y: 21, z: -90},
                {x: -250, y: 33, z: -35},
                {x: -160, y: 33, z: -25},
                {x: -245, y: 33, z: 115},
                {x: -153, y: 33, z: 70},
                {x: -135, y: 33, z: 145},
                {x: -165, y: 57, z: 22},
                {x: -165, y: 9, z: 110},
                {x: -240, y: 9, z: 145},
                {x: -200, y: 9, z: 65},
                {x: -205, y: 9, z: 25},
            ],
            spawnPositionsTeam2: [
                {x: 225, y: 21, z: 135},
                {x: 140, y: 21, z: 90},
                {x: 250, y: 33, z: 35},
                {x: 160, y: 33, z: 25},
                {x: 245, y: 33, z: -115},
                {x: 153, y: 33, z: -70},
                {x: 135, y: 33, z: -145},
                {x: 165, y: 57, z: -22},
                {x: 140, y: 45, z: -120},
                {x: 165, y: 9, z: -110},
                {x: 240, y: 9, z: -145},
                {x: 200, y: 9, z: -65},
                {x: 205, y: 9, z: -25},
            ],
        }, {
            path: 'assets/maps/test.dae',
            scale: 100,
            offset: -30,
            spawnPositionsTeam1: [
                {x: -225, y: 21, z: -135},
                {x: -140, y: 21, z: -90},
                {x: -240, y: 33, z: -40},
                {x: -160, y: 33, z: -25},
                {x: -245, y: 33, z: 115},
                {x: -153, y: 33, z: 70},
                {x: -135, y: 33, z: 145},
                {x: -150, y: 57, z: 15},
                {x: -165, y: 9, z: 110},
                {x: -240, y: 9, z: 145},
                {x: -200, y: 9, z: 65},
                {x: -205, y: 9, z: 25},
            ],
            spawnPositionsTeam2: [],
        },
    ];

    map = maps[mapNumber];
    let mapString = fs.readFileSync('./assets/maps/Arena.dae', 'UTF-8');
    // load a resource
    DAELoader.load(map.path, function(collada) {
            let scale = map.scale;
            collada.scene.children[0].material = new THREE.MeshPhongMaterial(
                '0xddffdd');
            collada.scene.scale.set(scale, scale, scale);
            collada.scene.rotation.set(-Math.PI / 2, 0, 0);
            collada.scene.position.y = map.offset;
            collada.receiveShadows = true;
            collada.castShadows = true;
            scene.add(collada.scene);
            objects.push(collada.scene);
            console.log(map);
        },
    );
    return {
        team1: map['spawnPositionsTeam1'],
        team2: map['spawnPositionsTeam2'],
    };

}

function checkCollision(delta, client) {
    raycasterFloor.set(controls.getObject().position,
        new THREE.Vector3(0, -1, 0));
    raycasterRoof.set(controls.getObject().position,
        new THREE.Vector3(0, 1, 0));
    let intersectsFloor = raycasterFloor.intersectObjects(scene.children, true);
    let intersectsRoof = raycasterRoof.intersectObjects(scene.children, true);

    if (intersectsFloor.length > 0) {
        if (distance > intersectsFloor[0].distance) {
            controls.getObject().
                translateY((distance - intersectsFloor[0].distance) - 1);
        }

        if (distance >= intersectsFloor[0].distance && velocity.y <= 0) {
            velocity.y = 0;
        } else if (distance <= intersectsFloor[0].distance &&
            velocity.y === 0) {
            velocity.y -= 0.1;
        }
        else {
            velocity.y -= 0.1;
        }
    }

    if (controls.getObject().position.y < -30) {
        controls.getObject().position.y = 5;
    }

    raycasterWallFeet.set(
        controls.getObject().position.clone().sub(new THREE.Vector3(0, 4, 0)),
        velocity.clone().
            applyAxisAngle(new THREE.Vector3(0, 1, 0),
                controls.getObject().rotation.y));
    let intersectsWallFeet = raycasterWallFeet.intersectObjects(scene.children,
        true);

    if (intersectsWallFeet[0]) {
        if (intersectsWallFeet[0].distance < 5) {
            controls.getObject().translateX(-velocity.x * delta);
            controls.getObject().translateZ(-velocity.z * delta);
        }
    }

    raycasterWallHead.set(
        controls.getObject().position.clone().add(new THREE.Vector3(0, 4, 0)),
        velocity.clone().
            applyAxisAngle(new THREE.Vector3(0, 1, 0),
                controls.getObject().rotation.y));
    let intersectsWallHead = raycasterWallHead.intersectObjects(scene.children,
        true);

    if (intersectsWallHead[0]) {
        if (intersectsWallHead[0].distance < 5) {
            controls.getObject().translateX(-velocity.x * delta);
            controls.getObject().translateZ(-velocity.z * delta);
        }
    }

    if (intersectsRoof.length > 0) {
        if (intersectsRoof[0].distance < 3) {
            velocity.y = Math.abs(velocity.y) * -1;
        }
    }
}