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

function updateScore(clients) {
    if (players) {
        let HTMLString = "";
        for (let i = 0; i < clients.length; i++) {
            let player = clients[i];
            HTMLString += "<div class='player' id='" + player.name + "'><span class='playerStanding'>" + (i + 1) + "</span><span class='playerName'>" + player.name + "</span><span class='playerKills'>" + player.kills + "</span><span class='playerDeaths'>" + player.deaths + "</span></div>";
        }
        $('#players').html(HTMLString);
        $('#' + name).addClass('me')
    }
}