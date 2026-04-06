<?php
// 1. ESCUDO 1: Obligar a PHP a mostrar errores si algo falla (No más pantallas blancas)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 2. CONFIGURACIÓN DE CORS
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. CONEXIÓN A LA BASE DE DATOS
require_once __DIR__ . '/db.php'; 

// ESCUDO 2: Forzar a MySQL a hablar en UTF-8 para que las tildes y las 'ñ' no rompan el JSON
$conexion->exec("set names utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if (isset($data->usuario_id) && isset($data->rol)) {
    try {
        if ($data->rol === 'admin') {
            // Buscamos a los clientes
            $sql = "SELECT id, nombre FROM usuarios WHERE rol = 'cliente' ORDER BY nombre ASC";
            $stmt = $conexion->prepare($sql);
            $stmt->execute();
            $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Buscamos TODOS los documentos
            $sqlDocs = "SELECT d.id, d.titulo, d.tipo, d.url, DATE_FORMAT(d.fecha_subida, '%d-%m-%Y') as fecha, u.nombre as cliente_nombre 
                        FROM documentos d 
                        JOIN usuarios u ON d.usuario_id = u.id 
                        ORDER BY d.fecha_subida DESC";
            $stmtDocs = $conexion->prepare($sqlDocs);
            $stmtDocs->execute();
            $documentos_admin = $stmtDocs->fetchAll(PDO::FETCH_ASSOC);

            // ESCUDO 3: Manejo seguro del JSON
            $respuesta = json_encode(["clientes" => $clientes, "documentos" => $documentos_admin], JSON_UNESCAPED_UNICODE);
            if ($respuesta === false) {
                echo json_encode(["error" => "Error de codificación JSON: " . json_last_error_msg()]);
            } else {
                echo $respuesta;
            }

        } else {
            // SI ES CLIENTE: Buscamos sus documentos
            $sql = "SELECT id, titulo, tipo, url, DATE_FORMAT(fecha_subida, '%d-%m-%Y') as fecha 
                    FROM documentos 
                    WHERE usuario_id = :usuario_id 
                    ORDER BY fecha_subida DESC";
            $stmt = $conexion->prepare($sql);
            $stmt->execute([':usuario_id' => $data->usuario_id]);
            $documentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // ESCUDO 3: Manejo seguro del JSON
            $respuesta = json_encode(["documentos" => $documentos], JSON_UNESCAPED_UNICODE);
            if ($respuesta === false) {
                echo json_encode(["error" => "Error de codificación JSON: " . json_last_error_msg()]);
            } else {
                echo $respuesta;
            }
        }

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error de Base de Datos: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos de identificación."]);
}
?>