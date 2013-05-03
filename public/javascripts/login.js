(function () {
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://plus.google.com/js/client:plusone.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
})();

function checkForLogin() {
    $.ajax("/loginComplete", {
        type: "POST",
        success: function (data) {
            if (data["done"] == "true") {
                if (data["id"] == null) {
                    handleError();
                } else {
                    handleLoginSuccess();
                }
            }
        }
    });
}

function handleError() {
    $("#loginErrorMessage").text("An error occurred while attempting to login. Please try again.");
    $("#loaderOverlay").fadeOut(300);

}

function handleLoginSuccess() {
    window.location.href = "/"
}

(function () {
    window.setInterval("checkForLogin()", 500);

    $(document).ready(function () {
        $("#gConnect").click(function () {
            $("#loaderOverlay").fadeIn(300);
        });
    });
})();

function signInCallback(authResult) {
    if (authResult['code']) {
        $.ajax("/storeToken", {
            data: JSON.stringify({
                "access_token": authResult["access_token"],
                "token": token
            }),
            contentType: 'application/json; charset=utf-8',
            type: "POST",
            error: function (reason) {
                $("#loginErrorMessage").text("An error occured: " + reason);
            }
        });
    } else if (authResult['error']) {
        if ("immediate_failed" != authResult['error']) {
            $("#loginErrorMessage").text("An error occured: " + authResult['error']);
        }
    }
}
