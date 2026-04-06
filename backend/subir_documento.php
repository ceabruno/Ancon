<?php
// 1. CONFIGURACIÓN DE CORS
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

// 2. CONEXIÓN A LA BASE DE DATOS
require_once __DIR__ . '/db.php'; 

// 3. RECIBIR DATOS DE REACT
$data = json_decode(file_get_contents("php://input"));

// 4. VALIDAR Y GUARDAR
if (!empty($data->cliente_id) && !empty($data->titulo) && !empty($data->tipo) && !empty($data->url)) {
    
    try {
        $sql = "INSERT INTO documentos (usuario_id, titulo, tipo, url) VALUES (:usuario_id, :titulo, :tipo, :url)";
        $stmt = $conexion->prepare($sql);
        
        $stmt->execute([
            ':usuario_id' => $data->cliente_id,
            ':titulo' => $data->titulo,
            ':tipo' => $data->tipo,
            ':url' => $data->url
        ]);

        http_response_code(201); // 201 = Creado exitosamente
        echo json_encode(["mensaje" => "Documento asignado correctamente al cliente."]);

    } catch(PDOException $e) {
        error_log("Error al guardar documento: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "Error interno de la base de datos."]);
    }

} else {
    http_response_code(400); // 400 = Petición incorrecta
    echo json_encode(["error" => "Por favor, completa todos los campos del formulario."]);
}
?>