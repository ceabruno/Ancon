<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once __DIR__ . '/db.php'; 
$headers = apache_request_headers();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

$stmt = $conexion->prepare("SELECT rol FROM usuarios WHERE token_sesion = :token LIMIT 1");
$stmt->execute([':token' => $token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || $user['rol'] !== 'admin') { http_response_code(403); exit(json_encode(["error" => "No autorizado"])); }

$data = json_decode(file_get_contents("php://input"));
if (!empty($data->cliente_id) && !empty($data->url)) {
    $sql = "INSERT INTO documentos (usuario_id, titulo, tipo, url) VALUES (?, ?, ?, ?)";
    $conexion->prepare($sql)->execute([$data->cliente_id, $data->titulo, $data->tipo, $data->url]);
    echo json_encode(["mensaje" => "Documento guardado"]);
}