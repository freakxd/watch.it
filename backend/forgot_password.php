<?php
//elfelejtett jelszó
header('Content-Type: application/json');
require 'db.php';
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$email = $_POST['forgotpassword_email'];
$response = ['status' => 'error', 'message' => ''];

if (empty($email)) {
    $response['message'] = 'Az e-mail cím megadása kötelező.';
    echo json_encode($response);
    exit;
}

$stmt = $conn->prepare("SELECT id, username FROM account WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $verification_code = rand(100000, 999999);
    $stmt->bind_result($user_id, $username);
    $stmt->fetch();
    $stmt->close();

    $stmt = $conn->prepare("UPDATE account SET verification_code = ? WHERE id = ?");
    $stmt->bind_param("ii", $verification_code, $user_id);
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
        $mail->addAddress($email);
        $mail->isHTML(true);
        $mail->Subject = 'Jelszó visszaállítási kód';
        $mail->Body = "Kedves $username,<br><br>Az Ön megerősítő kódja a jelszó visszaállításához: <b>$verification_code</b><br><br>Üdvözlettel,<br>watch.it";

        $mail->send();
        
        $response['status'] = 'success';
        $response['message'] = 'A megerősítőkód elküldve az e-mail címre.';
    } catch (Exception $e) {
        $response['status'] = 'error';
        $response['message'] = 'Hiba történt az e-mail küldése során: ' . $mail->ErrorInfo;
    }
} else {
    $response['message'] = 'Az e-mail cím nem található.';
}

echo json_encode($response);
?>