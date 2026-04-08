<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

require_once __DIR__ . '/db.php'; 
$headers = apache_request_headers();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

try {
    // MAGIA DE SEGURIDAD: AND token_expira > NOW()
    $stmtUser = $conexion->prepare("SELECT id, rol FROM usuarios WHERE token_sesion = :token AND token_expira > NOW() LIMIT 1");
    $stmtUser->execute([':token' => $token]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) { 
        http_response_code(401); 
        exit(json_encode(["error" => "Sesión inválida o expirada. Por favor, inicia sesión de nuevo."])); 
    }

    if ($user['rol'] === 'admin') {
        $clientes = $conexion->query("SELECT id, nombre FROM usuarios WHERE rol = 'cliente' ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
        $docs = $conexion->query("SELECT d.id, d.titulo, d.tipo, d.url, u.nombre as cliente_nombre, DATE_FORMAT(d.fecha_subida, '%d-%m-%Y') as fecha FROM documentos d JOIN usuarios u ON d.usuario_id = u.id ORDER BY d.fecha_subida DESC")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["clientes" => $clientes, "documentos" => $docs]);
    } else {
        $stmt = $conexion->prepare("SELECT id, titulo, tipo, url, DATE_FORMAT(fecha_subida, '%d-%m-%Y') as fecha FROM documentos WHERE usuario_id = :id ORDER BY fecha_subida DESC");
        $stmt->execute([':id' => $user['id']]);
        echo json_encode(["documentos" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }
} catch(PDOException $e) { http_response_code(500); }
?>