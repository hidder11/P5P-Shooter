var renderer;
var directionalLight;
var light;
var scene;
var camera;
var moveDown, moveUp, moveRight, moveLeft, moveBackward, moveForward,
    controlsEnabled, sprinting = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var freeCam = false;
var geometry, material, mesh;
var controls;
var objects = [];
var raycaster;

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var camDirection;
var geometry, material, mesh;
var controls;
var objects = [];
var raycaster;
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var camDirection;

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
        } else {
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
} else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

function init() {
    //init scene, camera, lights
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth /
        window.innerHeight, 0.1, 1000);
    // camera.position.y = 3;
    light = new THREE.AmbientLight(0xffffff, 0.2);
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());
    var onKeyDown = function(event) {
        // console.log(event.keyCode);
        switch (event.keyCode) {
            case 16: // shift
                sprinting = true;
                break;
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
                velocity.y = 7.5;
                break;
            case 67:
                moveDown = true;
                break;
        }
    };
    var onKeyUp = function(event) {
        switch (event.keyCode) {
            case 16: // shift
                sprinting = false;
                break;
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
    raycaster = new THREE.Raycaster(new THREE.Vector3(),
        new THREE.Vector3(0, -1, 0), 0, 10);
    //load objects
    var loader = new THREE.ObjectLoader();

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
            0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 +
            0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 +
            0.5, 0.75, Math.random() * 0.25 + 0.75);
    }
    material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

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
    raycaster.ray.origin.copy(controls.getObject().position);
    var intersections = raycaster.intersectObjects(objects);
    var isOnObject = intersections.length > 0;

    if (moveForward) velocity.z = -0.4 * delta;
    else if (moveBackward) velocity.z = 0.4 * delta;
    else velocity.z = 0;
    if (moveLeft) velocity.x = -0.4 * delta;
    else if (moveRight) velocity.x = 0.4 * delta;
    else velocity.x = 0;
    if (controls.getObject().position.y > 10) {
        velocity.y -= 0.49 * delta;
    }
    else {
        controls.getObject().position.y = 10;
        if (velocity.y < 0) velocity.y = 0;
    }

    if (sprinting) {
        velocity.x *= 2;
        velocity.z *= 2;
    }

    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().translateY(velocity.y * delta);
    controls.getObject().translateZ(velocity.z * delta);

    prevTime = time;
    renderer.render(scene, camera);
}

init();