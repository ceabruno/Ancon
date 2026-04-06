<?php
// 1. CONFIGURACIÓN DE SEGURIDAD Y CORS
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

// 2. INCLUIR LA BASE DE DATOS
require_once __DIR__ . '/db.php'; 

// 3. CAPTURAR DATOS
$data = json_decode(file_get_contents("php://input"));

if (isset($data->empresa) && isset($data->email) && isset($data->mensaje)) {
    
    $empresa = htmlspecialchars(strip_tags($data->empresa));
    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $mensaje = htmlspecialchars(strip_tags($data->mensaje));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Formato de correo inválido."]);
        exit();
    }

    // 4. GUARDAR EN LA BASE DE DATOS
    try {
        $sql = "INSERT INTO contactos (empresa, email, mensaje) VALUES (:empresa, :email, :mensaje)";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':empresa' => $empresa,
            ':email' => $email,
            ':mensaje' => $mensaje
        ]);

        // ---------------------------------------------------------
        // 5. NUEVO: ENVIAR EL CORREO ELECTRÓNICO
        // ---------------------------------------------------------
        
        // ¿A dónde quieres que llegue la notificación? (Reemplázalo por tu correo)
        $destinatario = "contacto@ancon.cl"; 
        
        $asunto = "Nueva Solicitud de Reunión - $empresa";
        
        // Armamos el texto que leerás en el correo
        $cuerpoMensaje = "Hola, has recibido una nueva solicitud de reunión desde la página web.\n\n";
        $cuerpoMensaje .= "Detalles del contacto:\n";
        $cuerpoMensaje .= "- Empresa: " . $empresa . "\n";
        $cuerpoMensaje .= "- Correo del cliente: " . $email . "\n\n";
        $cuerpoMensaje .= "Mensaje:\n" . $mensaje . "\n";
        
        // Cabeceras importantes para evitar que caiga en Spam
        // IMPORTANTE: El correo en "From" debe existir en tu cPanel (ej: no-reply@ancon.cl o el mismo contacto@ancon.cl)
        $headers = "From: contacto@ancon.cl\r\n"; 
        $headers .= "Reply-To: " . $email . "\r\n"; // Si le das a "Responder" en tu correo, le responderá al cliente
        $headers .= "X-Mailer: PHP/" . phpversion();

        // Ejecutamos la función de envío
        mail($destinatario, $asunto, $cuerpoMensaje, $headers);
        // ---------------------------------------------------------

        // 6. RESPUESTA EXITOSA AL FRONTEND
        http_response_code(200);
        echo json_encode(["mensaje" => "Solicitud de reunión recibida y guardada correctamente. Empresa: $empresa"]);

    } catch(PDOException $e) {
        error_log("Error al insertar contacto: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "Hubo un problema al procesar tu solicitud. Intenta nuevamente."]);
    }

} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos. Por favor llena todos los campos."]);
}
?>