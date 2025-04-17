<?php
//vélemények betöltése
require_once 'db.php';
header('Content-Type: application/json');

$response = ['comments' => []];

if (isset($_GET['movie_id'])) {
    $id = $_GET['movie_id'];
    $sql = "SELECT 
                comments.id, 
                comments.comment, 
                comments.rating, 
                comments.recommended, 
                comments.created_at, 
                comments.user_id, 
                account.username,
                COALESCE(SUM(CASE WHEN commentlikes.likes = 1 THEN 1 ELSE 0 END), 0) AS like_count,
                COALESCE(SUM(CASE WHEN commentlikes.likes = 0 THEN 1 ELSE 0 END), 0) AS dislike_count
            FROM comments
            LEFT JOIN account ON comments.user_id = account.id
            LEFT JOIN commentlikes ON comments.id = commentlikes.comment_id
            WHERE comments.movie_id = ?
            GROUP BY comments.id
            ORDER BY comments.created_at DESC";
} elseif (isset($_GET['series_id'])) {
    $id = $_GET['series_id'];
    $sql = "SELECT 
                comments.id, 
                comments.comment, 
                comments.rating, 
                comments.recommended, 
                comments.created_at, 
                comments.user_id, 
                account.username,
                COALESCE(SUM(CASE WHEN commentlikes.likes = 1 THEN 1 ELSE 0 END), 0) AS like_count,
                COALESCE(SUM(CASE WHEN commentlikes.likes = 0 THEN 1 ELSE 0 END), 0) AS dislike_count
            FROM comments
            LEFT JOIN account ON comments.user_id = account.id
            LEFT JOIN commentlikes ON comments.id = commentlikes.comment_id
            WHERE comments.series_id = ?
            GROUP BY comments.id
            ORDER BY comments.created_at DESC";
}

$stmt = $conn->prepare($sql);

$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $response['comments'][] = $row;
}

$stmt->close();
echo json_encode($response);
?>