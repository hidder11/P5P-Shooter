'use strict';

let timer = 0;

class Weapon {
    constructor(name, model, sound, reloadSound, damage, fireRate, isAutomatic, reloadTime, magazineSize, recoilVertical, recoilHorizontal, lineLife) {
        this.name = name;
        this.model = model;
        this.sound = sound;
        this.reloadSound = reloadSound;
        this.lineLife = lineLife;

        this.damage = damage;
        this.fireRate = fireRate;
        this.isAutomatic = isAutomatic;
        this.recoilVertical = recoilVertical;
        this.recoilHorizontal = recoilHorizontal;

        this.ammo = magazineSize;
        this.magazineSize = magazineSize;
        this.reloadTime = reloadTime;

        updateAmmo(this.magazineSize, this.magazineSize);

        this.aim = false;
        this.reloading = false;
        this.shooting = false;
    }

    shoot() {
        raycasterShoot.set(controls.getObject().position.clone().sub(new THREE.Vector3(0, 4, 0)), controls.getDirection(new THREE.Vector3(0, 0, -1)));
        let hits = raycasterShoot.intersectObjects(collidables.children, true);

        socket.emit('shot', hits[0].point);
        this.ammo--;
        updateAmmo(this.ammo, this.magazineSize);

        this.drawTrail(controls.getObject().position, hits[0].point);
        this.playSoundAtPlayer(this.sound);
    }

    startShoot() {
        this.shooting = true;
    }

    stopShoot() {
        this.shooting = false;
    }

    update(deltaTime) {
        timer -= deltaTime;
        //reloading
        if (this.ammo <= 0 && timer <= 0 && !this.reloading) {
            timer = this.reloadTime;
            this.reloading = true;
            this.ammo = this.magazineSize;
            this.playSoundAtPlayer(this.reloadSound);
            updateAmmo(this.magazineSize, this.magazineSize);
        }
        //shooting
        if (this.shooting && timer <= 0) {
            this.shoot();
            timer = this.fireRate;
            this.reloading = false;
            if (!this.isAutomatic) {
                this.shooting = false;
            }
        }
    }

    drawTrail(startPoint, endPoint) {
        //Line
        var lineMaterial = new MeshLineMaterial({
            color: new THREE.Color(0x0000ff)
        });
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(startPoint, endPoint);

        var line = new MeshLine();
        line.setGeometry(lineGeometry);

        var mesh = new THREE.Mesh(line.geometry, lineMaterial);
        scene.add(mesh);

        //TODO Look at later for review
        //Particle
        // var numParticles = 20;
        // var particleGeometry = new THREE.Geometry();
        // var particleMaterial = new THREE.PointsMaterial({
        //     map: new THREE.CanvasTexture(generateSprite()),
        //     blending: THREE.AdditiveBlending,
        //     size: 10,
        //     depthTest: true,
        //     transparent: true
        // });
        // particleMaterial.map.needsUpdate = true;
        //
        // var animationPoints = [];
        // for (let i = 0; i <= numParticles; i++) {
        //     var thisPoint = controls.getObject().position.clone().lerp(endPoint, i / numParticles);
        //     animationPoints.push(thisPoint);
        // }
        //
        // for (let i = 0; i < numParticles; i++) {
        //     var desiredIndex = i / numParticles * animationPoints.length;
        //     var rIndex = constrain(Math.floor(desiredIndex), 0, animationPoints.length - 1);
        //     var particle = new THREE.Vector3();
        //
        //     particle = animationPoints[rIndex].clone();
        //     particle.moveIndex = rIndex;
        //     particle.nextIndex = rIndex + 1;
        //
        //     if (particle.nextIndex >= animationPoints.length)
        //         particle.nextIndex = 0;
        //
        //     particle.lerpN = 0;
        //     particle.path = animationPoints;
        //     particleGeometry.vertices.push(particle);
        // }
        //
        // var particles = new THREE.Points(particleGeometry, particleMaterial);
        // particles.sortParticles = true;
        // particles.dynamic = true;

        // scene.add(particles);
        setTimeout(function () {
            scene.remove(mesh);
            // scene.remove(particles);
        }, this.lineLife);
    }

    //TODO movement speed and mouse speed
    toggelAim(object) {
        camera = object.children[0].children[0];

        if (this.aim) {
            this.aim = false;
            camera.fov = 60;
            camera.updateProjectionMatrix();
            zoomCrosshair(false);
        }
        else {
            this.aim = true;
            camera.fov = 30;
            camera.updateProjectionMatrix();
            zoomCrosshair(true);
        }
    }

    playSoundAtPlayer(sound) {
        var shotSound = new THREE.Audio(listener);
        audioLoader.load('assets/sounds/' + sound + '.mp3', function (buffer) {
            shotSound.setBuffer(buffer);
            shotSound.setVolume(0.3);
            shotSound.play();
        });

    }

    playSoundAt(sound, player) {
        var shotSound = new THREE.PositionalAudio(listener);
        audioLoader.load('assets/sounds/' + sound + '.mp3', function (buffer) {
            shotSound.setBuffer(buffer);
            shotSound.setVolume(0.3);
            shotSound.setRefDistance(20);
            shotSound.play();
            player.add(shotSound);
        });
    }
}

function constrain(v, min, max) {
    if (v < min)
        v = min;
    else if (v > max)
        v = max;
    return v;
}

function generateSprite() {
    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    var context = canvas.getContext('2d');
    var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}