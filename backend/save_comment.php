<?php
session_start();
include 'db.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_SESSION['user_id'])) {
        $response['status'] = 'error';
        $response['message'] = 'Be kell jelentkeznie a vélemény írásához.';
    } else {
        $userId = $_SESSION['user_id'];
        $data = json_decode(file_get_contents('php://input'), true);
        $comment = $data['comment'];
        $rating = $data['rating'];
        $recommended = $data['recommended'];

        if (isset($data['movie_id']) || isset($data['series_id'])) {
            $id = isset($data['movie_id']) ? $data['movie_id'] : $data['series_id'];
            $type = isset($data['movie_id']) ? 'movie_id' : 'series_id';

            if (!empty($comment) && !empty($rating) && isset($recommended)) {
                $sql = "INSERT INTO comments (user_id, $type, comment, rating, recommended) VALUES (?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("iisii", $userId, $id, $comment, $rating, $recommended);
                if ($stmt->execute()) {
                    $response['status'] = 'success';
                    $response['message'] = 'Véleménye sikeresen mentve.';
                } else {
                    $response['status'] = 'error';
                    $response['message'] = 'Hiba történt a vélemény mentése során.';
                }
                $stmt->close();
            } else {
                $response['status'] = 'error';
                $response['message'] = 'A vélemény, az értékelés és az ajánlás nem lehet üres.';
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