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

let weapons = [];
let weapon;

let raycasterShoot;

var map;
const distance = 10;

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('startGame');
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