<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/db.php'; 
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->usuario_id) && !empty($data->nueva_password)) {
    try {
        // 1. Obtenemos los datos actuales del usuario
        $sql = "SELECT password, debe_cambiar_pass FROM usuarios WHERE id = :id";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([':id' => $data->usuario_id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            http_response_code(404);
            echo json_encode(["error" => "Usuario no encontrado."]);
            exit();
        }

        // 2. VERIFICACIÓN DE SEGURIDAD (La clave antigua)
        // Solo la pedimos si NO es un reseteo obligatorio
        if ($usuario['debe_cambiar_pass'] == 0) {
            if (empty($data->password_actual)) {
                http_response_code(400);
                echo json_encode(["error" => "Por seguridad, debes ingresar tu contraseña actual."]);
                exit();
            }

            // Verificamos que la clave antigua coincida con la de la base de datos
            if (!password_verify($data->password_actual, $usuario['password'])) {
                http_response_code(401);
                echo json_encode(["error" => "La contraseña actual es incorrecta."]);
                exit();
            }
        }

        // 3. Si todo está bien, actualizamos la nueva clave
        $password_encriptada = password_hash($data->nueva_password, PASSWORD_DEFAULT);

        $sqlUpdate = "UPDATE usuarios SET password = :password, debe_cambiar_pass = 0 WHERE id = :id";
        $stmtUpdate = $conexion->prepare($sqlUpdate);
        $stmtUpdate->execute([
            ':password' => $password_encriptada,
            ':id' => $data->usuario_id
        ]);

        echo json_encode(["mensaje" => "Contraseña actualizada con éxito."]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al actualizar la contraseña."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos."]);
}
?>