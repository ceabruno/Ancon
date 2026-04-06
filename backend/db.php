<?php
/**
 * db.php
 * Este archivo establece la conexión segura a la base de datos.
 */

// 1. Función para leer el archivo .env
function cargarVariablesDeEntorno($rutaArchivo) {
    // Verificamos si el archivo .env existe en la ruta indicada
    if (!file_exists($rutaArchivo)) {
        error_log("Falta el archivo .env en: " . $rutaArchivo);
        exit("Error de configuración del servidor.");
    }

    // Leemos el archivo línea por línea
    $lineas = file($rutaArchivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lineas as $linea) {
        // Ignoramos las líneas que son comentarios (empiezan con #)
        if (strpos(trim($linea), '#') === 0) continue;
        
        // Separamos el nombre de la variable y su valor
        list($nombre, $valor) = explode('=', $linea, 2);
        
        // Guardamos la variable en el arreglo global $_ENV de PHP
        $_ENV[trim($nombre)] = trim($valor);
    }
}

// 2. Ejecutar la función
// Ajusta esta ruta dependiendo de dónde pusiste el .env
// '__DIR__' es la carpeta actual. '/../../.env' significa "sube dos niveles y busca el .env"
$rutaEnv = __DIR__ . '/../../.env'; 
cargarVariablesDeEntorno($rutaEnv);

// 3. Obtener las variables para la conexión
$host = $_ENV['DB_HOST'];
$dbname = $_ENV['DB_NAME'];
$username = $_ENV['DB_USER'];
$password = $_ENV['DB_PASS'];

// 4. Establecer la conexión con PDO (PHP Data Objects)
try {
    $conexion = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // Le decimos al navegador que vamos a enviar un JSON, incluso si hay error
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    
    // Devolvemos el error en formato JSON para que React lo entienda
    echo json_encode(["error" => "Error de conexión a la base de datos: " . $e->getMessage()]);
    exit();
}
?>