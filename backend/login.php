<?php
include 'db.php';
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['login_username']);
    $password = trim($_POST['login_password']);
    $stay_logged_in = isset($_POST['stay_logged_in']) ? true : false;

    if (empty($username) || empty($password)) {
        $response['status'] = 'error';
        $response['message'] = 'Felhasználónév és jelszó megadása kötelező';
        echo json_encode($response);
        exit();
    }

    $sql = "SELECT id, password, email, role FROM account WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($user_id, $hashed_password, $email, $role);
    $stmt->fetch();

    if ($stmt->num_rows == 0 || !password_verify($password, $hashed_password)) {
        $response['status'] = 'error';
        $response['message'] = 'Hibás felhasználónév vagy jelszó';
        $stmt->close();
        $conn->close();
        echo json_encode($response);
        exit();
    }

    $stmt->close();

    session_start();
    $_SESSION['user_id'] = $user_id;
    $_SESSION['username'] = $username;
    $_SESSION['role'] = $role;

    $verification_code = rand(100000, 999999);
    $stmt = $conn->prepare("UPDATE account SET verification_code = ? WHERE id = ?");
    $stmt->bind_param("si", $verification_code, $user_id);
    $stmt->execute();
    $stmt->close();

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'noreply.watch.it@gmail.com';
        $mail->Password = 'ynzd bgae pokl ukuw';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->CharSet = 'UTF-8';
        $mail->setFrom('noreply.watch.it@gmail.com', 'watch.it');
        $mail->addAddress($email, $username);
        $mail->isHTML(true);
        $mail->Subject = 'Bejelentkezési kód';
        $mail->Body = "Kedves $username,<br><br>Az Ön bejelentkezési kódja: <b>$verification_code</b><br><br>Üdvözlettel,<br>watch.it";

        $mail->send();
        
        $response['status'] = 'success';
        $response['message'] = 'A bejelentkezési kódot elküldtük az e-mail címére';
        $response['user_id'] = $user_id;
        $response['stay_logged_in'] = $stay_logged_in;
    } catch (Exception $e) {
        $response['status'] = 'error';
        $response['message'] = 'Hiba történt az e-mail küldése során: ' . $mail->ErrorInfo;
    }

    $conn->close();
}

echo json_encode($response);
?>