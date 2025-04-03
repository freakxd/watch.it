<?php
include 'db.php';
session_start();

$response = array();
$response['comments'] = array();

$response['current_user_role'] = isset($_SESSION['role']) ? $_SESSION['role'] : 0;
$response['current_user_id'] = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (isset($_GET['movie_id']) || isset($_GET['series_id'])) {
    $id = isset($_GET['movie_id']) ? $_GET['movie_id'] : $_GET['series_id'];
    $type = isset($_GET['movie_id']) ? 'movie_id' : 'series_id';

    $sql = "SELECT comments.id, account.username, comments.comment, comments.rating, comments.recommended, comments.created_at, comments.user_id 
            FROM comments 
            JOIN account ON comments.user_id = account.id 
            WHERE comments.$type = ? 
            ORDER BY comments.created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $response['comments'][] = $row;
    }

    $stmt->close();
}

header('Content-Type: application/json');
echo json_encode($response);
?>