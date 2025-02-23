$(document).ready(function() {
    $('#login_form').on('submit', function(event) {
        event.preventDefault();

        var formData = {
            login_username: $('#login_username').val(),
            login_password: $('#login_password').val(),
            stay_logged_in: $('#stay_logged_in').is(':checked')
        };

        $.ajax({
            url: '../backend/login.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    $('#div_loginAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                    $('#login_form').hide();
                    $('#verify_form').show();
                    $('#verify_form').data('user_id', response.user_id);
                    $('#verify_form').data('stay_logged_in', response.stay_logged_in);
                } else {
                    $('#div_loginAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
            }
        });
    });

    $('#verify_form').on('submit', function(event) {
        event.preventDefault();

        var formData = {
            user_id: $('#verify_form').data('user_id'),
            verification_code: $('#verification_code').val(),
            stay_logged_in: $('#verify_form').data('stay_logged_in')
        };

        $.ajax({
            url: '../backend/verify_code.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    $('#div_verifyAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                    // Átirányítás a profil oldalra vagy más oldalra
                    window.location.href = '../pages/index.html';
                } else {
                    $('#div_verifyAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
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
                let adminLink = '';
                if (response.role >= 1) {
                    adminLink = '<li><a class="dropdown-item" href="../pages/admin.html">Admin Irányítópult</a></li>';
                }
                $('#userMenu').html(`
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Fiók</a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="../members/${response.username}.${response.user_id}.html">${response.username}</a></li>
                            ${adminLink}
                            <li><a class="dropdown-item" role="button" data-bs-toggle="modal" data-bs-target="#modal_beallitasok">Beállítások</a></li>
                            <li><a class="dropdown-item" href="../backend/logout.php">Kijelentkezés</a></li>
                        </ul>
                    </li>
                `);
            }
        }
    });
});