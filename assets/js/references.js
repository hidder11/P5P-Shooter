'use strict';

var renderer;
var directionalLight;
var light;
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

let raycasterShoot;
let shotRange = 10000;

var map;
const distance = 10;

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var controls;
var objects = [];
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var socket = io('shooter.arankieskamp.com');
var clientID;
var players = {};
var name = '';