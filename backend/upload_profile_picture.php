<?php
session_start();
header('Content-Type: application/json');

// Hibakezelés bekapcsolása
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$response = [];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['profilePicture'])) {
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('Felhasználó ID nincs beállítva a session-ben.');
        }

        $userId = $_SESSION['user_id'];
        $targetDir = "../uploads/";
        $imageFileType = strtolower(pathinfo($_FILES["profilePicture"]["name"], PATHINFO_EXTENSION));
        $targetFile = $targetDir . $userId . '.' . $imageFileType;
        $uploadOk = 1;

        // Ellenőrizd, hogy a fájl valóban kép-e
        $check = getimagesize($_FILES["profilePicture"]["tmp_name"]);
        if ($check !== false) {
            $uploadOk = 1;
        } else {
            $response = ['status' => 'error', 'message' => 'A fájl nem kép.'];
            $uploadOk = 0;
        }

        // Ellenőrizd a fájl méretét
        if ($_FILES["profilePicture"]["size"] > 500000) {
            $response = ['status' => 'error', 'message' => 'A fájl túl nagy.'];
            $uploadOk = 0;
        }

        // Csak bizonyos fájltípusok engedélyezése
        if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif") {
            $response = ['status' => 'error', 'message' => 'Csak JPG, JPEG, PNG és GIF fájlok engedélyezettek.'];
            $uploadOk = 0;
        }

        // Ellenőrizd, hogy az $uploadOk 0-e hiba esetén
        if ($uploadOk == 0) {
            $response = ['status' => 'error', 'message' => 'A fájl feltöltése sikertelen.'];
        } else {
            // Töröld a régi fájlokat
            $existingFiles = glob($targetDir . $userId . '.*');
            foreach ($existingFiles as $existingFile) {
                if ($existingFile !== $targetFile) {
                    unlink($existingFile);
                }
            }

            if (move_uploaded_file($_FILES["profilePicture"]["tmp_name"], $targetFile)) {
                $response = ['status' => 'success', 'message' => 'A fájl feltöltése sikeres.', 'filePath' => $targetFile];
            } else {
                $response = ['status' => 'error', 'message' => 'Hiba történt a fájl feltöltése során.'];
            }
        }
    } else {
        $response = ['status' => 'error', 'message' => 'Nincs fájl feltöltve.'];
    }
} catch (Exception $e) {
    $response = ['status' => 'error', 'message' => 'Kivétel történt: ' . $e->getMessage()];
}

echo json_encode($response);
?>