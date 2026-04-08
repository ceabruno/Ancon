<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/db.php'; 
$conexion->exec("set names utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email)) {
    try {
        // 1. Buscamos si el correo existe en la base de datos
        $sql = "SELECT id, nombre FROM usuarios WHERE email = :email LIMIT 1";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([':email' => $data->email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            // 2. Generamos la nueva clave temporal
            $password_plana = 'AnCon-' . substr(md5(uniqid(rand(), true)), 0, 6);
            $password_encriptada = password_hash($password_plana, PASSWORD_DEFAULT);

            // 3. Actualizamos la BD: Nueva clave y encendemos la obligación de cambiarla
            $sqlUpdate = "UPDATE usuarios SET password = :password, debe_cambiar_pass = 1 WHERE email = :email";
            $stmtUpdate = $conexion->prepare($sqlUpdate);
            $stmtUpdate->execute([
                ':password' => $password_encriptada,
                ':email' => $data->email
            ]);

            // 4. Enviamos el correo
            $para = $data->email;
            $asunto = "Recuperación de Contraseña - AnCon SPA";
            $mensaje = "Hola " . $usuario['nombre'] . ",\n\n";
            $mensaje .= "Hemos recibido una solicitud para recuperar el acceso a tu cuenta.\n\n";
            $mensaje .= "Tu nueva contraseña temporal es: " . $password_plana . "\n\n";
            $mensaje .= "Por tu seguridad, el sistema te pedirá crear una nueva contraseña definitiva apenas inicies sesión.\n\n";
            $mensaje .= "Ingresa aquí: https://tu-dominio-ancon.cl/login\n\n";
            $mensaje .= "Si no solicitaste este cambio, por favor contáctanos de inmediato.\n\nSaludos,\nEl equipo de AnCon SPA";

            $cabeceras = "From: no-reply@ancon.cl" . "\r\n" .
                         "Reply-To: contacto@ancon.cl" . "\r\n" .
                         "X-Mailer: PHP/" . phpversion();

            $correo_enviado = @mail($para, $asunto, $mensaje, $cabeceras);

            if ($correo_enviado) {
                echo json_encode(["mensaje" => "Se ha enviado un correo con las instrucciones a tu cuenta."]);
            } else {
                echo json_encode(["mensaje" => "Clave temporal generada: $password_plana (El servidor local no envía correos)."]);
            }
        } else {
            // POR SEGURIDAD: Nunca confirmamos si el correo NO existe para evitar ataques de hackers.
            // Siempre damos el mismo mensaje de éxito.
            echo json_encode(["mensaje" => "Si el correo está registrado, recibirás un mensaje con tu nueva contraseña."]);
        }

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al procesar la solicitud."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Por favor ingresa tu correo electrónico."]);
}
?>