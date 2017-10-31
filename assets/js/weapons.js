'use strict';

let timer = 0;

class Weapon {
    constructor(name, model, sound, reloadSound, damage, fireRate, accuracy, zoom, isAutomatic,
                reloadTime, magazineSize, recoilVertical, lineLife, lineWidth) {
        this.name = name;
        this.sound = sound;
        this.reloadSound = reloadSound;

        this.lineLife = lineLife;
        this.lineWidth = lineWidth;

        this.damage = damage;
        this.fireRate = fireRate;
        this.accuracy = accuracy;
        this.zoom = zoom;
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
        raycasterShoot.set(controls.getObject().position.clone().sub(new THREE.Vector3(0, 0, 0)),
            controls.getDirection(new THREE.Vector3(0, 0, -1)).sub(this.calcSpread(this.accuracy)));
        let hits = raycasterShoot.intersectObjects(collidables.children, true);
        socket.emit('shot', hits[0].point, hits[0].object.player);
        this.ammo--;
        updateAmmo(this);
        this.addRecoil(this.recoilVertical);
        this.drawTrail(controls.getObject().position.clone().sub(new THREE.Vector3(0, 0, 0)), hits[0].point);
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
            color: new THREE.Color(0x29FF00),
            lineWidth: this.lineWidth,
            transparent: true,
            opacity: 0.2
        });
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(startPoint, endPoint);

        var line = new MeshLine();
        // line.setGeometry(lineGeometry);

        line.setGeometry( lineGeometry, function( p ) { return p * 2; } );

        var mesh = new THREE.Mesh(line.geometry, lineMaterial);
        scene.add(mesh);

        setTimeout(function () {
            scene.remove(mesh);
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
            camera.fov = 60 - (10 * this.zoom);
            camera.updateProjectionMatrix();
            zoomCrosshair(true);
        }
    }

    playSoundAtPlayer(sound) {
        var shotSound = new THREE.Audio(listener);
        audioLoader.load('assets/sounds/' + sound + '.mp3', function (buffer) {
            shotSound.setBuffer(buffer);
            shotSound.setVolume(0.2);
            shotSound.play();
        });

    }

    playSoundAt(sound, player) {
        var shotSound = new THREE.PositionalAudio(listener);
        audioLoader.load('assets/sounds/' + sound + '.mp3', function (buffer) {
            shotSound.setBuffer(buffer);
            shotSound.setVolume(0.3);
            shotSound.setRefDistance(450 -
                controls.getObject().position.distanceTo(player.position));
            shotSound.setMaxDistance(400);
            shotSound.play();
            player.add(shotSound);
        });
    }

    calcSpread(accuracy) {
        var xOffset = (Math.random() * accuracy - accuracy / 2) / 500;
        var yOffset = (Math.random() * accuracy - accuracy / 2) / 500;

        return new THREE.Vector3(xOffset, yOffset, 0);
    }

    addRecoil(recoil) {
        if (controls.getObject().children[0].rotation.x < 1.57)
            controls.getObject().children[0].rotation.x += recoil * 0.002;

    }
}