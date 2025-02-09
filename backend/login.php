<?php
include 'db.php';
require '../vendor/autoload.php'; // PHPMailer autoload

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

    $sql = "SELECT id, password, email FROM account WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($user_id, $hashed_password, $email);
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

    // Kód generálása és e-mail küldése
    $verification_code = rand(100000, 999999); // 6 számjegyű kód generálása
    $stmt = $conn->prepare("UPDATE account SET verification_code = ? WHERE id = ?");
    $stmt->bind_param("si", $verification_code, $user_id);
    $stmt->execute();
    $stmt->close();

    // E-mail küldése a felhasználónak a kóddal
    $mail = new PHPMailer(true);

    try {
        // SMTP beállítások
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; // SMTP szerver címe
        $mail->SMTPAuth = true;
        $mail->Username = 'noreply.watch.it@gmail.com'; // SMTP felhasználónév
        $mail->Password = 'ynzd bgae pokl ukuw'; // Alkalmazásjelszó
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // E-mail beállítások
        $mail->CharSet = 'UTF-8'; // Karakterkódolás beállítása
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