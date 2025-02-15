<?php
session_start();
include 'db.php';
require '../vendor/autoload.php'; // PHPMailer autoload

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $verificationCode = rand(100000, 999999);

    // Ellenőrizzük, hogy jelszó vagy e-mail cím változtatásról van-e szó
    if (isset($_POST['new_email'])) {
        $email = $_POST['email'];
        $_SESSION['new_email'] = $_POST['new_email'];
        $subject = 'Megerősítő kód az e-mail cím változtatásához';
        $body = "Kedves Felhasználó,<br><br>Az Ön megerősítő kódja az e-mail cím változtatásához: <b>$verificationCode</b><br><br>Üdvözlettel,<br>watch.it";
    } else {
        $userId = $_SESSION['user_id'];
        $sql = "SELECT email FROM account WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($email);
        $stmt->fetch();

        $subject = 'Megerősítő kód a jelszó változtatásához';
        $body = "Kedves Felhasználó,<br><br>Az Ön megerősítő kódja a jelszó változtatásához: <b>$verificationCode</b><br><br>Üdvözlettel,<br>watch.it";
    }

    // Kód mentése az adatbázisba
    $stmt = $conn->prepare("UPDATE account SET verification_code = ? WHERE id = ?");
    $stmt->bind_param("si", $verificationCode, $userId);
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
        $mail->addAddress($email);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;

        $mail->send();
        
        $response['status'] = 'success';
        $response['message'] = 'A megerősítő kódot elküldtük az e-mail címére.';
    } catch (Exception $e) {
        $response['status'] = 'error';
        $response['message'] = 'Hiba történt az e-mail küldése során: ' . $mail->ErrorInfo;
    }
}

echo json_encode($response);
?>