window.addEventListener('load', function () {
    setTimeout(function () {
        var loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(function () {
            loadingScreen.style.display = 'none';
        }, 1000); // Match the duration of the fade-out animation
    }, 750);
});

$(document).ready(function() {
    $('#profilePictureInput').on('click').trigger('click');

    $('#profilePictureInput').on('change', function() {
        var formData = new FormData();
        formData.append('profilePicture', $('#profilePictureInput')[0].files[0]);

        $.ajax({
            url: '../backend/upload_profile_picture.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                try {
                    if (typeof response === 'string') {
                        response = JSON.parse(response); // JSON válasz dekódolása
                    }
                    if (response.status === 'success') {
                        var randomParam = new Date().getTime(); // Véletlenszerű paraméter
                        $('#profilePictureDiv').html('<img src="' + response.filePath + '?t=' + randomParam + '" alt="Profilkép" class="img-fluid">');
                    } else {
                        alert(response.message);
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

    // Beállítások kezelése
    document.getElementById('settings_profile').addEventListener('click', function() {
        document.getElementById('profile_form').style.display = 'block';
        document.getElementById('security_form').style.display = 'none';
    });

    document.getElementById('settings_security').addEventListener('click', function() {
        document.getElementById('profile_form').style.display = 'none';
        document.getElementById('security_form').style.display = 'block';
    });
});