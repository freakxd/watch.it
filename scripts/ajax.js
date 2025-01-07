$(document).ready(function() {
    $('#login_form').on('submit', function(event) {
        event.preventDefault();
        $.ajax({
            url: '../backend/login.php',
            method: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.status === 'error') {
                    $('#div_loginAlert').html('<div class="alert alert-danger" role="alert">' + response.message + '</div>');
                } else {
                    $('#div_loginAlert').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
                    setTimeout(function() {
                        location.reload();
                    }, 1000);
                }
            }
        });
    });

    $('#register_form').on('submit', function(event) {
        event.preventDefault();
        $.ajax({
            url: '../backend/register.php',
            method: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.status === 'error') {
                    $('#div_registerAlert').html('<div class="alert alert-danger" role="alert">' + response.message + '</div>');
                } else {
                    $('#div_registerAlert').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
                }
            }
        });
    });

    // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
    $.ajax({
        url: '../backend/check_login.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'logged_in') {
                $('#userMenu').html(`
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Fiók</a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="../members/${response.username}.${response.user_id}.html">${response.username}</a></li>
                            <li><a class="dropdown-item" href="../backend/logout.php">Kijelentkezés</a></li>
                        </ul>
                    </li>
                `);
            }
        }
    });
});