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

require_once __DIR__ . '/db.php'; 

$data = json_decode(file_get_contents("php://input"));

// ---------------------------------------------------------
// 2. FILTROS ANTI-SPAM INVISIBLES (HONEYPOT Y TIEMPO)
// ---------------------------------------------------------

// A. Filtro Honeypot (El campo que un humano no ve)
if (!empty($data->telefono_secundario)) {
    // Si tiene algo escrito, es un bot. 
    // TRUCO DE SEGURIDAD: Le decimos que fue "exitoso" para que el bot no intente otras estrategias.
    http_response_code(200);
    exit(json_encode(["mensaje" => "Solicitud de reunión recibida y guardada correctamente."])); 
}

// B. Filtro de Tiempo (Un humano no llena 3 campos en menos de 3 segundos)
if (isset($data->tiempo_tardado) && $data->tiempo_tardado < 3.0) {
    // Es un bot muy rápido. Nuevamente, lo engañamos con falso éxito.
    http_response_code(200);
    exit(json_encode(["mensaje" => "Solicitud de reunión recibida y guardada correctamente."]));
}

// ---------------------------------------------------------
// 3. PROCESAMIENTO NORMAL DE DATOS (Si pasó los filtros)
// ---------------------------------------------------------

if (!empty($data->empresa) && !empty($data->email) && !empty($data->mensaje)) {
    
    $empresa = htmlspecialchars(strip_tags($data->empresa));
    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $mensaje = htmlspecialchars(strip_tags($data->mensaje));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Formato de correo inválido."]);
        exit();
    }

    try {
        $sql = "INSERT INTO contactos (empresa, email, mensaje) VALUES (:empresa, :email, :mensaje)";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':empresa' => $empresa,
            ':email' => $email,
            ':mensaje' => $mensaje
        ]);
        
        $destinatario = "contacto@ancon.cl"; 
        $asunto = "Nueva Solicitud de Reunión - $empresa";
        
        $cuerpoMensaje = "Hola, has recibido una nueva solicitud de reunión desde la página web.\n\n";
        $cuerpoMensaje .= "Detalles del contacto:\n";
        $cuerpoMensaje .= "- Empresa: " . $empresa . "\n";
        $cuerpoMensaje .= "- Correo del cliente: " . $email . "\n\n";
        $cuerpoMensaje .= "Mensaje:\n" . $mensaje . "\n";
        
        $headers = "From: contacto@ancon.cl\r\n"; 
        $headers .= "Reply-To: " . $email . "\r\n"; 
        $headers .= "X-Mailer: PHP/" . phpversion();

        @mail($destinatario, $asunto, $cuerpoMensaje, $headers);

        http_response_code(200);
        echo json_encode(["mensaje" => "Solicitud de reunión recibida y guardada correctamente. Empresa: $empresa"]);

    } catch(PDOException $e) {
        error_log("Error al insertar contacto: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "Hubo un problema al procesar tu solicitud. Intenta nuevamente."]);
    }

} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos. Por favor llena todos los campos obligatorios."]);
}
?>