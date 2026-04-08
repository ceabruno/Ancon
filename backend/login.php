<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/db.php'; 
$conexion->exec("set names utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    try {
        // 1. Buscamos al usuario incluyendo los campos de intentos y bloqueo
        $sql = "SELECT id, nombre, password, rol, debe_cambiar_pass, intentos_fallidos, bloqueado_hasta FROM usuarios WHERE email = :email LIMIT 1";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([':email' => $data->email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        // Si el correo no existe, simulamos carga y damos error genérico
        if (!$usuario) {
            sleep(1); 
            http_response_code(401);
            exit(json_encode(["error" => "Credenciales incorrectas."]));
        }

        // 2. VERIFICACIÓN DE BLOQUEO ANTES DE PROBAR LA CLAVE
        if ($usuario['bloqueado_hasta'] && strtotime($usuario['bloqueado_hasta']) > time()) {
            $minutos_restantes = ceil((strtotime($usuario['bloqueado_hasta']) - time()) / 60);
            http_response_code(403);
            exit(json_encode(["error" => "Cuenta bloqueada temporalmente. Intenta en $minutos_restantes minutos."]));
        }

        // 3. VERIFICAMOS LA CONTRASEÑA
        if (password_verify($data->password, $usuario['password'])) {
            
            // ÉXITO: Generamos token y REINICIAMOS los intentos fallidos a 0
            $token = bin2hex(random_bytes(32));
            $sqlSuccess = "UPDATE usuarios SET token_sesion = :token, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = :id";
            $stmtUpdate = $conexion->prepare($sqlSuccess);
            $stmtUpdate->execute([':token' => $token, ':id' => $usuario['id']]);

            echo json_encode([
                "mensaje" => "Login exitoso",
                "usuario" => [
                    "nombre" => $usuario['nombre'],
                    "rol" => $usuario['rol'],
                    "debe_cambiar_pass" => $usuario['debe_cambiar_pass'],
                    "token" => $token
                ]
            ]);

        } else {
            // ERROR: Aumentamos el contador de intentos
            $nuevos_intentos = $usuario['intentos_fallidos'] + 1;
            $bloqueo = null;

            if ($nuevos_intentos >= 5) {
                // Si llega a 5 intentos, bloqueamos por 15 minutos
                $bloqueo = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                $mensaje_error = "Demasiados intentos. Cuenta bloqueada por 15 minutos.";
            } else {
                $mensaje_error = "Credenciales incorrectas. Intentos restantes: " . (5 - $nuevos_intentos);
            }

            // Guardamos el fallo en la base de datos
            $sqlFail = "UPDATE usuarios SET intentos_fallidos = :intentos, bloqueado_hasta = :bloqueo WHERE id = :id";
            $conexion->prepare($sqlFail)->execute([
                ':intentos' => $nuevos_intentos,
                ':bloqueo' => $bloqueo,
                ':id' => $usuario['id']
            ]);

            sleep(1); // Mitigación adicional de tiempo
            http_response_code(401);
            echo json_encode(["error" => $mensaje_error]);
        }
    } catch(PDOException $e) { 
        http_response_code(500); 
        echo json_encode(["error" => "Error de servidor."]); 
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos."]);
}
?>