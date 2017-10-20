toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

var prevHealth = 1;
var prevAmmo = 1;

$('#health').circleProgress({
    value: 1,
    size: 80,
    fill: {
        color: "#ff402f"
    }
});

$('#ammo').circleProgress({
    value: 1,
    size: 80,
    fill: {
        color: "#2e67ff"
    }
});

function showKill(killer, victim, weapon) {
    toastr.info(killer + '&nbsp;&nbsp;<i class="fa fa-times" aria-hidden="true"></i>&nbsp;&nbsp;' + victim);
}

function zoomCrosshair(state) {
    if (state) {
        crosshair.addClass('zoom');
    }
    else {
        crosshair.removeClass('zoom');
    }
}

function updateHealth(health) {
    healthMeter.circleProgress({animationStartValue: prevHealth, value: health / 100,});
    $('#healthCount').text(health);
    prevHealth = health / 100;
}

function updateAmmo(weapon) {
    let ammo = weapon.ammo;
    let magSize = weapon.magazineSize;
    if (weapon.reloading) {
        ammoMeter.circleProgress({
            animationStartValue: prevAmmo,
            value: 1,
            animation: {duration: weapon.reloadTime * 10}
        });
    }
    else {
        ammoMeter.circleProgress({animationStartValue: prevAmmo, value: ammo / magSize,});
    }
    ammoMeter.circleProgress({animationStartValue: prevAmmo, value: ammo / magSize,});
    $('#ammoCount').text(ammo);
    prevAmmo = ammo / magSize;
}

function showScore() {
    if (players) {
        Object.keys(players).forEach(function (player) {
            console.log(player);
        });
        for (let player of players) {
            let player = player.player;
            $('#players').append("<li>" + player.name + "</li>");
        }
    }
    scoreOverlay.removeClass("hidden");
}

