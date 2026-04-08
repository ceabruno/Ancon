<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once __DIR__ . '/db.php'; 
$headers = apache_request_headers();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

// MAGIA DE SEGURIDAD: AND token_expira > NOW()
$stmt = $conexion->prepare("SELECT rol FROM usuarios WHERE token_sesion = :token AND token_expira > NOW() LIMIT 1");
$stmt->execute([':token' => $token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || $user['rol'] !== 'admin') { 
    http_response_code(403); 
    exit(json_encode(["error" => "No autorizado o sesión expirada."])); 
}

$data = json_decode(file_get_contents("php://input"));
if (!empty($data->cliente_id) && !empty($data->url)) {
    // Sanitización básica de URL
    if (!filter_var($data->url, FILTER_VALIDATE_URL)) {
        http_response_code(400); exit(json_encode(["error" => "La URL no es válida."]));
    }

    $sql = "INSERT INTO documentos (usuario_id, titulo, tipo, url) VALUES (?, ?, ?, ?)";
    $conexion->prepare($sql)->execute([$data->cliente_id, $data->titulo, $data->tipo, $data->url]);
    echo json_encode(["mensaje" => "Documento guardado exitosamente."]);
}
?>