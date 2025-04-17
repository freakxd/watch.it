<?php
//új jelszó beállítása
header('Content-Type: application/json');
require 'db.php';

$new_password = $_POST['new_password'];
$verification_code = $_POST['verification_code'];
$response = ['status' => 'error', 'message' => ''];

if (empty($new_password) || empty($verification_code)) {
    $response['message'] = 'Az új jelszó és a megerősítőkód megadása kötelező.';
    echo json_encode($response);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM account WHERE verification_code = ?");
$stmt->bind_param("i", $verification_code);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($user_id);
    $stmt->fetch();
    $stmt->close();

    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE account SET password = ?, verification_code = NULL WHERE id = ?");
    $stmt->bind_param("si", $hashed_password, $user_id);
    $stmt->execute();
    $stmt->close();

    $response['status'] = 'success';
    $response['message'] = 'A jelszó sikeresen megváltoztatva.';
} else {
    $response['message'] = 'Érvénytelen megerősítőkód.';
}

echo json_encode($response);
?>