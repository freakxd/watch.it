<?php
header('Content-Type: application/json; charset=UTF-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '../logs/error.log');

include 'db.php';
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$response = array();

try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        session_start();

        $username = trim($_POST['register_username'] ?? '');
        $password = trim($_POST['register_password'] ?? '');
        $email = trim($_POST['register_email'] ?? '');

        if (empty($username) || empty($password)) {
            throw new Exception('Felhasználónév és jelszó megadása kötelező');
        }

        if (strlen($username) < 3) {
            throw new Exception('A felhasználónévnek legalább 3 karakter hosszúnak kell lennie');
        }

        $sql = "SELECT id FROM account WHERE username = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            throw new Exception('A felhasználónév már létezik!');
        }
        $stmt->close();

        $sql = "SELECT id FROM account WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            throw new Exception('Az e-mail cím már létezik!');
        }
        $stmt->close();

        $verification_code = rand(100000, 999999);
        $_SESSION['verification_code'] = $verification_code;
        $_SESSION['register_username'] = $username;
        $_SESSION['register_password'] = $password;
        $_SESSION['register_email'] = $email;

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
            $mail->Subject = 'Regisztrációs megerősítő kód';
            $mail->Body    = "Kedves $username,<br><br>Az Ön regisztrációs megerősítő kódja: <b>$verification_code</b><br><br>Üdvözlettel,<br>watch.it";

            $mail->send();
            $response['status'] = 'success';
            $response['message'] = 'A megerősítő kódot elküldtük az e-mail címére.';
        } catch (Exception $e) {
            throw new Exception('Hiba történt az e-mail küldése során: ' . $mail->ErrorInfo);
        }
    }
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
exit;
?>