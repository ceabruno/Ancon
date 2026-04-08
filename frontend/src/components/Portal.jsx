import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Portal() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioAncon');
    if (!usuarioGuardado) navigate('/login');
    else setUsuario(JSON.parse(usuarioGuardado));
  }, [navigate]);

  const handleCerrarSesion = async () => {
    if (usuario && usuario.token) {
      await fetch(import.meta.env.VITE_API_URL + '/logout.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${usuario.token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('usuarioAncon');
    navigate('/login');
  };

  useEffect(() => {
    if (usuario) {
      const cargarDatos = async () => {
        try {
          const response = await fetch(import.meta.env.VITE_API_URL + 'obtener_datos.php', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${usuario.token}` 
            }
          });
          const data = await response.json();
          if (response.ok) {
            setClientes(data.clientes || []); 
            setDocumentos(data.documentos || []); 
          } else { handleCerrarSesion(); }
        } catch (error) { console.error("Error:", error); }
      };
      cargarDatos();
    }
  }, [usuario]);

  if (!usuario) return null;

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <h2 className="portal-header-title">AnCon SPA - Portal Privado</h2>
        <div className="portal-user-info">
          <span>Hola, <strong>{usuario.nombre}</strong> <small>({usuario.rol})</small></span>
          <button onClick={handleCerrarSesion} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>
      <main className="portal-main">
        {usuario.rol === 'admin' ? 
          <VistaAdmin clientes={clientes} documentos={documentos} token={usuario.token} /> : 
          <VistaCliente documentos={documentos} token={usuario.token} />
        }
      </main>
    </div>
  );
}

function VistaAdmin({ clientes, documentos, token }) {
  const [formData, setFormData] = useState({ cliente_id: '', titulo: '', tipo: 'Contabilidad', url: '' });
  const [filtroCliente, setFiltroCliente] = useState('');
  const [formCliente, setFormCliente] = useState({ nombre: '', email: '' });

  const apiFetch = async (url, body) => {
    const baseUrl = import.meta.env.VITE_API_URL;

    return fetch(`${baseUrl}/${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await apiFetch('subir_documento.php', formData);
    if (res.ok) { alert("✅ Guardado"); window.location.reload(); }
  };

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    const res = await apiFetch('crear_cliente.php', formCliente);
    if (res.ok) { alert("✅ Cliente Creado"); window.location.reload(); }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Está seguro que desea eliminar el documento?")) {
      await apiFetch('eliminar_documento.php', { documento_id: id });
      window.location.reload();
    }
  };

  const docs = filtroCliente ? documentos.filter(doc => doc.cliente_nombre === filtroCliente) : documentos;

  return (
    <div className="portal-grid">
      <div className="portal-split-grid">
        <div className="portal-card">
          <h3 className="portal-card-title">Nuevo Cliente</h3>
          <form onSubmit={handleCrearCliente} className="portal-form-grid">
            <div className="form-group"><label>Nombre</label><input type="text" className="input" onChange={e => setFormCliente({...formCliente, nombre: e.target.value})} required /></div>
            <div className="form-group"><label>Email</label><input type="email" className="input" onChange={e => setFormCliente({...formCliente, email: e.target.value})} required /></div>
            <button type="submit" className="btn-primary">Crear Cuenta</button>
          </form>
        </div>
        <div className="portal-card">
          <h3 className="portal-card-title">Subir Documento</h3>
          <form onSubmit={handleSubmit} className="portal-form-grid-2">
            <div className="form-group"><label>Cliente</label>
              <select className="input" onChange={e => setFormData({...formData, cliente_id: e.target.value})} required>
                <option value="">--</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Tipo</label>
              <select className="input" onChange={e => setFormData({...formData, tipo: e.target.value})}>
                <option value="Contabilidad">Contabilidad</option><option value="Impuestos">Impuestos</option>
              </select>
            </div>
            <input type="text" placeholder="Título" className="input grid-col-full" onChange={e => setFormData({...formData, titulo: e.target.value})} required />
            <input type="url" placeholder="URL Drive" className="input grid-col-full" onChange={e => setFormData({...formData, url: e.target.value})} required />
            <button type="submit" className="btn-primary grid-col-full">Guardar</button>
          </form>
        </div>
      </div>
      <div className="portal-card">
        <div className="portal-card-header"><h3>Documentos</h3>
          <select onChange={e => setFiltroCliente(e.target.value)} className="input"><option value="">Todos</option>{clientes.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}</select>
        </div>
        <table className="portal-table">
          <thead><tr><th>Cliente</th><th>Doc</th><th className="text-center">Acción</th></tr></thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id}><td>{d.cliente_nombre}</td><td>{d.titulo}</td>
                <td className="table-actions">
                  <a href={d.url} target="_blank" className="btn-sm btn-view">Ver</a>
                  <button onClick={() => handleEliminar(d.id)} className="btn-sm btn-delete">X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VistaCliente({ documentos, token }) {
  const [usuarioLocal, setUsuarioLocal] = useState(JSON.parse(localStorage.getItem('usuarioAncon')));
  const [tabActiva, setTabActiva] = useState('documentos');
  const [pass, setPass] = useState({ actual: '', nueva: '', confirma: '' });

  const cambiarClave = async (e) => {
    e.preventDefault();
    if (pass.nueva !== pass.confirma) return alert("No coinciden");
    const res = await fetch(import.meta.env.VITE_API_URL + 'cambiar_password.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ password_actual: pass.actual, nueva_password: pass.nueva })
    });
    if (res.ok) { 
      alert("✅ Éxito"); 
      const updated = {...usuarioLocal, debe_cambiar_pass: 0};
      localStorage.setItem('usuarioAncon', JSON.stringify(updated));
      setUsuarioLocal(updated);
      setTabActiva('documentos');
    } else { alert("Error al cambiar clave"); }
  };

  if (usuarioLocal.debe_cambiar_pass == 1) {
    return (
      <div className="portal-card portal-alert-card">
        <h3>🔒 Primera Sesión</h3>
        <form onSubmit={cambiarClave} className="portal-form-grid">
          <input type="password" placeholder="Nueva Clave" className="input" onChange={e => setPass({...pass, nueva: e.target.value})} required />
          <input type="password" placeholder="Confirmar" className="input" onChange={e => setPass({...pass, confirma: e.target.value})} required />
          <button type="submit" className="btn-primary">Establecer Clave</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="tabs-container">
        <button onClick={() => setTabActiva('documentos')} className={`tab-btn ${tabActiva === 'documentos' ? 'active' : ''}`}>Documentos</button>
        <button onClick={() => setTabActiva('perfil')} className={`tab-btn ${tabActiva === 'perfil' ? 'active' : ''}`}>Seguridad</button>
      </div>
      {tabActiva === 'documentos' ? (
        <div className="portal-card">
          <table className="portal-table">
            <thead><tr><th>Fecha</th><th>Título</th><th className="text-center">Acción</th></tr></thead>
            <tbody>
              {documentos.map(d => (
                <tr key={d.id}><td>{d.fecha}</td><td>{d.titulo}</td>
                  <td className="text-center"><a href={d.url} target="_blank" className="btn-primary btn-sm">Ver</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="portal-card" style={{maxWidth:'400px'}}>
          <h3>Cambiar Clave</h3>
          <form onSubmit={cambiarClave} className="portal-form-grid">
            <input type="password" placeholder="Clave Actual" className="input" onChange={e => setPass({...pass, actual: e.target.value})} required />
            <input type="password" placeholder="Nueva Clave" className="input" onChange={e => setPass({...pass, nueva: e.target.value})} required />
            <input type="password" placeholder="Confirmar" className="input" onChange={e => setPass({...pass, confirma: e.target.value})} required />
            <button type="submit" className="btn-primary">Actualizar</button>
          </form>
        </div>
      )}
    </div>
  );
}