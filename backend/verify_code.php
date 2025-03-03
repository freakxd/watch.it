<?php
include 'db.php';

$response = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user_id = trim($_POST['user_id']);
    $verification_code = trim($_POST['verification_code']);
    $stay_logged_in = isset($_POST['stay_logged_in']) ? true : false;

    if (empty($user_id) || empty($verification_code)) {
        $response['status'] = 'error';
        $response['message'] = 'Felhasználó ID és kód megadása kötelező';
        echo json_encode($response);
        exit();
    }

    $sql = "SELECT verification_code, username FROM account WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($stored_code, $username);
    $stmt->fetch();

    if ($stmt->num_rows == 0) {
        $response['status'] = 'error';
        $response['message'] = 'Hibás felhasználó ID';
        $stmt->close();
        $conn->close();
        echo json_encode($response);
        exit();
    }

    if ($verification_code != $stored_code) {
        $response['status'] = 'error';
        $response['message'] = 'Hibás kód';
        $stmt->close();
        $conn->close();
        echo json_encode($response);
        exit();
    }

    $stmt->close();

    session_start();
    $_SESSION['user_id'] = $user_id;
    $_SESSION['username'] = $username;

    if ($stay_logged_in) {
        setcookie("user_id", $user_id, time() + (86400 * 30), "/");
        setcookie("username", $username, time() + (86400 * 30), "/");
    }

    $response['status'] = 'success';
    $response['message'] = 'Sikeres bejelentkezés';
    $response['username'] = $username;
    $response['user_id'] = $user_id;

    $conn->close();
}

echo json_encode($response);
?>