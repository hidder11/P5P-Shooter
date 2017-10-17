'use strict';

class player{
    id;
    position;
    velocity;
    rotation;
    time;
    moveForward;
    moveBackward;
    moveLeft;
    moveRight;
    jump;
    team;

    constructor(json){
        this.updateFromJSON(json);
    }

    updateFromJSON(json){
        this.id = json.id;
        this.position = json.position;
        this.velocity = json.velocity;
        this.rotation = json.rotation;
        this.time = json.time;
        this.moveForward = json.moveForward;
        this.moveBackward = json.moveBackward;
        this.moveLeft = json.moveLeft;
        this.moveRight = json.moveRight;
        this.jump = json.jump;
        this.team = json.team;
    }

    updatePosition(){

    }
}