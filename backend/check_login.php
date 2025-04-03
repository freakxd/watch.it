<?php
session_start();

$response = array();

if (isset($_SESSION['user_id'])) {
    include 'db.php';

    $user_id = $_SESSION['user_id'];
    $sql = "SELECT username, role FROM account WHERE id = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->bind_result($username, $role);
        if ($stmt->fetch()) {
            $response['status'] = 'logged_in';
            $response['username'] = $username;
            $response['role'] = $role;
            $response['user_id'] = $user_id;
        } else {
            $response['status'] = 'not_logged_in';
        }
        $stmt->close();
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Hiba történt az adatbázis lekérdezése során.';
    }
} elseif (isset($_COOKIE['user_id']) && isset($_COOKIE['username'])) {
    $_SESSION['user_id'] = $_COOKIE['user_id'];
    $_SESSION['username'] = $_COOKIE['username'];

    include 'db.php';

    $user_id = $_SESSION['user_id'];
    $sql = "SELECT username, role FROM account WHERE id = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->bind_result($username, $role);
        if ($stmt->fetch()) {
            $response['status'] = 'logged_in';
            $response['username'] = $username;
            $response['role'] = $role;
            $response['user_id'] = $user_id;
        } else {
            $response['status'] = 'not_logged_in';
        }
        $stmt->close();
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Hiba történt az adatbázis lekérdezése során.';
    }
} else {
    $response['status'] = 'not_logged_in';
}

header('Content-Type: application/json');
echo json_encode($response);
?>