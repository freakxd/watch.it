<?php
header('Content-Type: application/json');

// Adatbázis kapcsolat beillesztése
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'];
$type = $data['type'];

$response = ['status' => 'error', 'message' => 'Invalid type'];

if ($type === 'user') {
    // Felhasználó törlése
    $stmt = $conn->prepare("DELETE FROM account WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        $response = ['status' => 'success'];
    } else {
        $response = ['status' => 'error', 'message' => 'Error deleting user'];
    }
    $stmt->close();
} elseif ($type === 'comment') {
    $stmt = $conn->prepare("DELETE FROM comments WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        $response = ['status' => 'success'];
    } else {
        $response = ['status' => 'error', 'message' => 'Error deleting comment'];
    }
    $stmt->close();
}

echo json_encode($response);
?>