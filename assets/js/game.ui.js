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

var prevHealth = 100;

$('#health').circleProgress({
    value: 1,
    size: 80,
    fill: {
        color: "#ff402f"
    }
});

$('#ammo').circleProgress({
    value: 0.75,
    size: 80,
    fill: {
        color: "#2e67ff"
    }
});

function showKill(killer, victim, weapon) {
    toastr.info(killer + '&nbsp;&nbsp;<i class="fa fa-times" aria-hidden="true"></i>&nbsp;&nbsp;' + victim);
}

function toggleCrosshair(state) {
    if (state) {
        $('#crosshair').show()
    }
    else {
        $('#crosshair').hide()
    }
}

function updateHealth(health) {
    $('#health').circleProgress({animationStartValue: prevHealth, value: health,});
    prevHealth = health;
}

