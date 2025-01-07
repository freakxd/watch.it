<?php
session_start();

$response = array();

if (isset($_SESSION['user_id'])) {
    $response['status'] = 'logged_in';
    $response['username'] = $_SESSION['username'];
    $response['role'] = $_SESSION['role'];
    $response['user_id'] = $_SESSION['user_id'];
} else {
    $response['status'] = 'not_logged_in';
}

echo json_encode($response);
?>