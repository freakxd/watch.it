<?php
session_start();
include 'db.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_SESSION['user_id'])) {
        $response['status'] = 'error';
        $response['message'] = 'Be kell jelentkeznie a kommenteléshez.';
    } else {
        $userId = $_SESSION['user_id'];
        $data = json_decode(file_get_contents('php://input'), true);
        $comment = $data['comment'];

        if (isset($data['movie_id']) || isset($data['series_id'])) {
            $id = isset($data['movie_id']) ? $data['movie_id'] : $data['series_id'];
            $type = isset($data['movie_id']) ? 'movie_id' : 'series_id';

            if (!empty($comment)) {
                $sql = "INSERT INTO comments (user_id, $type, comment) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("iis", $userId, $id, $comment);
                if ($stmt->execute()) {
                    $response['status'] = 'success';
                    $response['message'] = 'Komment sikeresen mentve.';
                } else {
                    $response['status'] = 'error';
                    $response['message'] = 'Hiba történt a komment mentése során.';
                }
                $stmt->close();
            } else {
                $response['status'] = 'error';
                $response['message'] = 'A komment nem lehet üres.';
            }
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Nincs megadva film vagy sorozat azonosító.';
        }
    }
}

header('Content-Type: application/json');
echo json_encode($response);
?>