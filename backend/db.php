<?php
//abakos.hu-n megváltozik
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "watchit";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>