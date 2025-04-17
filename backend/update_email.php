<?php
//email-cím módosítása
header('Content-Type: application/json');
session_start();
include 'db.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $userId = $_SESSION['user_id'];
    $oldEmail = $_POST['oldEmail'];
    $newEmail = $_POST['newEmail'];

    $sql = "SELECT email FROM account WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($currentEmail);
    $stmt->fetch();

    if ($stmt->num_rows > 0 && $currentEmail === $oldEmail) {
        $stmt->close();

        $sql = "UPDATE account SET email = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $newEmail, $userId);
        if ($stmt->execute()) {
            $response['status'] = 'success';
            $response['message'] = 'Az e-mail cím sikeresen megváltozott.';
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Nem sikerült frissíteni az e-mail címet.';
        }
    } else {
        $response['status'] = 'error';
        $response['message'] = 'A megadott régi e-mail cím nem egyezik a jelenlegi e-mail címmel.';
    }

    $stmt->close();
}

echo json_encode($response);
?>