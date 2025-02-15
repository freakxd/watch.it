<?php
session_start();
include 'db.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_SESSION['user_id'])) {
        $response['status'] = 'error';
        $response['message'] = 'Felhasználó ID hiányzik';
        echo json_encode($response);
        exit();
    }

    $userId = $_SESSION['user_id'];
    $oldPassword = $_POST['oldPassword'];
    $newPassword = $_POST['newPassword'];

    $sql = "SELECT password FROM account WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($hashedPassword);
    $stmt->fetch();

    if ($stmt->num_rows > 0) {
        if (password_verify($oldPassword, $hashedPassword)) {
            $newHashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $sql = "UPDATE account SET password = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("si", $newHashedPassword, $userId);
            if ($stmt->execute()) {
                $response['status'] = 'success';
                $response['message'] = 'A jelszó sikeresen megváltozott';
            } else {
                $response['status'] = 'error';
                $response['message'] = 'Nem sikerült frissíteni a jelszót';
            }
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Helytelen régi jelszó';
        }
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Felhasználó nem található';
    }

    $stmt->close();
}

echo json_encode($response);
?>