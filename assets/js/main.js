'use strict';

//Pointer Lock
var havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document || 'webkitPointerLockElement' in
    document;

if (havePointerLock) {
    var element = document.body;
    var pointerlockchange = function (event) {
        if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
            controlsEnabled = true;
            controls.enabled = true;
            blocker.style.display = 'none';
        }
        else {
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
}
else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}


function init() {
    //init scene, camera, lights
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth /
        window.innerHeight, 0.1, 1000);
    // camera.position.y = 3;
    light = new THREE.AmbientLight(0xffffff, 0.5);
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    var onKeyDown = function (event) {
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
                jump = true;
                velocity.y = 1;
                break;
            case 80:
                console.log(controls.getObject().position);
                break;
        }
    };
    var onKeyUp = function (event) {
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
    var onClick = function (event) {
        switch (event.button) {
            case 2: // shoot
                socket.emit('shot', 'poof');
                shoot();
                break;
            case 1: // aim
                // socket.emit('shot', 'poof');
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('click', onClick, false);

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

    var distance = 10;

    var Plight = new THREE.PointLight(0xffffff, 0.5, 500, 5);
    light.position.set(0, 1, 0);
    scene.add(Plight);

    //add everything to the scene
    scene.add(light, directionalLight);

    var material = new THREE.LineBasicMaterial({
        color: 0x0000ff,
    });

    const currentMap = 1;

    const spawnPositions = loadMap(currentMap);

    animate();

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
            moveForward: moveForward,
            moveBackward: moveBackward,
            moveRight: moveRight,
            moveLeft: moveLeft,
            Jump: jump,
        });

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
    scene.add(cube);
}

init();

// socket.on("*",function(data){
//     console.log(data);
//     debugger;
// });
socket.on('connect', function () {
    console.log('socketio Connected to server!');
});
socket.on('log', function (data) {
    console.log(data);
});
socket.on('newPlayer', function (player) {
    if (!player.position) return;
    if (clientID) {
        newPlayer(player);
    }
    else {
        clientID = player.id;
    }
});
socket.on('oldPlayers', function (players) {
    for (let player of players) {
        if (!player.position) continue;
        newPlayer(player);
    }
});
socket.on('playerData', function (clients) {
    for (let player of clients) {
        if (!player.position) continue;
        if (player.id === clientID) {
            continue;
        }
        players[player.id].position.set(player.position.x, player.position.y,
            player.position.z);
        players[player.id].rotation.y = player.rotation._y;
    }
});
socket.on('playerDisconnect', function (player) {
    scene.remove(players[player.id]);
    delete players[player.id];
});

function loadMap(mapNumber) {
    var DAELoader = new THREE.ColladaLoader();
    var maps = [{
        position: 'assets/maps/Arena2.dae',
        scale: 8,
        offset: 0,
        lights: [
            {type: ''}
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
            {x: -205, y: 9, z: 25}
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
            {x: 205, y: 9, z: -25}
        ]
    },
        {
            position: 'assets/maps/Arena.dae',
            scale: 0.2,
            offset: 0,
            lights: [
                {type: ''}
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
                {x: -205, y: 9, z: 25}
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
                {x: 205, y: 9, z: -25}
            ]
        },
        {
            position: 'assets/maps/test.dae',
            scale: 100,
            offset: -30,
            spawnPositionsTeam1: [
                {x: 0, y: 0, z: 0}
            ],
            spawnPositionsTeam2: []
        }
    ];

    map = maps[mapNumber];

    // load a resource
    DAELoader.load(map.position,
        function (collada) {
            let scale = map.scale;
            collada.scene.children[0].material = new THREE.MeshLambertMaterial('0xddffdd');
            collada.scene.scale.set(scale, scale, scale);
            collada.scene.rotation.set(-Math.PI / 2, 0, 0);
            collada.scene.position.y = map.offset;
            collada.receiveShadows = true;
            collada.castShadows = true;
            scene.add(collada.scene);
            objects.push(collada.scene);
        }
    );

    let spawnPoint = Math.floor(Math.random() * (map.spawnPositionsTeam1.length));

    controls.getObject().position.x = map.spawnPositionsTeam1[spawnPoint].x;
    controls.getObject().position.y = map.spawnPositionsTeam1[spawnPoint].y;
    controls.getObject().position.z = map.spawnPositionsTeam1[spawnPoint].z;

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
    raycasterFloor.set(controls.getObject().position, new THREE.Vector3(0, -1, 0));
    raycasterRoof.set(controls.getObject().position, new THREE.Vector3(0, 1, 0));
    let intersectsFloor = raycasterFloor.intersectObjects(scene.children, true);
    let intersectsRoof = raycasterRoof.intersectObjects(scene.children, true);

    if (intersectsFloor.length > 0) {
        if (distance > intersectsFloor[0].distance) {
            controls.getObject().translateY((distance - intersectsFloor[0].distance) - 1);
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

    raycasterWallFeet.set(controls.getObject().position.clone().sub(new THREE.Vector3(0, 4, 0)), velocity.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), controls.getObject().rotation.y));
    let intersectsWallFeet = raycasterWallFeet.intersectObjects(scene.children, true);


    if (intersectsWallFeet[0]) {
        if (intersectsWallFeet[0].distance < 5) {
            controls.getObject().translateX(-velocity.x * delta);
            controls.getObject().translateZ(-velocity.z * delta);
        }
    }

    raycasterWallHead.set(controls.getObject().position.clone().add(new THREE.Vector3(0, 4, 0)), velocity.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), controls.getObject().rotation.y));
    let intersectsWallHead = raycasterWallHead.intersectObjects(scene.children, true);


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

function shoot() {
    raycasterShoot.set(controls.getObject().position.clone().sub(new THREE.Vector3(0, 2, 0)), controls.getDirection(new THREE.Vector3(0, 0, -1)));
    let hit = raycasterShoot.intersectObjects(scene.children, true);

    console.log(hit);
}
