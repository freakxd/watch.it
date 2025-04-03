<?php
header('Content-Type: application/json; charset=UTF-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '../logs/error.log');

include 'db.php';

$response = array();

try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        session_start();

        $verification_code = trim($_POST['verification_code_register'] ?? '');

        if (!empty($verification_code)) {
            if ($verification_code == $_SESSION['verification_code']) {
                $username = $_SESSION['register_username'];
                $password = $_SESSION['register_password'];
                $email = $_SESSION['register_email'];

                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                $sql = "INSERT INTO account (username, password, email) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sss", $username, $hashed_password, $email);

                if ($stmt->execute()) {
                    $user_id = $stmt->insert_id;
                    $response['status'] = 'success';
                    $response['message'] = 'Sikeres regisztráció';
                } else {
                    throw new Exception('Hiba: ' . $stmt->error);
                }

                $stmt->close();
                $conn->close();
            } else {
                throw new Exception('Helytelen kód');
            }
        } else {
            throw new Exception('A megerősítő kód megadása kötelező');
        }
    }
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
exit;
?>