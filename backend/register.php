<?php
include 'db.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['register_username']);
    $password = trim($_POST['register_password']);

    // Ellenőrizzük, hogy a felhasználónév és a jelszó nem üres
    if (empty($username) || empty($password)) {
        $response['status'] = 'error';
        $response['message'] = 'Felhasználónév és jelszó megadása kötelező';
        echo json_encode($response);
        exit();
    }

    // Ellenőrizzük, hogy a felhasználónév legalább 3 karakter hosszú
    if (strlen($username) < 3) {
        $response['status'] = 'error';
        $response['message'] = 'A felhasználónévnek legalább 3 karakter hosszúnak kell lennie';
        echo json_encode($response);
        exit();
    }

    // Ellenőrizzük, hogy a felhasználónév már létezik-e
    $sql = "SELECT id FROM account WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $response['status'] = 'error';
        $response['message'] = 'A felhasználónév már létezik!';
        $stmt->close();
        $conn->close();
        echo json_encode($response);
        exit();
    }

    $stmt->close();

    // Ha a felhasználónév nem létezik, akkor létrehozzuk az új felhasználót
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO account (username, password) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $hashed_password);

    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;
        $response['status'] = 'success';
        $response['message'] = 'Sikeres regisztráció';

        // Létrehozzuk a felhasználói oldalt
        $template = file_get_contents('../members/username.id.html');
        $new_content = str_replace(['User Name'], [$username], $template);
        // $new_content = str_replace(['User Name', 'User Role'], [$username, 'Felhasználó'], $template);
        $new_filename = "../members/{$username}.{$user_id}.html";
        file_put_contents($new_filename, $new_content);
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Hiba: ' . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}

echo json_encode($response);
?>