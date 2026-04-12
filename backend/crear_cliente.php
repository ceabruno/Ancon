<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

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

if (!empty($data->nombre) && !empty($data->email)) {
    try {
        $password_plana = 'AnCon-' . substr(md5(uniqid(rand(), true)), 0, 6);
        $password_encriptada = password_hash($password_plana, PASSWORD_DEFAULT);

        $sql = "INSERT INTO usuarios (nombre, email, password, rol, debe_cambiar_pass) VALUES (:nombre, :email, :password, 'cliente', 1)";
        $stmtInsert = $conexion->prepare($sql);
        $stmtInsert->execute([
            ':nombre' => $data->nombre,
            ':email' => $data->email,
            ':password' => $password_encriptada
        ]);

        $para = $data->email;
        $asunto = "Bienvenido al Portal de Clientes - AnCon SPA";
        $mensaje = "Hola " . $data->nombre . ",\n\nTu contraseña temporal es: " . $password_plana . "\nIngresa aquí: https://www.ancon.cl/login";
        $cabeceras = "From: no-reply@ancon.cl\r\nReply-To: contacto@ancon.cl\r\nX-Mailer: PHP/" . phpversion();
        
        @mail($para, $asunto, $mensaje, $cabeceras);

        // ¡ADVERTENCIA: Quita $password_plana de la respuesta en producción!
        echo json_encode([
            "mensaje" => "Cliente creado exitosamente.",
            "password_generada" => $password_plana 
        ]);
    } catch(PDOException $e) {
        http_response_code(500); 
        echo json_encode(["error" => "El correo ya existe en el sistema."]);
    }
}
?>