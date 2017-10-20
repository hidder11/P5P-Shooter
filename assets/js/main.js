'use strict';

//Pointer Lock
var havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document || 'webkitPointerLockElement' in
    document;

if (havePointerLock) {
    var element = document.body;
    var pointerlockchange = function(event) {
        if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
            controlsEnabled = true;
            controls.enabled = true;
            blocker.style.display = 'none';
        }
        else {
            controlsEnabled = false;
            controls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
        }
    };
    var pointerlockerror = function(event) {
        instructions.style.display = '';
    };
    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange,
        false);
    document.addEventListener('pointerlockerror', pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', pointerlockerror,
        false);
    instructions.addEventListener('click', function(event) {
        instructions.style.display = 'none';
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock ||
            element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
    }, false);
}
else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

function init() {
    //init scene, camera, lights
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth /
        window.innerHeight, 0.1, 1000);
    listener = new THREE.AudioListener();
    audioLoader = new THREE.AudioLoader();
    scene.add(collidables);
    camera.add(listener);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    weapon = new Weapon('pistol', '', 'Laser_04', 'Laser_00', 20, 15, true, 200,
        15, 0.1, 0.2, 20);

    var onKeyDown = function(event) {
        if (!controlsEnabled) return;
        // console.log(event.keyCode);
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
            case 32: // space
                if (canJump) {
                    velocity.y = 1;
                    canJump = false;
                }
                break;
            case 80:
                console.log(controls.getObject().position);
                break;
        }
    };
    var onKeyUp = function(event) {
        if (!controlsEnabled) return;
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
            case 32: // space
                jump = false;
                break;
        }
    };
    var onMouseDown = function(event) {
        if (!controlsEnabled) return;
        switch (event.button) {
            case 0: // shoot
                weapon.startShoot();
                break;
            case 2: // aim
                weapon.toggleAim(controls.getObject());
                break;
        }
    };
    var onMouseUp = function (event) {
        if (!controlsEnabled) return;
        switch (event.button) {
            case 0: // shoot
                weapon.stopShoot();
                break;
            case 2: // aim
                weapon.toggleAim(controls.getObject());
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);

    //init rendering
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    raycasterFloor = new THREE.Raycaster();
    raycasterFloor.set(controls.getObject().position, new THREE.Vector3(0, -1, 0));

    raycasterWallFeet = new THREE.Raycaster();
    raycasterWallFeet.set(controls.getObject().position.clone().add(velocity.clone().normalize()), new THREE.Vector3(0, 0, 1));

    raycasterWallHead = new THREE.Raycaster();
    raycasterWallHead.set(controls.getObject().position.clone().add(velocity.clone().normalize()), new THREE.Vector3(0, 0, 1));

    raycasterRoof = new THREE.Raycaster();
    raycasterRoof.set(controls.getObject().position, new THREE.Vector3(0, 1, 0));

    raycasterShoot = new THREE.Raycaster();
    raycasterShoot.set(controls.getObject().position.clone().add(velocity.clone().normalize()), new THREE.Vector3(0, 0, 1));

    const currentMap = 0;

    loadMap(currentMap);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    var time = performance.now();
    var delta = ( time - prevTime ) / 10;

    if (moveForward) velocity.z = -0.4 * delta;
    else if (moveBackward) velocity.z = 0.4 * delta;
    else velocity.z = 0;
    if (moveLeft) velocity.x = -0.4 * delta;
    else if (moveRight) velocity.x = 0.4 * delta;
    else velocity.x = 0;

    checkCollision(delta);

    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().translateY(velocity.y * delta);
    controls.getObject().translateZ(velocity.z * delta);

    socket.emit('playerData',
        {
            id: clientID,
            position: controls.getObject().position,
            rotation: controls.getObject().rotation,
            direction: controls.getDirection(new THREE.Vector3(0, 0, -1)),
            moveForward: moveForward,
            moveBackward: moveBackward,
            moveRight: moveRight,
            moveLeft: moveLeft,
            Jump: jump,
            name: name,
            weapon: weapon,
        });

    weapon.update(delta);

    prevTime = time;
    renderer.render(scene, camera);
}

function newPlayer(player) {
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(player.position.x, player.position.y, player.position.z);
    cube.playerID = player.id;
    players[player.id] = cube;
    cube.player = player;
    collidables.add(cube);
    addPlayerTag(cube);
}

init();

function checkUsername() {
    let name = username.prop('value');
    if (name == '') {
        username.addClass('hasError');
        helpBlock.html('Please enter a username');
    } else {
        socket.emit('checkUsername', name);
    }
}
socket.on('checkUsername', function(data) {
    if (data.available) {
        socket.emit('userName', data.name);
        $('#newPlayer').addClass('hidden');
        $('#startGame').removeClass('hidden');
        $('#crosshair-overlay').removeClass('hidden');
        $('#userStats-overlay').removeClass('hidden');
        joined = true;
        animate();
    }
    else {
        username.addClass('hasError');
        helpBlock.html('Username already in game');
    }
});
socket.on('connect', function() {
    console.log('socketio Connected to server!');
    if (name) {
        socket.emit('checkUsername', name);
    }
});
socket.on('log', function(data) {
    console.log(data);
});
socket.on('newPlayer', function(player) {
    if (!player.position) return;
    if (clientID) {
        newPlayer(player);
    }
    else {
        clientID = player.id;
    }
});
socket.on('oldPlayers', function(players) {
    for (let player of players) {
        if (!player.position) continue;
        newPlayer(player);
    }
});
socket.on('playerData', function(clients) {
    if (!name) {
        for (let player of clients) {
            if (!player.position) continue;
            if (player.id === clientID) {
                deaths = player.deaths;
                kills = player.kills;
                health = player.health;
                continue;
            }
            players[player.id].position.set(player.position.x,
                player.position.y,
                player.position.z);
            players[player.id].rotation.y = player.rotation._y;
            players[player.id].player = player;
        }
    }
});
socket.on('playerDisconnect', function(player) {
    scene.remove(players[player.id]);
    delete players[player.id];
});
socket.on('shot', function(shot) {
    if (clientID == shot.client.id) {
        weapon.playSoundAtPlayer('Laser_02');
    }
    else {
        weapon.playSoundAtPlayer('Laser_04');
        weapon.drawTrail(shot.bulletTrial.start, shot.bulletTrial.end);
    }
    shoot();
});
socket.emit('mapChange', function (map) {
    //console.log(map);
    scene = new THREE.scene;
    const currentMap = 0;
    loadMap(currentMap);
    scene.add(controls.getObject());
});
socket.on('kill', function(victim, killer) {
    showKill(killer.name, victim.name, killer.weapon.name);
    if (victim.id === clientID) {
        respawn();
    }
});
socket.on('hit', function(health) {
    updateHealth(health);
});

function loadMap(mapNumber) {
    var DAELoader = new THREE.ColladaLoader();
    var maps = [
        {
            position: 'assets/maps/Arena-Team.dae',
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
        },
        {
            position: 'assets/maps/Arena.dae',
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
        },
        {
            position: 'assets/maps/test.dae',
            scale: 100,
            offset: -30,
            spawnPositionsTeam1: [
                {x: 0, y: 0, z: 0},
            ],
            spawnPositionsTeam2: [],
        },
    ];

    map = maps[mapNumber];

    // load a resource
    DAELoader.load(map.position,
        function(collada) {
            let scale = map.scale;
            collada.scene.children[0].material = new THREE.MeshLambertMaterial(
                '0xddffdd');
            collada.scene.scale.set(scale, scale, scale);
            collada.scene.rotation.set(-Math.PI / 2, 0, 0);
            collada.scene.position.y = map.offset;
            collada.receiveShadows = true;
            collada.castShadows = true;
            collidables.add(collada.scene);
            objects.push(collada.scene);
        },
    );

    let spawnPoint = Math.floor(Math.random() *
        (map.spawnPositionsTeam1.length));

    respawn();

    var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    var geometry = new THREE.BoxGeometry(1, 1, 1);

    for (var point of map.spawnPositionsTeam1) {
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = point.x;
        mesh.position.y = point.y - 8;
        mesh.position.z = point.z;
        scene.add(mesh);
    }
}

function checkCollision(delta) {
    raycasterFloor.set(controls.getObject().position,
        new THREE.Vector3(0, -1, 0));
    raycasterRoof.set(controls.getObject().position,
        new THREE.Vector3(0, 1, 0));
    let intersectsFloor = raycasterFloor.intersectObjects(collidables.children,
        true);
    let intersectsRoof = raycasterRoof.intersectObjects(collidables.children,
        true);

    if (intersectsFloor.length > 0) {
        if (distance > intersectsFloor[0].distance) {
            controls.getObject().
                translateY((distance - intersectsFloor[0].distance) - 1);
            canJump = true;
        }

        if (distance >= intersectsFloor[0].distance && velocity.y <= 0) {
            velocity.y = 0;
        }
        else if (distance <= intersectsFloor[0].distance && velocity.y === 0) {
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
    let intersectsWallFeet = raycasterWallFeet.intersectObjects(
        collidables.children,
        true);

    if (intersectsWallFeet[0]) {
        if (intersectsWallFeet[0].distance < 5 &&
            intersectsWallFeet[0].object.type === 'Mesh') {
            controls.getObject().translateX(-velocity.x * delta);
            controls.getObject().translateZ(-velocity.z * delta);
        }
    }

    raycasterWallHead.set(
        controls.getObject().position.clone().add(new THREE.Vector3(0, 4, 0)),
        velocity.clone().
            applyAxisAngle(new THREE.Vector3(0, 1, 0),
                controls.getObject().rotation.y));
    let intersectsWallHead = raycasterWallHead.intersectObjects(
        collidables.children,
        true);

    if (intersectsWallHead[0]) {
        if (intersectsWallHead[0].distance < 5 &&
            intersectsWallHead[0].object.type === 'Mesh') {
            controls.getObject().translateX(-velocity.x * delta);
            controls.getObject().translateZ(-velocity.z * delta);
        }
    }

    if (intersectsRoof.length > 0) {
        if (intersectsRoof[0].distance < 3 &&
            intersectsRoof[0].object.type === 'Mesh') {
            velocity.y = Math.abs(velocity.y) * -1;
        }
    }
}

function playSoundAt(sound, player) {
    var shotSound = new THREE.PositionalAudio(listener);
    audioLoader.load('assets/sounds/' + sound + '.mp3', function(buffer) {
        shotSound.setBuffer(buffer);
        shotSound.setVolume(0.3);
        shotSound.setRefDistance(20);
        shotSound.play();
        player.add(shotSound);
    });
}

function playSoundAtPlayer(sound) {
    var shotSound = new THREE.Audio(listener);
    audioLoader.load('assets/sounds/' + sound + '.mp3', function(buffer) {
        shotSound.setBuffer(buffer);
        shotSound.setVolume(0.3);
        shotSound.play();
    });

}

function shoot() {
    raycasterShoot.set(controls.getObject().position,
        controls.getDirection(new THREE.Vector3(0, 0, -1)));
    let hit = raycasterShoot.intersectObjects(scene.children, true);
}

function addPlayerTag(cube) {
    let material = new THREE.SpriteMaterial();

    material.map = makePlayerTag(cube.player.name);
    material.map.needsUpdate = true;

    let tag = new THREE.Sprite(material);

    cube.add(tag);

    tag.position.set(0, 6, 0);
    tag.scale.set(12, 4);
    tag.fog = true;
}

function makePlayerTag(name) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    ctx.font = '64px arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    return new THREE.Texture(canvas);
}

function respawn() {
    let spawnPoint = Math.floor(Math.random() *
        (map.spawnPositionsTeam1.length));

    controls.getObject().position.x = map.spawnPositionsTeam1[spawnPoint].x;
    controls.getObject().position.y = map.spawnPositionsTeam1[spawnPoint].y;
    controls.getObject().position.z = map.spawnPositionsTeam1[spawnPoint].z;

    updateHealth(100);
}