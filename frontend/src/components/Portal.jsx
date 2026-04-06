import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Portal() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioAncon');
    
    if (!usuarioGuardado) {
      navigate('/login');
    } else {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, [navigate]);

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioAncon');
    navigate('/login');
  };

  if (!usuario) return null;

  return (
    <div className="portal-layout">
      {/* Barra de Navegación del Portal */}
      <header className="portal-header">
        <h2 className="portal-header-title">AnCon SPA - Portal de Clientes</h2>
        
        <div className="portal-user-info">
            <span>Hola, <strong>{usuario.nombre}</strong> ({usuario.rol})</span>
            {/* CAMBIO DE CLASE AQUÍ */}
            <button onClick={handleCerrarSesion} className="btn-logout">
                Cerrar Sesión
            </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="portal-main">
        <div className="portal-card">
          <h3 className="portal-card-title">
            Mis Documentos Financieros
          </h3>
          
          <p className="portal-empty-text">No hay documentos disponibles en este momento.</p>
        </div>
      </main>
    </div>
  );
}