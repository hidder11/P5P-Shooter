'use strict';

let timer = 0;

class Weapon {
    constructor(name, model, sound, reloadSound, damage, fireRate, accuracy, isAutomatic,
                reloadTime, magazineSize, recoilVertical, lineLife, lineWidth) {
        this.name = name;
        this.model = model;
        this.sound = sound;
        this.reloadSound = reloadSound;

        this.lineLife = lineLife;
        this.lineWidth = lineWidth;

        this.damage = damage;
        this.fireRate = fireRate;
        this.accuracy = accuracy;
        this.isAutomatic = isAutomatic;
        this.recoilVertical = recoilVertical;

        this.ammo = magazineSize;
        this.magazineSize = magazineSize;
        this.reloadTime = reloadTime;

        updateAmmo(this);

        this.aim = false;
        this.reloading = false;
        this.shooting = false;
    }

    shoot() {
        raycasterShoot.set(controls.getObject().position.clone().sub(new THREE.Vector3(0, 2, 0)),
            controls.getDirection(new THREE.Vector3(0, 0, -1)).sub(this.calcSpread(this.accuracy)));
        let hits = raycasterShoot.intersectObjects(collidables.children, true);
        socket.emit('shot', hits[0].point, hits[0].object.player);
        this.ammo--;
        updateAmmo(this);
        this.addRecoil(this.recoilVertical);
        this.drawTrail(controls.getObject().position.clone().sub(new THREE.Vector3(0, 2, 0)), hits[0].point);
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
            updateAmmo(this);
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
        if (timer <= 0)
            timer = 0;
    }

    drawTrail(startPoint, endPoint) {
        //Line
        var lineMaterial = new MeshLineMaterial({
            color: new THREE.Color(0x0000ff),
            lineWidth: this.lineWidth
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
    toggleAim(object) {
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

    calcSpread(accuracy) {
        var xOffset = (Math.random() * accuracy - accuracy / 2) / 500;
        var yOffset = (Math.random() * accuracy - accuracy / 2) / 500;

        // console.log(xOffset, yOffset);

        return new THREE.Vector3(xOffset, yOffset, 0);
    }

    addRecoil(recoil) {
        if (controls.getObject().children[0].rotation.x < 1.57)
            controls.getObject().children[0].rotation.x += recoil * 0.002;

        // console.log(controls.getObject().children[0].rotation, recoil);
    }

}