window.addEventListener('load', function () {
    setTimeout(function () {
        var loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(function () {
            loadingScreen.style.display = 'none';
        }, 1000); // Match the duration of the fade-out animation
    }, 750);
});

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register_form');
    const registerAlert = document.getElementById('div_registerAlert');
    const registerModal = new bootstrap.Modal(document.getElementById('modal_regisztracio'));
    const loginModal = new bootstrap.Modal(document.getElementById('modal_bejelentkezes'));

    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(registerForm);

        fetch('../backend/register.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    setTimeout(() => {
                        registerModal.hide();
                        loginModal.show();
                    }, 1000); // 1000 ms = 1 másodperc késleltetés
                }
            })
    });
});