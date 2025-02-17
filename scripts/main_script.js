window.addEventListener('load', function () { //töltőképernyő ne töröld
    setTimeout(function () {
        var loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(function () {
            loadingScreen.style.display = 'none';
        }, 1000);
    }, 750);
});

$(document).ready(function () {
    $('#profilePictureInput').on('click').trigger('click');

    $('#profilePictureInput').on('change', function () {
        var formData = new FormData();
        formData.append('profilePicture', $('#profilePictureInput')[0].files[0]);

        $.ajax({
            url: '../backend/upload_profile_picture.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                try {
                    if (typeof response === 'string') {
                        response = JSON.parse(response); // JSON válasz dekódolása
                    }
                    if (response.status === 'success') {
                        var randomParam = new Date().getTime(); // Véletlenszerű paraméter
                        $('#profilePictureDiv').html('<img src="' + response.filePath + '?t=' + randomParam + '" alt="Profilkép" class="img-fluid">');
                    } else {
                        $('#div_profileAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                    }
                } catch (e) {
                    console.error('JSON parse error: ', e);
                    console.error('Response: ', response);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
            }
        });
    });

    // Beállítások kezelése
    document.getElementById('settings_profile').addEventListener('click', function () {
        document.getElementById('profile_form').style.display = 'block';
        document.getElementById('security_password_form').style.display = 'none';
        document.getElementById('security_email_form').style.display = 'none';
    });

    document.getElementById('settings_security').addEventListener('click', function () {
        document.getElementById('profile_form').style.display = 'none';
        document.getElementById('security_password_form').style.display = 'block';
        document.getElementById('security_email_form').style.display = 'block';
    });

    // Profil név változtatása
    $('#profile_form').on('submit', function(event) {
        event.preventDefault();
        var newUsername = $('#profile_username').val();

        $.ajax({
            url: '../backend/update_profile.php',
            type: 'POST',
            data: { username: newUsername },
            success: function(response) {
                try {
                    response = JSON.parse(response);
                    if (response.status === 'success') {
                        $('#div_profileAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                        if (response.redirect) {
                            setTimeout(function() {
                                window.location.href = response.redirect; // Átirányítás a megadott URL-re 3 másodperc után
                            }, 3000);
                        }
                    } else {
                        $('#div_profileAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                    }
                } catch (e) {
                    console.error('JSON parse error: ', e);
                    console.error('Response: ', response);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
            }
        });
    });

    // Jelszó változtatása
    $('#security_password_form').on('submit', function (event) {
        event.preventDefault();
        var oldPassword = $('#security_password_old').val();
        var newPassword = $('#security_password_new').val();
        var verificationCode = $('#password_verification_code').val();

        if (verificationCode) {
            $.ajax({
                url: '../backend/security_verification_code.php',
                type: 'POST',
                data: { oldPassword: oldPassword, code: verificationCode },
                success: function (response) {
                    try {
                        response = JSON.parse(response);
                        if (response.status === 'success') {
                            $.ajax({
                                url: '../backend/update_password.php',
                                type: 'POST',
                                data: {
                                    oldPassword: oldPassword,
                                    newPassword: newPassword
                                },
                                success: function (response) {
                                    try {
                                        response = JSON.parse(response);
                                        if (response.status === 'success') {
                                            $('#div_passwordAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                                        } else {
                                            $('#div_passwordAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                                        }
                                    } catch (e) {
                                        console.error('JSON parse error: ', e);
                                        console.error('Response: ', response);
                                    }
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
                                }
                            });
                        } else {
                            $('#div_passwordAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                        }
                    } catch (e) {
                        console.error('JSON parse error: ', e);
                        console.error('Response: ', response);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
                }
            });
        } else {
            $.ajax({
                url: '../backend/security_verification_code.php',
                type: 'POST',
                data: { oldPassword: oldPassword },
                success: function (response) {
                    try {
                        response = JSON.parse(response);
                        if (response.status === 'success') {
                            $('#password_verification_code_div').show();
                            $('#div_passwordAlert').html('<div class="alert alert-success">Megerősítő kódot küldtünk az e-mail címére.</div>');
                        } else {
                            $('#div_passwordAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                        }
                    } catch (e) {
                        console.error('JSON parse error: ', e);
                        console.error('Response: ', response);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
                }
            });
        }
    });

    // E-mail cím változtatása
    $('#security_email_form').on('submit', function (event) {
        event.preventDefault();
        var oldEmail = $('#security_email_old').val();
        var newEmail = $('#security_email_new').val();
        var verificationCode = $('#email_verification_code').val();

        if (verificationCode) {
            $.ajax({
                url: '../backend/security_verification_code.php',
                type: 'POST',
                data: { oldEmail: oldEmail, new_email: newEmail, code: verificationCode },
                success: function (response) {
                    try {
                        response = JSON.parse(response);
                        if (response.status === 'success') {
                            $.ajax({
                                url: '../backend/update_email.php',
                                type: 'POST',
                                data: {
                                    oldEmail: oldEmail,
                                    newEmail: newEmail
                                },
                                success: function (response) {
                                    try {
                                        response = JSON.parse(response);
                                        if (response.status === 'success') {
                                            $('#div_emailAlert').html('<div class="alert alert-success">Az e-mail cím sikeresen megváltozott.</div>');
                                        } else {
                                            $('#div_emailAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                                        }
                                    } catch (e) {
                                        console.error('JSON parse error: ', e);
                                        console.error('Response: ', response);
                                    }
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
                                }
                            });
                        } else {
                            $('#div_emailAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                        }
                    } catch (e) {
                        console.error('JSON parse error: ', e);
                        console.error('Response: ', response);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
                }
            });
        } else {
            $.ajax({
                url: '../backend/security_verification_code.php',
                type: 'POST',
                data: { oldEmail: oldEmail, new_email: newEmail },
                success: function (response) {
                    try {
                        response = JSON.parse(response);
                        if (response.status === 'success') {
                            $('#email_verification_code_div').show();
                            $('#div_emailAlert').html('<div class="alert alert-success">Megerősítő kódot küldtünk az új e-mail címére.</div>');
                        } else {
                            $('#div_emailAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                        }
                    } catch (e) {
                        console.error('JSON parse error: ', e);
                        console.error('Response: ', response);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Hiba történt: ' + textStatus + ' - ' + errorThrown);
                }
            });
        }
    });
});