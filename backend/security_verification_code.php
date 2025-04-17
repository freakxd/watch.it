<?php
//megerősítő kódok jelszó és email cím változtatásához
header('Content-Type: application/json');
session_start();
include 'db.php';
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $verificationCode = rand(100000, 999999);

    if (isset($_POST['new_email'])) {
        $userId = $_SESSION['user_id'];
        $oldEmail = $_POST['oldEmail'];
        $newEmail = $_POST['new_email'];

        $sql = "SELECT email FROM account WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($currentEmail);
        $stmt->fetch();

        if ($stmt->num_rows > 0 && $currentEmail === $oldEmail) {
            $stmt->close();

            $_SESSION['new_email'] = $newEmail;
            $subject = 'Megerősítő kód az e-mail cím változtatásához';
            $body = "Kedves Felhasználó,<br><br>Az Ön megerősítő kódja az e-mail cím változtatásához: <b>$verificationCode</b><br><br>Üdvözlettel,<br>watch.it";

            $stmt = $conn->prepare("UPDATE account SET verification_code = ? WHERE id = ?");
            $stmt->bind_param("si", $verificationCode, $userId);
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
                $mail->addAddress($newEmail);
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body = $body;

                $mail->send();
                
                $response['status'] = 'success';
                $response['message'] = 'A megerősítő kódot elküldtük az új e-mail címére.';
            } catch (Exception $e) {
                $response['status'] = 'error';
                $response['message'] = 'Hiba történt az e-mail küldése során: ' . $mail->ErrorInfo;
            }
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Helytelen régi e-mail cím';
        }
    } elseif (isset($_POST['oldPassword'])) {
        $userId = $_SESSION['user_id'];
        $oldPassword = $_POST['oldPassword'];

        $sql = "SELECT email, password FROM account WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($email, $hashedPassword);
        $stmt->fetch();

        if ($stmt->num_rows > 0 && password_verify($oldPassword, $hashedPassword)) {
            $subject = 'Megerősítő kód a jelszó változtatásához';
            $body = "Kedves Felhasználó,<br><br>Az Ön megerősítő kódja a jelszó változtatásához: <b>$verificationCode</b><br><br>Üdvözlettel,<br>watch.it";

            $stmt = $conn->prepare("UPDATE account SET verification_code = ? WHERE id = ?");
            $stmt->bind_param("si", $verificationCode, $userId);
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
                $mail->Subject = $subject;
                $mail->Body = $body;

                $mail->send();
                
                $response['status'] = 'success';
                $response['message'] = 'A megerősítő kódot elküldtük az e-mail címére.';
            } catch (Exception $e) {
                $response['status'] = 'error';
                $response['message'] = 'Hiba történt az e-mail küldése során: ' . $mail->ErrorInfo;
            }
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Helytelen régi jelszó';
        }
    }
}

echo json_encode($response);
?>