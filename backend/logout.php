<?php
session_start();
session_unset();
session_destroy();

// Sütik törlése
setcookie("user_id", "", time() - 3600, "/");
setcookie("username", "", time() - 3600, "/");

// Átirányítás a kezdőlapra
header("Location: ../pages/index");
exit();
?>