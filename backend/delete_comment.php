<?php
session_start();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $comment_id = $input['comment_id'];
    $user_id = $_SESSION['user_id'] ?? null;
    $user_role = $_SESSION['role'] ?? 0;

    if (!$user_id) {
        echo json_encode(['status' => 'error', 'message' => 'Nem vagy bejelentkezve.']);
        exit;
    }

    $stmt = $conn->prepare("SELECT user_id FROM comments WHERE id = ?");
    $stmt->bind_param("i", $comment_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $comment = $result->fetch_assoc();

    if (!$comment) {
        echo json_encode(['status' => 'error', 'message' => 'A komment nem található.']);
        exit;
    }

    if ($user_role == 1 || $comment['user_id'] == $user_id) {
        $deleteStmt = $conn->prepare("DELETE FROM comments WHERE id = ?");
        $deleteStmt->bind_param("i", $comment_id);
        if ($deleteStmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Komment törölve.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Hiba történt a komment törlése során.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Nincs jogosultságod a komment törlésére.']);
    }
}
?>