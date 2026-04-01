<?php
// 1. CONFIGURACIÓN DE SEGURIDAD (CORS)
// Permite que tu frontend en local (Vite) se comunique con este archivo.
// Cuando subas a cPanel, cambiaremos el '*' por 'https://tudominio.cl'
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// 2. MANEJO DE PETICIONES 'OPTIONS' (Pre-flight de React)
// Los navegadores modernos envían una petición OPTIONS antes que el POST por seguridad.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. VALIDACIÓN DEL MÉTODO
// Si alguien intenta entrar a este archivo escribiendo la URL (GET), lo bloqueamos.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Código 405: Método no permitido
    echo json_encode(["error" => "Método no permitido."]);
    exit();
}

// 4. CAPTURAR LOS DATOS ENVIADOS DESDE REACT
// React envía los datos en formato JSON crudo, así que los leemos así:
$data = json_decode(file_get_contents("php://input"));

// Verificamos que los datos no estén vacíos
if (isset($data->empresa) && isset($data->email) && isset($data->mensaje)) {
    
    // 5. SANITIZACIÓN DE DATOS (Prevención de ataques XSS)
    $empresa = htmlspecialchars(strip_tags($data->empresa));
    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $mensaje = htmlspecialchars(strip_tags($data->mensaje));

    // Validar que el correo tenga formato real
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Formato de correo inválido."]);
        exit();
    }

    // AQUI IRÁ EL CÓDIGO PARA ENVIAR EL CORREO O GUARDAR EN BASE DE DATOS
    // Por ahora, solo simularemos un éxito.

    http_response_code(200); // OK
    echo json_encode(["mensaje" => "Solicitud de reunión recibida correctamente. Empresa: $empresa"]);

} else {
    // Faltaron datos en el formulario
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos. Por favor llena todos los campos."]);
}
?>