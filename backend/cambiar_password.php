<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once __DIR__ . '/db.php'; 
$headers = apache_request_headers();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

// MAGIA DE SEGURIDAD: AND token_expira > NOW()
$stmt = $conexion->prepare("SELECT id, password, debe_cambiar_pass FROM usuarios WHERE token_sesion = :token AND token_expira > NOW() LIMIT 1");
$stmt->execute([':token' => $token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) { 
    http_response_code(401); 
    exit(json_encode(["error" => "Sesión expirada. Por favor, inicia sesión nuevamente para cambiar tu clave."])); 
}

$data = json_decode(file_get_contents("php://input"));

if ($user['debe_cambiar_pass'] == 0) {
    if (!password_verify($data->password_actual, $user['password'])) {
        http_response_code(401); 
        exit(json_encode(["error" => "Clave actual incorrecta"]));
    }
}

$newHash = password_hash($data->nueva_password, PASSWORD_DEFAULT);
$conexion->prepare("UPDATE usuarios SET password = ?, debe_cambiar_pass = 0 WHERE id = ?")->execute([$newHash, $user['id']]);
echo json_encode(["mensaje" => "Clave actualizada con éxito"]);
?>