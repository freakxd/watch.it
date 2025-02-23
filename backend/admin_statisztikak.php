<?php
include 'db.php';

$response = array();

// Hány felhasználó van regisztrálva
$sql = "SELECT COUNT(*) as total_users FROM account";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$response['total_users'] = $row['total_users'];

// Hány admin van
$sql = "SELECT COUNT(*) as total_admins FROM account WHERE role = 1";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$response['total_admins'] = $row['total_admins'];

// Hány komment van
$sql = "SELECT COUNT(*) as total_comments FROM comments";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$response['total_comments'] = $row['total_comments'];

header('Content-Type: application/json');
echo json_encode($response);
?>