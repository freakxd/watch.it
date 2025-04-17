<?php
//vélemények
session_start();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $comment_id = $input['comment_id'];
    $like_type = $input['like_type'];
    $user_id = $_SESSION['user_id'] ?? null;

    if (!$user_id) {
        exit;
    }

    
    $stmt = $conn->prepare("SELECT id FROM comments WHERE id = ?");
    $stmt->bind_param("i", $comment_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        exit;
    }

    
    $stmt = $conn->prepare("SELECT likes FROM commentlikes WHERE user_id = ? AND comment_id = ?");
    $stmt->bind_param("ii", $user_id, $comment_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $existing_like = $result->fetch_assoc()['likes'];

        if ($existing_like == $like_type) {
            
            $stmt = $conn->prepare("DELETE FROM commentlikes WHERE user_id = ? AND comment_id = ?");
            $stmt->bind_param("ii", $user_id, $comment_id);
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success']);
            }
        } else {
            
            $stmt = $conn->prepare("UPDATE commentlikes SET likes = ?, liked_at = NOW() WHERE user_id = ? AND comment_id = ?");
            $stmt->bind_param("iii", $like_type, $user_id, $comment_id);
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success']);
            }
        }
    } else {
        
        $stmt = $conn->prepare("INSERT INTO commentlikes (user_id, comment_id, likes) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $user_id, $comment_id, $like_type);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success']);
        }
    }
}
?>