<?php
//admin oldalon felhasználó/vélemény törlése
header('Content-Type: application/json');

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'];
$type = $data['type'];

$response = ['status' => 'error', 'message' => 'Invalid type'];

if ($type === 'user') {
    $stmt = $conn->prepare("DELETE FROM account WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        $response = ['status' => 'success'];
    }
    $stmt->close();
} elseif ($type === 'comment') {
    $stmt = $conn->prepare("DELETE FROM comments WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        $response = ['status' => 'success'];
    }
    $stmt->close();
}

echo json_encode($response);
?>