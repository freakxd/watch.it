<?php
session_start();
include 'db.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $userId = $_SESSION['user_id'];
    $newUsername = $_POST['username']; // Javítva a kulcs

    // Ellenőrizzük, hogy a megadott név megegyezik-e a jelenlegi névvel
    $sql = "SELECT username FROM account WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($currentUsername);
    $stmt->fetch();

    if ($newUsername === $currentUsername) {
        $response['status'] = 'error';
        $response['message'] = 'A megadott felhasználónév megegyezik a jelenlegi felhasználónévvel.';
    } else {
        $sql = "UPDATE account SET username = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $newUsername, $userId);
        if ($stmt->execute()) {
            $response['status'] = 'success';
            $response['message'] = 'A felhasználónév sikeresen megváltozott.';
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Nem sikerült frissíteni a felhasználónevet.';
        }
    }

    $stmt->close();
}

echo json_encode($response);
?>