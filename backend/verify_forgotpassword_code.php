<?php
//megerősítő kód elfelejtett jelszónál
header('Content-Type: application/json');
require 'db.php';

$verification_code = $_POST['verification_code'];
$response = ['status' => 'error', 'message' => ''];

if (empty($verification_code)) {
    $response['message'] = 'A megerősítőkód megadása kötelező.';
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

    $response['status'] = 'success';
    $response['message'] = 'A megerősítőkód helyes.';
} else {
    $response['message'] = 'Érvénytelen megerősítőkód.';
}

echo json_encode($response);
?>