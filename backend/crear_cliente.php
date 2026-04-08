<?php
// Permitir conexiones (CORS)
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/db.php'; 
$conexion->exec("set names utf8mb4");

$data = json_decode(file_get_contents("php://input"));

// Ya no pedimos password, solo nombre y email
if (!empty($data->nombre) && !empty($data->email)) {
    try {
        // 1. GENERAR CONTRASEÑA ALEATORIA (Ej: AnCon-8f3a1b)
        $password_plana = 'AnCon-' . substr(md5(uniqid(rand(), true)), 0, 6);

        // 2. ENCRIPTAR LA CONTRASEÑA
        $password_encriptada = password_hash($password_plana, PASSWORD_DEFAULT);

        // 3. GUARDAR EN BASE DE DATOS (Con obligación de cambiarla)
        $sql = "INSERT INTO usuarios (nombre, email, password, rol, debe_cambiar_pass) VALUES (:nombre, :email, :password, 'cliente', 1)";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':nombre' => $data->nombre,
            ':email' => $data->email,
            ':password' => $password_encriptada
        ]);

        // 4. PREPARAR EL CORREO ELECTRÓNICO
        $para = $data->email;
        $asunto = "Bienvenido al Portal de Clientes - AnCon SPA";
        
        $mensaje = "Hola " . $data->nombre . ",\n\n";
        $mensaje .= "Tu cuenta ha sido creada exitosamente en el Portal Privado de AnCon SPA.\n\n";
        $mensaje .= "Tus credenciales de acceso temporal son:\n";
        $mensaje .= "Email: " . $data->email . "\n";
        $mensaje .= "Contraseña Temporal: " . $password_plana . "\n\n";
        $mensaje .= "Por razones de seguridad, el sistema te pedirá cambiar esta contraseña por una definitiva la primera vez que inicies sesión.\n\n";
        $mensaje .= "Ingresa aquí: https://ancon.cl/login\n\n";
        $mensaje .= "Saludos cordiales,\nEl equipo de AnCon SPA";

        // Cabeceras para que no caiga en Spam
        $cabeceras = "From: no-reply@ancon.cl" . "\r\n" .
                     "Reply-To: contacto@ancon.cl" . "\r\n" .
                     "X-Mailer: PHP/" . phpversion();

        // 5. ENVIAR EL CORREO
        $correo_enviado = @mail($para, $asunto, $mensaje, $cabeceras);

        if ($correo_enviado) {
            echo json_encode(["mensaje" => "Cliente creado exitosamente. Se le ha enviado un correo con sus credenciales."]);
        } else {
            // NOTA: En localhost casi siempre falla el envío de correos. 
            // Te devuelvo la clave generada aquí para que puedas hacer pruebas locales.
            echo json_encode(["mensaje" => "Cliente creado, pero tu servidor local no puede enviar correos. La contraseña generada es: $password_plana"]);
        }

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo crear. Es posible que el correo ya esté registrado."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Por favor completa todos los campos (Nombre y Email)."]);
}
?>