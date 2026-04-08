import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Portal() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  // Estados reales para la Base de Datos
  const [documentos, setDocumentos] = useState([]);
  const [clientes, setClientes] = useState([]);

  // 1. Verificación de Seguridad
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioAncon');
    if (!usuarioGuardado) {
      navigate('/login');
    } else {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, [navigate]);

  // 2. Cargar Datos Automáticamente
  useEffect(() => {
    if (usuario) {
      const cargarDatos = async () => {
        try {
          const response = await fetch('http://localhost:8080/obtener_datos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuario.id, rol: usuario.rol })
          });
          const data = await response.json();
          if (response.ok) {
            if (usuario.rol === 'admin') {
              setClientes(data.clientes || []); 
              setDocumentos(data.documentos || []); 
            } else {
              setDocumentos(data.documentos || []); 
            }
          }
        } catch (error) {
          console.error("Error al cargar los datos:", error);
        }
      };
      cargarDatos();
    }
  }, [usuario]);

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioAncon');
    navigate('/login');
  };

  if (!usuario) return null;

  return (
    <div className="portal-layout">
      {/* CABECERA */}
      <header className="portal-header">
        <h2 className="portal-header-title">AnCon SPA - Portal Privado</h2>
        <div className="portal-user-info">
          <span>Hola, <strong>{usuario.nombre}</strong> <small>({usuario.rol})</small></span>
          <button onClick={handleCerrarSesion} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="portal-main">
        {usuario.rol === 'admin' ? (
          <VistaAdmin clientes={clientes} documentos={documentos} />
        ) : (
          <VistaCliente documentos={documentos} />
        )}
      </main>
    </div>
  );
}

// ==========================================
// VISTA DEL ADMINISTRADOR (Se mantiene igual)
// ==========================================
function VistaAdmin({ clientes, documentos }) {
  const [formData, setFormData] = useState({ cliente_id: '', titulo: '', tipo: 'Contabilidad', url: '' });
  const [filtroCliente, setFiltroCliente] = useState('');
  const [formCliente, setFormCliente] = useState({ nombre: '', email: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/subir_documento.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("✅ " + data.mensaje);
        window.location.reload(); 
      } else { alert("❌ Error: " + data.error); }
    } catch (error) { alert("❌ No se pudo conectar con el servidor."); }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Estás seguro de que quieres eliminar este documento?")) {
      try {
        const response = await fetch('http://localhost:8080/eliminar_documento.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documento_id: id }),
        });
        if (response.ok) { window.location.reload(); }
      } catch (error) { alert("Error al eliminar el documento."); }
    }
  };

  const handleClienteChange = (e) => setFormCliente({ ...formCliente, [e.target.name]: e.target.value });

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/crear_cliente.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCliente),
      });
      const data = await response.json();
      if (response.ok) {
        alert("✅ " + data.mensaje);
        window.location.reload(); 
      } else { alert("❌ Error: " + data.error); }
    } catch (error) { alert("❌ No se pudo conectar con el servidor."); }
  };

  const documentosMostrados = filtroCliente ? documentos.filter(doc => doc.cliente_nombre === filtroCliente) : documentos;

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {/* FORMULARIO 1: CREAR CLIENTE */}
        <div className="portal-card">
          <h3 className="portal-card-title">Registrar Nuevo Cliente</h3>
          <form onSubmit={handleCrearCliente} style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Razón Social / Nombre</label>
              <input type="text" name="nombre" value={formCliente.nombre} onChange={handleClienteChange} className="input" placeholder="Ej: Empresa Alpha SPA" required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Correo Electrónico</label>
              <input type="email" name="email" value={formCliente.email} onChange={handleClienteChange} className="input" placeholder="contacto@empresa.cl" required />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--carbon-light)', fontStyle: 'italic' }}>
              * El sistema generará una contraseña segura y se la enviará automáticamente al cliente.
            </p>
            <button type="submit" className="btn-primary" style={{ backgroundColor: '#2D6A4F', marginTop: 'auto' }}>Crear Cuenta</button>
          </form>
        </div>

        {/* FORMULARIO 2: COMPARTIR DOCUMENTO */}
        <div className="portal-card">
          <h3 className="portal-card-title">Compartir Documento</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>1. Cliente</label>
              <select name="cliente_id" value={formData.cliente_id} onChange={handleChange} className="input" required>
                <option value="">-- Seleccionar --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>2. Categoría</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange} className="input">
                <option value="Contabilidad">Contabilidad</option>
                <option value="Impuestos">Impuestos</option>
                <option value="RRHH">Recursos Humanos</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label>3. Título del Documento</label>
              <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="input" required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label>4. Enlace (Drive / OneDrive)</label>
              <input type="url" name="url" value={formData.url} onChange={handleChange} className="input" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Guardar Documento</button>
            </div>
          </form>
        </div>
      </div>

      {/* TABLA DE DOCUMENTOS ADMIN */}
      <div className="portal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #A8E6CF', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, color: '#2D6A4F', fontSize: '1.5rem' }}>Documentos Activos</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: '500', color: '#52796F' }}>Mostrar:</label>
            <select value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} className="input" style={{ padding: '8px 12px', minWidth: '200px' }}>
              <option value="">Todos los clientes</option>
              {clientes.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
        
        {!documentos || documentos.length === 0 ? (
           <p className="portal-empty-text">No has subido ningún documento todavía.</p>
        ) : documentosMostrados.length === 0 ? (
           <p className="portal-empty-text">Este cliente no tiene documentos subidos.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F4F7F5', borderBottom: '2px solid #A8E6CF' }}>
                  {!filtroCliente && <th style={{ padding: '12px' }}>Cliente</th>}
                  <th style={{ padding: '12px' }}>Documento</th>
                  <th style={{ padding: '12px' }}>Tipo</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {documentosMostrados.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    {!filtroCliente && <td style={{ padding: '12px', fontWeight: 'bold' }}>{doc.cliente_nombre}</td>}
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: '#2F3E46' }}>{doc.titulo}</strong> <br/>
                      <small style={{ color: '#666' }}>Subido el: {doc.fecha}</small>
                    </td>
                    <td style={{ padding: '12px' }}>{doc.tipo}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#2D6A4F', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', transition: '0.3s' }}>Ver</a>
                        <button onClick={() => handleEliminar(doc.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', transition: '0.3s' }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// VISTA DEL CLIENTE (SISTEMA DE PESTAÑAS Y SEGURIDAD)
// ==========================================
function VistaCliente({ documentos }) {
  const [usuarioLocal, setUsuarioLocal] = useState(JSON.parse(localStorage.getItem('usuarioAncon')));
  
  // NAVEGACIÓN POR PESTAÑAS: 'documentos' o 'perfil'
  const [tabActiva, setTabActiva] = useState('documentos');

  // ESTADOS DEL FORMULARIO DE CLAVE
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (nuevaPassword !== confirmarPassword) {
      alert("❌ Las contraseñas nuevas no coinciden.");
      return;
    }
    if (nuevaPassword.length < 6) {
      alert("❌ La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/cambiar_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          usuario_id: usuarioLocal.id, 
          password_actual: passwordActual, // Ahora enviamos la antigua
          nueva_password: nuevaPassword 
        }),
      });
      const data = await response.json();
      
      if (response.ok) {
        alert("✅ " + data.mensaje);
        const usuarioActualizado = { ...usuarioLocal, debe_cambiar_pass: 0 };
        localStorage.setItem('usuarioAncon', JSON.stringify(usuarioActualizado));
        setUsuarioLocal(usuarioActualizado); 
        
        // Limpiamos los campos
        setPasswordActual('');
        setNuevaPassword('');
        setConfirmarPassword('');
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (error) {
      alert("❌ No se pudo conectar con el servidor.");
    }
  };

  // PANTALLA 1: BLOQUEO OBLIGATORIO (Si es primera vez o recuperación)
  if (usuarioLocal.debe_cambiar_pass === 1 || usuarioLocal.debe_cambiar_pass === "1") {
    return (
      <div className="portal-card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
        <h3 className="portal-card-title" style={{ color: '#dc3545' }}>⚠️ Acción Requerida</h3>
        <p style={{ marginBottom: '20px', color: 'var(--carbon-light)' }}>
          Por tu seguridad, debes establecer una contraseña definitiva antes de acceder a tus documentos.
        </p>
        
        <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          {/* OMITIMOS pedir la clave actual aquí para no generar fricción, el backend lo permite */}
          <div>
            <label>Nueva Contraseña</label>
            <input type="password" className="input" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required />
          </div>
          <div>
            <label>Confirmar Nueva Contraseña</label>
            <input type="password" className="input" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Actualizar y Entrar</button>
        </form>
      </div>
    );
  }

  // PANTALLA 2: VISTA NORMAL CON PESTAÑAS
  return (
    <div>
      {/* MENÚ DE PESTAÑAS (TABS) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '2px solid #E2E8F0' }}>
        <button 
          onClick={() => setTabActiva('documentos')}
          style={{
            background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', paddingBottom: '10px',
            color: tabActiva === 'documentos' ? 'var(--esmeralda)' : 'var(--carbon-light)',
            borderBottom: tabActiva === 'documentos' ? '3px solid var(--esmeralda)' : '3px solid transparent',
            transition: '0.3s'
          }}
        >
          📄 Mis Documentos
        </button>
        <button 
          onClick={() => setTabActiva('perfil')}
          style={{
            background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', paddingBottom: '10px',
            color: tabActiva === 'perfil' ? 'var(--esmeralda)' : 'var(--carbon-light)',
            borderBottom: tabActiva === 'perfil' ? '3px solid var(--esmeralda)' : '3px solid transparent',
            transition: '0.3s'
          }}
        >
          🔐 Mi Perfil y Seguridad
        </button>
      </div>

      {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
      {tabActiva === 'documentos' ? (
        
        /* --- TAB 1: DOCUMENTOS --- */
        <div className="portal-card">
          <h3 className="portal-card-title">Documentos Financieros</h3>
          {!documentos || documentos.length === 0 ? (
            <p className="portal-empty-text">No hay documentos disponibles en este momento.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F4F7F5', color: '#2D6A4F', borderBottom: '2px solid #A8E6CF' }}>
                    <th style={{ padding: '15px' }}>Fecha</th>
                    <th style={{ padding: '15px' }}>Título del Documento</th>
                    <th style={{ padding: '15px' }}>Categoría</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '15px', color: '#666' }}>{doc.fecha}</td>
                      <td style={{ padding: '15px', fontWeight: '500', color: '#2F3E46' }}>{doc.titulo}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ backgroundColor: '#E8EDE9', padding: '6px 10px', borderRadius: '4px', fontSize: '0.85rem', color: '#52796F', fontWeight: '500' }}>
                          {doc.tipo}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '8px 16px', display: 'inline-block', fontSize: '0.9rem', textDecoration: 'none' }}>
                          Ver Archivo
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      ) : (

        /* --- TAB 2: MI PERFIL (APARTADO SEPARADO) --- */
        <div className="portal-card" style={{ maxWidth: '500px' }}>
          <h3 className="portal-card-title">Seguridad de la Cuenta</h3>
          <p style={{ marginBottom: '25px', color: 'var(--carbon-light)' }}>
            Para actualizar tu contraseña, por favor ingresa tu clave actual para verificar tu identidad.
          </p>
          
          <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Contraseña Actual</label>
              <input type="password" className="input" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} required />
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '10px 0' }} />

            <div>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Nueva Contraseña</label>
              <input type="password" className="input" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Confirmar Nueva Contraseña</label>
              <input type="password" className="input" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} required />
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '15px' }}>Actualizar Contraseña</button>
          </form>
        </div>
      )}
    </div>
  );
}