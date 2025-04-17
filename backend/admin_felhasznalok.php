<?php
//admin oldalon lévő felhasználók kilistázása
include 'db.php';

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];
    $username = $data['username'];
    $password = $data['password'];
    $email = $data['email'];
    $role = $data['role'];

    if (!empty($password)) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    } else {
        $sql = "SELECT password FROM account WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->bind_result($hashed_password);
        $stmt->fetch();
        $stmt->close();
    }

    $sql = "UPDATE account SET username = ?, password = ?, email = ?, role = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssii", $username, $hashed_password, $email, $role, $id);

    if ($stmt->execute()) {
        $response['status'] = 'success';
        $response['message'] = 'Felhasználói adatok sikeresen frissítve.';
        $response['hashed_password'] = $hashed_password;
    }

    $stmt->close();
} else {
    $sql = "SELECT id, username, password, email, role, created_at FROM account";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $users = array();
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        $response['users'] = $users;
    }

    $sql = "SELECT COUNT(*) as total_users FROM account";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    $response['total_users'] = $row['total_users'];

    $sql = "SELECT COUNT(*) as total_admins FROM account WHERE role = 1";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    $response['total_admins'] = $row['total_admins'];
}

header('Content-Type: application/json');
echo json_encode($response);
?>