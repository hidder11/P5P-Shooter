'use strict';

var renderer;
var scene;
var camera;
var listener;
var audioLoader;
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var jump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
let raycasterFloor;
let raycasterWallFeet;
let raycasterWallHead;
let raycasterRoof;

var loader = new THREE.JSONLoader();
var playerMesh;
let weapons = [];
let weapon;

let raycasterShoot;

var map;
const distance = 10;

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var startGame = $('#startGame');
var joinGame = $('#joinContent');
var controls;
var objects = [];
var socket = io('shooter.arankieskamp.com',
    {transports: ['websocket'], upgrade: false});
var clientID;
var players = {};
var joined = false;
var inChat = false;
const username = $('#txtName');
const helpBlock = $('#help');
const chatMsg = $('#m');
var name;
var collidables = new THREE.Object3D({name: 'collidables', type: 'Group'});
var canJump = true;
var health = 100;
var deaths = 0;
var kills = 0;

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