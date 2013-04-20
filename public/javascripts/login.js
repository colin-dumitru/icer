(function () {
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://plus.google.com/js/client:plusone.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
})();
function signInCallback(authResult) {
    if (authResult['code']) {
        console.log(authResult);
    } else if (authResult['error']) {
        console.log('There was an error: ' + authResult['error']);
    }
}