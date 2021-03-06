'use strict';

//Pointer Lock check
var havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document || 'webkitPointerLockElement' in
    document;

// pointerlock API https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
if (havePointerLock) {
    var element = document.body;
    var pointerlockchange = function (event) {
        if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
            controlsEnabled = true;
            controls.enabled = true;
            blocker.style.display = 'none';
            startGame.removeClass('hidden');
            joinGame.addClass('hidden');
        }
        else if (!inChat) {
            controlsEnabled = false;
            controls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
        }
    };
    var pointerlockerror = function (event) {
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
    instructions.addEventListener('click', function (event) {
        instructions.style.display = 'none';
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock ||
            element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
    }, false);
} else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

function init() {
    //init scene, camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth /
        window.innerHeight, 0.1, 1000);
    listener = new THREE.AudioListener();
    audioLoader = new THREE.AudioLoader();
    scene.add(collidables);
    camera.add(listener);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());
    // preload player model to prevent position errors
    loadPlayer();
    // pistols
    weapons.push(
        new Weapon('pistol1', 'weapon1', 'Laser_04', 'Laser_00', 10, 20, 5, 1, false, 50, 15, 10, 150, 0.2),
        new Weapon('revolver', 'weapon1', 'Laser_02', 'Laser_00', 25, 20, 2, 1, false, 300, 6, 25, 270, 0.4)
    );
    // rifles
    weapons.push(
        new Weapon('SMG', 'weapon1', 'Laser_05', 'Laser_00', 7.5, 10, 30, 1, true, 60, 40, 10, 100, 0.1),
        new Weapon('Assault rifle semi-auto', 'weapon1', 'Laser_01', 'Laser_00', 20, 30, 10, 1.5, false, 50, 20, 15, 300, 0.3),
        new Weapon('Sniper', 'weapon1', 'Laser_10', 'Laser_00', 80, 250, 1, 4, false, 300, 4, 50, 1500, 0.75)
    );
    weapon = weapons[0];

    var onKeyDown = function (event) {

        if (event.keyCode === 13 && inChat) {
            //chat versturen en chat dicht doen
            element.requestPointerLock = element.requestPointerLock ||
                element.mozRequestPointerLock ||
                element.webkitRequestPointerLock;
            element.requestPointerLock();
            controls.enabled = true;
            $('#form').addClass('hidden');
            controlsEnabled = true;
            inChat = false;
        }
        if (!controlsEnabled) return;
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
            case 80: // p
                console.log(controls.getObject().position);
                break;
            case 84: // T
                // chatvenster openen
                inChat = true;
                document.exitPointerLock();
                controls.enabled = false;
                $('#form').removeClass('hidden');
                controlsEnabled = false;
                setTimeout(function () {
                    chatMsg.focus()
                }, 50);
                break;
            case 49: // 1
                updateActiveWeapon(1);
                weapon = weapons[0];
                updateAmmo(weapon);
                break;
            case 50: // 2
                updateActiveWeapon(2);
                weapon = weapons[1];
                updateAmmo(weapon);
                break;
            case 51: // 3
                updateActiveWeapon(3);
                weapon = weapons[2];
                updateAmmo(weapon);
                break;
            case 52: // 4
                updateActiveWeapon(4);
                weapon = weapons[3];
                updateAmmo(weapon);
                break;
            case 53: // 5
                updateActiveWeapon(5);
                weapon = weapons[4];
                updateAmmo(weapon);
                break;
            case 81: // q
                scoreOverlay.removeClass('hidden');
                break;
        }
    };
    var onKeyUp = function (event) {
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
            case 81: // q
                scoreOverlay.addClass('hidden');
                break;
        }
    };
    var onMouseDown = function (event) {
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

    // init rendering
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    raycasterFloor = new THREE.Raycaster();
    raycasterFloor.set(controls.getObject().position,
        new THREE.Vector3(0, -1, 0));

    raycasterWallFeet = new THREE.Raycaster();
    raycasterWallFeet.set(
        controls.getObject().position.clone().add(velocity.clone().normalize()),
        new THREE.Vector3(0, 0, 1));

    raycasterWallHead = new THREE.Raycaster();
    raycasterWallHead.set(
        controls.getObject().position.clone().add(velocity.clone().normalize()),
        new THREE.Vector3(0, 0, 1));

    raycasterRoof = new THREE.Raycaster();
    raycasterRoof.set(controls.getObject().position,
        new THREE.Vector3(0, 1, 0));

    raycasterShoot = new THREE.Raycaster();
    raycasterShoot.set(
        controls.getObject().position.clone().add(velocity.clone().normalize()),
        new THREE.Vector3(0, 0, 1));

    const currentMap = 1;

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
            name: name,
            weapon: weapon
        });

    weapon.update(delta);

    prevTime = time;
    renderer.render(scene, camera);
}

function loadPlayer() {
    loader.load('assets/models/bot.json', function (geometry, material) {
        playerMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(material));
        playerMesh.scale.set(3, 3, 3);
        playerMesh.position.y = -1;
        playerMesh.rotation.set(0, -Math.PI / 2, 0);

    });
}

function newPlayer(player) {
    var mesh = playerMesh.clone();
    mesh.position.set(player.position.x, player.position.y, player.position.z);
    mesh.playerID = player.id;
    players[player.id] = mesh;
    mesh.player = player;
    collidables.add(mesh);
    addPlayerTag(mesh);
}

function checkUsername() {
    let input = username.prop('value');
    if (input === '') {
        username.addClass('hasError');
        helpBlock.html('Please enter a username');
    } else {
        socket.emit('checkUsername', input);
        name = input;
    }
}

function sendMsg() {
    let chmsg = chatMsg.prop('value');
    if (chmsg == '') return;
    clearlist();
    socket.emit('chatMessage', chmsg);
    chatMsg.prop('value', '');
}

function clearlist() {
    $('ul').empty();
}

function loadMap(mapNumber) {
    var DAELoader = new THREE.ColladaLoader();
    map = maps[mapNumber];

    // load a resource
    DAELoader.load(map.position,
        function (collada) {
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
            controls.getObject().translateY((distance - intersectsFloor[0].distance) - 1);
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
        velocity.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0),
            controls.getObject().rotation.y));
    let intersectsWallFeet = raycasterWallFeet.intersectObjects(
        collidables.children,
        true);

    if (intersectsWallFeet[0]) {
        if (intersectsWallFeet[0].distance < 3 + velocity.length() * delta &&
            intersectsWallFeet[0].object.type === 'Mesh') {
            controls.getObject().translateX(-velocity.x * delta);
            controls.getObject().translateZ(-velocity.z * delta);
        }
    }

    raycasterWallHead.set(
        controls.getObject().position.clone().add(new THREE.Vector3(0, 4, 0)),
        velocity.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0),
            controls.getObject().rotation.y));
    let intersectsWallHead = raycasterWallHead.intersectObjects(
        collidables.children,
        true);

    if (intersectsWallHead[0]) {
        if (intersectsWallHead[0].distance < 3 + velocity.length() * delta &&
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

function addPlayerTag(cube) {
    let material = new THREE.SpriteMaterial();

    material.map = makePlayerTag(cube.player.name);
    material.map.needsUpdate = true;

    let tag = new THREE.Sprite(material);

    cube.add(tag);

    tag.position.set(0, 3, 0);
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

init();

socket.on('checkUsername', function (data) {
    if (data.available) {
        socket.emit('userName', data.name);
        $('#menu').addClass('hidden');
        $('#blocker').removeClass('hidden');
        ui.removeClass('hidden');
        joined = true;
        animate();
    }
    else {
        username.addClass('hasError');
        helpBlock.html('Username already in game');
    }
});
socket.on('chatMessage', function (msgs) {
    clearlist();
    for (let msg of msgs) {
        $('#messages').append($('<li>').html(msg));
    }

});
socket.on('connect', function () {
    console.log('socketio Connected to server!');
    if (name && clientID) {
        socket.emit('checkUsername', name);
    }
});
socket.on('log', function (data) {
    console.log(data);
});
socket.on('newPlayer', function (player) {
    if (clientID) {
        newPlayer(player);
    }
    else {
        clientID = player.id;
        respawn();
    }
});
socket.on('oldPlayers', function (players) {
    for (let player of players) {
        if (!player.position) continue;
        newPlayer(player);
    }
});
socket.on('playerData', function (clients) {
    if (joined) {
        for (let player of clients) {
            if (!player) continue;
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
socket.on('playerDisconnect', function (player) {
    collidables.remove(players[player.id]);
    delete players[player.id];
});
socket.on('shot', function (shot) {
    if (clientID !== shot.client.id) {
        weapon.playSoundAt(shot.client.weapon.sound, players[shot.client.id]);
        weapon.drawTrail(shot.bulletTrial.start, shot.bulletTrial.end);
    }
});
socket.on('kill', function (victim, killer) {
    showKill(killer.name, victim.name, killer.weapon.name);
    if (victim.id === clientID) {
        respawn();
    }
});
socket.on('hit', function (health) {
    updateHealth(health);
});
socket.on('scoreUpdate', function (clients) {
    updateScore(clients);
});
