<?php
include 'db.php';

$response = array();

$sql = "SELECT id, user_id, movie_id, series_id, comment, rating, recommended, created_at FROM comments";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $comments = array();
    while ($row = $result->fetch_assoc()) {
        $comments[] = $row;
    }
    $response['comments'] = $comments;
}

$sql = "SELECT COUNT(*) as total_comments FROM comments";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$response['total_comments'] = $row['total_comments'];

header('Content-Type: application/json');
echo json_encode($response);
?>