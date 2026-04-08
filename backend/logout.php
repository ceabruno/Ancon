<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

require_once __DIR__ . '/db.php'; 
$headers = apache_request_headers();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

// Anulamos el token en la base de datos inmediatamente
$sql = "UPDATE usuarios SET token_sesion = NULL, token_expira = NULL WHERE token_sesion = :token";
$conexion->prepare($sql)->execute([':token' => $token]);

echo json_encode(["mensaje" => "Sesión cerrada correctamente."]);
?>