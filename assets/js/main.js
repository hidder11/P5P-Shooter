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
var freeCam = false;

var geometry, material, mesh;
var controls;
var objects = [];
var raycaster;
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var camDirection;

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
                break;
            case 67:
                moveDown = true;
                break;
        }
    };
    var onKeyUp = function(event) {
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
    raycaster = new THREE.Raycaster(new THREE.Vector3(),
        new THREE.Vector3(0, -1, 0), 0, 10);
    //load objects
    var loader = new THREE.ObjectLoader();
    table = loader.load('assets/models/pool-table.json', function(table) {
        scene.add(table);
        table.position.x = -0.002;
        table.position.y = -0.842;
        table.position.z = -0.07;
    });

    //add everything to the scene
    scene.add(light, directionalLight);

    var material = new THREE.LineBasicMaterial({
        color: 0x0000ff,
    });
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

    prevTime = time;
    renderer.render(scene, camera);
}