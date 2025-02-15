<?php
session_start();
include 'db.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $userId = $_SESSION['user_id'];
    $oldEmail = $_POST['security_email_old'];
    $newEmail = $_POST['security_email_new'];

    $sql = "UPDATE account SET email = ? WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $newEmail, $oldEmail);
    if ($stmt->execute()) {
        $response['status'] = 'success';
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Nem sikerült frissíteni az e-mail címet';
    }

    $stmt->close();
}

echo json_encode($response);
?>