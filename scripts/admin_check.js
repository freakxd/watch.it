document.addEventListener('DOMContentLoaded', function() {
    $.ajax({
        url: '../backend/check_login.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status !== 'logged_in' || response.role < 1) {
                window.location.href = '../pages/index';
            }
        },
        error: function() {
            window.location.href = '../pages/index';
        }
    });
});