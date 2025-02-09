<?php
session_start();

$response = array();

if (isset($_SESSION['user_id'])) {
    $response['status'] = 'logged_in';
    $response['username'] = $_SESSION['username'];
    $response['user_id'] = $_SESSION['user_id'];
} elseif (isset($_COOKIE['user_id']) && isset($_COOKIE['username'])) {
    $_SESSION['user_id'] = $_COOKIE['user_id'];
    $_SESSION['username'] = $_COOKIE['username'];
    $response['status'] = 'logged_in';
    $response['username'] = $_SESSION['username'];
    $response['user_id'] = $_SESSION['user_id'];
} else {
    $response['status'] = 'not_logged_in';
}

echo json_encode($response);
?>