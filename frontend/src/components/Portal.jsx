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
              setDocumentos(data.documentos || []); // Llenamos los documentos del admin
            } else {
              setDocumentos(data.documentos || []); // Llenamos los documentos del cliente
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
// VISTA DEL ADMINISTRADOR (CON DROPDOWN FILTRO Y BOTÓN VER)
// ==========================================
function VistaAdmin({ clientes, documentos }) {
  const [formData, setFormData] = useState({ cliente_id: '', titulo: '', tipo: 'Contabilidad', url: '' });
  const [filtroCliente, setFiltroCliente] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/subir_documento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("✅ " + data.mensaje);
        setFormData({ cliente_id: '', titulo: '', tipo: 'Contabilidad', url: '' });
        window.location.reload(); 
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (error) {
      alert("❌ No se pudo conectar con el servidor.");
    }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Estás seguro de que quieres eliminar este documento? El cliente ya no podrá verlo.")) {
      try {
        const response = await fetch('http://localhost:8080/eliminar_documento.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documento_id: id }),
        });
        if (response.ok) {
          window.location.reload(); 
        }
      } catch (error) {
        alert("Error al eliminar el documento.");
      }
    }
  };

  const documentosMostrados = filtroCliente 
    ? documentos.filter(doc => doc.cliente_nombre === filtroCliente)
    : documentos;

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      
      {/* FORMULARIO */}
      <div className="portal-card">
        <h3 className="portal-card-title">Compartir Nuevo Documento</h3>
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

      {/* TABLA DE DOCUMENTOS CON FILTRO DROPDOWN */}
      <div className="portal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #A8E6CF', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, color: '#2D6A4F', fontSize: '1.5rem' }}>Documentos Activos</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: '500', color: '#52796F' }}>Mostrar:</label>
            <select 
              value={filtroCliente} 
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="input"
              style={{ padding: '8px 12px', minWidth: '200px' }}
            >
              <option value="">Todos los clientes</option>
              {clientes.map(c => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
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
                    
                    {/* AQUI ESTÁN LOS BOTONES VER Y ELIMINAR JUNTOS */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ backgroundColor: '#2D6A4F', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', transition: '0.3s' }}
                        >
                          Ver
                        </a>
                        <button 
                          onClick={() => handleEliminar(doc.id)}
                          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', transition: '0.3s' }}
                        >
                          Eliminar
                        </button>
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
// VISTA DEL CLIENTE
// ==========================================
function VistaCliente({ documentos }) {
  return (
    <div className="portal-card">
      <h3 className="portal-card-title">Mis Documentos Financieros</h3>
      
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
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '8px 16px', display: 'inline-block', fontSize: '0.9rem', textDecoration: 'none' }}
                    >
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
  );
}