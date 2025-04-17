$(document).ready(function() {

    //bejelentkezés
    $('#login_form').on('submit', function(event) {
        event.preventDefault();

        let formData = {
            login_username: $('#login_username').val().trim(),
            login_password: $('#login_password').val().trim(),
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
                    $('#verify_form').show().data({ user_id: response.user_id, stay_logged_in: response.stay_logged_in });
                } else {
                    $('#div_loginAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
        });
    });

    //bejelentkezés megerősítő kód ellenőrzése
    $('#verify_form').on('submit', function(event) {
        event.preventDefault();

        let formData = {
            user_id: $(this).data('user_id'),
            verification_code: $('#verification_code').val().trim(),
            stay_logged_in: $(this).data('stay_logged_in')
        };

        $.ajax({
            url: '../backend/verify_code.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    $('#div_verifyAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                    setTimeout(() => window.location.href = '../pages/index', 1500);
                } else {
                    $('#div_verifyAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
        });
    });

    //regisztrálás
    $('#register_form').on('submit', function(e) {
        e.preventDefault();
        
        $.ajax({
            type: 'POST',
            url: '../backend/register.php',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    $('#div_registerAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                    $('#register_form').hide();
                    $('#verify_form_register').show();
                } else {
                    $('#div_registerAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
        });
    });

    //regisztráció megerősítő kód ellenőrzése
    $('#verify_form_register').on('submit', function(e) {
        e.preventDefault();
        
        $.ajax({
            type: 'POST',
            url: '../backend/verify_register.php',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    $('#div_verifyAlert_register').html('<div class="alert alert-success">' + response.message + '</div>');
                    setTimeout(() => {
                        $('#modal_regisztracio').modal('hide');
                        location.reload();
                    }, 2000);
                } else {
                    $('#div_verifyAlert_register').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
        });
    });

    //ha be van jelentkezve akkor ez jelenjen meg a navbarban
    $.ajax({
        url: '../backend/check_login.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'logged_in') {
                let adminLink = response.role >= 1 ? '<li><a class="dropdown-item" href="../pages/admin">Admin Irányítópult</a></li>' : '';
                $('#userMenu').html(`
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Fiók</a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item">${response.username}</a></li>
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