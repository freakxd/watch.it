<?php
session_start();
include 'db.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['login_username'];
    $password = $_POST['login_password'];

    $sql = "SELECT id, username, password, role FROM account WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id, $username, $hashed_password, $role);
    $stmt->fetch();

    if ($stmt->num_rows > 0 && password_verify($password, $hashed_password)) {
        $_SESSION['user_id'] = $id;
        $_SESSION['username'] = $username;
        switch ($role) {
            case 0:
                $_SESSION['role'] = 'Felhasználó';
                break;
            case 1:
                $_SESSION['role'] = 'Moderátor';
                break;
            case 2:
                $_SESSION['role'] = 'Admin';
                break;
            case 3:
                $_SESSION['role'] = 'Fejlesztő';
                break;
            case 4:
                $_SESSION['role'] = 'Tulajdonos';
                break;
            default:
                $_SESSION['role'] = 'Ismeretlen';
                break;
        }
        $response['status'] = 'success';
        $response['message'] = 'Sikeres bejelentkezés';
        $response['username'] = $username;
        $response['role'] = $_SESSION['role'];
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Hibás felhasználónév vagy jelszó. Regisztálj <a style="text-decoration: underline;" href="#" role="button" data-bs-toggle="modal" data-bs-target="#modal_regisztracio"> itt. </a>';
    }

    $stmt->close();
    $conn->close();
}

echo json_encode($response);
?>