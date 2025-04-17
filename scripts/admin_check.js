document.addEventListener('DOMContentLoaded', function() {
    $.ajax({
        url: '../backend/check_login.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status !== 'logged_in' || response.role < 1) { //ha nincs bejelentkezve a felhasználó vagy a szerepköre nem admin (nem 1-es) akkor a főoldalra visszadob
                window.location.href = '../pages/index';
            }
        },
        error: function() {
            window.location.href = '../pages/index';
        }
    });
});