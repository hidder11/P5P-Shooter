'use strict';
var renderer;
var directionalLight;
var light;
var scene;
var camera;
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var moveDown = false;
var moveUp = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var raycasterFloor;
var raycasterWallFeet;
var raycasterWallHead;
var raycasterRoof;
var map;
const distance = 10;

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var camDirection;
var geometry, material, mesh;
var controls;
var objects = [];
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var camDirection;
var socket = io('shooter.arankieskamp.com');
var clientID;
var players = {};

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
        } else {
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
    //init scene, camera, lights
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth /
        window.innerHeight, 0.1, 1000);
    // camera.position.y = 3;
    light = new THREE.AmbientLight(0xffffff, 0.5);
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);

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
                moveUp = true;
                velocity.y = 1;
                break;
            case 67:
                moveDown = true;
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
                moveUp = false;
                break;
            case 67:
                moveDown = false;
        }
    };
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
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
    var distance = 10;

    //load objects
    var loader = new THREE.ObjectLoader();

    var DAELoader = new THREE.ColladaLoader();
    var maps = [
        ['assets/maps/Arena.dae', 0.2, 0],
        ['assets/maps/test.dae', 100, -30],
        ['assets/maps/CollisionTest.dae', 0.02, 0]
    ];

    var map = maps[0];

    // load a resource
    DAELoader.load(map[0],
        function (collada) {
            let scale = map[1];
            collada.scene.children[0].material = new THREE.MeshPhongMaterial('0xddffdd');
            collada.scene.scale.set(scale, scale, scale);
            collada.scene.rotation.set(-Math.PI / 2, 0, 0);
            collada.scene.position.y = map[2];
            collada.receiveShadows = true;
            collada.castShadows = true;
            scene.add(collada.scene);
            objects.push(collada.scene);
        }
    );

    var Plight = new THREE.PointLight(0xffffff, 0.5, 500, 5);
    light.position.set(140, 1, 48);
    scene.add(Plight);

    //add everything to the scene
    scene.add(light, directionalLight);

    var material = new THREE.LineBasicMaterial({
        color: 0x0000ff,
    });


    geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    geometry.rotateX(-Math.PI / 2);
    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        var vertex = geometry.vertices[i];
        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;
    }
    for (var i = 0, l = geometry.faces.length; i < l; i++) {
        var face = geometry.faces[i];
        face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.3 +
            0.5, Math.random() * 0.25 + 0.75, 0.75);
        face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 +
            0.5, Math.random() * 0.25 + 0.75, 0.75);
        face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 +
            0.5, Math.random() * 0.25 + 0.75, 0.75);
    }
    material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
    mesh = new THREE.Mesh(geometry, material);
    // scene.add(mesh);
    animate();

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var count = 0;

function animate() {
    requestAnimationFrame(animate);
    var time = performance.now();
    var delta = ( time - prevTime ) / 10;
    raycasterFloor.set(controls.getObject().position, new THREE.Vector3(0, -1, 0));
    raycasterRoof.set(controls.getObject().position, new THREE.Vector3(0, 1, 0));
    let intersectsFloor = raycasterFloor.intersectObjects(scene.children, true);
    let intersectsRoof = raycasterRoof.intersectObjects(scene.children, true);


    if (moveForward) velocity.z = -0.4 * delta;
    else if (moveBackward) velocity.z = 0.4 * delta;
    else velocity.z = 0;
    if (moveLeft) velocity.x = -0.4 * delta;
    else if (moveRight) velocity.x = 0.4 * delta;
    else velocity.x = 0;

    if (intersectsFloor.length > 0) {
        if (distance > intersectsFloor[0].distance) {
            controls.getObject().translateY((distance - intersectsFloor[0].distance) - 1);
        }

        if (distance >= intersectsFloor[0].distance && velocity.y <= 0) {
            velocity.y = 0;
        } else if (distance <= intersectsFloor[0].distance && velocity.y === 0) {
            velocity.y -= 0.1;
        }
        else {
            velocity.y -= 0.1;
        }
    }

    if (controls.getObject().position.y < -30) {
        controls.getObject().position.y = 5;
    }

    raycasterWallFeet.set(controls.getObject().position.clone().sub(new THREE.Vector3(0,4,0)), velocity.clone().applyAxisAngle(new THREE.Vector3(0,1,0), controls.getObject().rotation.y));
    let intersectsWallFeet = raycasterWallFeet.intersectObjects(scene.children, true);


    if (intersectsWallFeet[0]) {
        if (intersectsWallFeet[0].distance < 5) {
            console.log('hit');
            controls.getObject().translateX(-velocity.x * delta);
            controls.getObject().translateZ(-velocity.z * delta);
        }
    }

    raycasterWallHead.set(controls.getObject().position.clone().add(new THREE.Vector3(0,4,0)), velocity.clone().applyAxisAngle(new THREE.Vector3(0,1,0), controls.getObject().rotation.y));
    let intersectsWallHead = raycasterWallHead.intersectObjects(scene.children, true);


    if (intersectsWallHead[0]) {
        if (intersectsWallHead[0].distance < 5) {
            console.log('hit');
            controls.getObject().translateX(-velocity.x * delta);
            controls.getObject().translateZ(-velocity.z * delta);
        }
    }

    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().translateY(velocity.y * delta);
    controls.getObject().translateZ(velocity.z * delta);

    if (intersectsRoof.length > 0) {
        if (intersectsRoof[0].distance < 3) {
            velocity.y = Math.abs(velocity.y) * -1;
        }
    }

    socket.emit('playerData',
        {camera: controls.getObject().position, id: clientID});

    prevTime = time;
    renderer.render(scene, camera);
}

function newPlayer(player) {
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var cube = new THREE.Mesh(geometry, material);
    cube.position.x = player.position.x;
    cube.position.y = player.position.y;
    cube.position.z = player.position.z;
    cube.playerID = player.id;
    players[player.id] = cube;
    scene.add(cube);
}

init();
socket.on('log', function (data) {
    console.log(data);
});
socket.on('newPlayer', function (player) {
    if (clientID) {
        newPlayer(player);
    }
    else {
        clientID = player.id;
    }
});
socket.on('oldPlayers', function (players) {
    for (let player of players) {
        newPlayer(player);
    }
});
socket.on('playerData', function (clients) {
    for (let player of clients) {
        if (player.id === clientID) {
            continue;
        }
        players[player.id].position.x = player.position.x;
        players[player.id].position.y = player.position.y;
        players[player.id].position.z = player.position.z;
    }
});
socket.on('playerDisconnect', function (player) {
    scene.remove(players[player.id]);
    delete players[player.id];
});