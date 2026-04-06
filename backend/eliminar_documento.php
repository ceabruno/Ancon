<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/db.php'; 
$data = json_decode(file_get_contents("php://input"));

if (isset($data->documento_id)) {
    try {
        $sql = "DELETE FROM documentos WHERE id = :id";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([':id' => $data->documento_id]);
        echo json_encode(["mensaje" => "Documento eliminado correctamente."]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al eliminar: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "No se especificó qué documento eliminar."]);
}
?>