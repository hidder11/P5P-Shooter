'use strict';

let renderer;
let scene;
let camera;
let listener;
let audioLoader;
let controlsEnabled = false;
let prevTime = performance.now();
let velocity = new THREE.Vector3();
let controls;
let raycasterFloor;
let raycasterWallFeet;
let raycasterWallHead;
let raycasterRoof;
let raycasterShoot;
let loader = new THREE.JSONLoader();
let playerMesh;
let weapons = [];
let weapon;
let map;
let objects = [];
let clientID;
let players = {};
let joined = false;
let inChat = false;
let name;
let canJump = true;
let health = 100;
let deaths = 0;
let kills = 0;
let moveForward = false;
let moveLeft = false;
let moveBackward = false;
let moveRight = false;

const username = $('#txtName');
const helpBlock = $('#help');
const chatMsg = $('#m');
const socket = io('shooter.arankieskamp.com', {transports: ['websocket'], upgrade: false});
const distance = 10;
const collidables = new THREE.Object3D({name: 'collidables', type: 'Group'});
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const startGame = $('#startGame');
const joinGame = $('#joinContent');
const ammoMeter = $('#ammo');
const healthMeter = $('#health');
const crosshair = $('#crosshair');
const scoreOverlay = $('#score-overlay');
const ui = $('#ui');

const maps = [
    {
        position: 'assets/maps/Arena-TD.dae',
        scale: 7,
        offset: 0,
        lights: [
            {type: ''},
        ],
        spawnPositionsTeam1: [
            {x: 217, y: 9, z: -95},
            {x: 108, y: 29, z: 1},
            {x: 220, y: 19, z: 105},
            {x: 129, y: 19, z: 101},
            {x: 149, y: 40, z: 68},
            {x: 118, y: 51, z: 39},
            {x: 212, y: 51, z: -55},
        ],
        spawnPositionsTeam2: [
            {x: -217, y: 9, z: -95},
            {x: -108, y: 29, z: 1},
            {x: -220, y: 19, z: 105},
            {x: -129, y: 19, z: 101},
            {x: -149, y: 40, z: 68},
            {x: -118, y: 51, z: 39},
            {x: -212, y: 51, z: -55},
        ],
    },
    {
        position: 'assets/maps/Arena-FFA.dae',
        scale: 7,
        offset: 0,
        lights: [
            {type: ''},
        ],
        spawnPositionsTeam1: [
            {x: -193, y: 10, z: 0},
            {x: -10, y: -10, z: 71},
            {x: -123, y: -10, z: -37},
            {x: 217, y: 9, z: -95},
            {x: 108, y: 30, z: 1},
            {x: 220, y: 20, z: 105},
            {x: 129, y: 21, z: 101},
            {x: 149, y: 41, z: 68},
            {x: 118, y: 52, z: 39},
            {x: 212, y: 52, z: -55},
            {x: -146, y: 10, z: 117},
            {x: -91, y: 10, z: 4},
            {x: -45, y: 55, z: 3},
        ],
    },
];
