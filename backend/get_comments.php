<?php
include 'db.php';

$response = array();
$response['comments'] = array();

if (isset($_GET['movie_id']) || isset($_GET['series_id'])) {
    $id = isset($_GET['movie_id']) ? $_GET['movie_id'] : $_GET['series_id'];
    $type = isset($_GET['movie_id']) ? 'movie_id' : 'series_id';

    $sql = "SELECT account.username, comments.comment, comments.created_at 
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