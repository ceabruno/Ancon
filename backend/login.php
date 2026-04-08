<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido."]);
    exit();
}

require_once __DIR__ . '/db.php'; 

$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->password)) {
    
    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $password = $data->password; // No la limpiamos aún porque las contraseñas pueden tener caracteres especiales

    try {
        // 1. Añadimos debe_cambiar_pass a la búsqueda
        $sql = "SELECT id, nombre, password, rol, debe_cambiar_pass FROM usuarios WHERE email = :email LIMIT 1";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([':email' => $email]);
        
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && password_verify($password, $usuario['password'])) {
            
            http_response_code(200);
            echo json_encode([
                "mensaje" => "Login exitoso",
                "usuario" => [
                    "id" => $usuario['id'],
                    "nombre" => $usuario['nombre'],
                    "rol" => $usuario['rol'],
                    "debe_cambiar_pass" => $usuario['debe_cambiar_pass'] // Lo enviamos a React
                ]
            ]);

        } else {
            // Login Fallido (No decimos si falló el correo o la clave por seguridad)
            http_response_code(401); // 401 = No Autorizado
            echo json_encode(["error" => "Credenciales incorrectas."]);
        }

    } catch(PDOException $e) {
        error_log("Error en el login: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "Error interno del servidor."]);
    }

} else {
    http_response_code(400);
    echo json_encode(["error" => "Por favor ingresa correo y contraseña."]);
}
?>