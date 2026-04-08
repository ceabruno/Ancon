import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // Estado para saber si estamos en "Login" o en "Recuperar Contraseña"
  const [vistaRecuperar, setVistaRecuperar] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [emailRecuperacion, setEmailRecuperacion] = useState('');
  
  const [estadoRespuesta, setEstadoRespuesta] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);

  // Bloqueo inteligente (si ya inició sesión, va al portal)
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioAncon');
    if (usuarioGuardado) navigate('/portal');
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // FUNCIÓN 1: INICIAR SESIÓN NORMAL
  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setEstadoRespuesta({ tipo: '', texto: '' });

    try {
      const response = await fetch('http://localhost:8080/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setEstadoRespuesta({ tipo: 'exito', texto: `¡Acceso concedido!` });
        localStorage.setItem('usuarioAncon', JSON.stringify(data.usuario));
        setTimeout(() => navigate('/portal'), 1000); 
      } else {
        setEstadoRespuesta({ tipo: 'error', texto: data.error || 'Credenciales incorrectas.' });
      }
    } catch (error) {
      setEstadoRespuesta({ tipo: 'error', texto: 'No se pudo conectar con el servidor.' });
    } finally {
      setCargando(false);
    }
  };

  // FUNCIÓN 2: RECUPERAR CONTRASEÑA
  const handleRecuperar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setEstadoRespuesta({ tipo: '', texto: '' });

    try {
      const response = await fetch('http://localhost:8080/recuperar_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailRecuperacion }),
      });

      const data = await response.json();

      if (response.ok) {
        setEstadoRespuesta({ tipo: 'exito', texto: data.mensaje });
        // Después de 5 segundos, devolvemos al usuario a la pantalla de login
        setTimeout(() => {
          setVistaRecuperar(false);
          setEstadoRespuesta({ tipo: '', texto: '' });
        }, 5000);
      } else {
        setEstadoRespuesta({ tipo: 'error', texto: data.error });
      }
    } catch (error) {
      setEstadoRespuesta({ tipo: 'error', texto: 'No se pudo conectar con el servidor.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <section id="login" className="section-light login-section">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className="container login-container"
      >
        <Link to="/" className="btn-back">&larr; Volver al inicio</Link>

        {/* --- VISTA: RECUPERAR CONTRASEÑA --- */}
        {vistaRecuperar ? (
          <>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Recuperar Acceso</h2>
            <p className="text login-subtitle">Ingresa tu correo y te enviaremos una contraseña temporal.</p>
            
            <form className="form" onSubmit={handleRecuperar}>
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                className="input" 
                value={emailRecuperacion}
                onChange={(e) => setEmailRecuperacion(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary btn-full-width" disabled={cargando}>
                {cargando ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => { setVistaRecuperar(false); setEstadoRespuesta({ tipo: '', texto: '' }); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--carbon-light)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Cancelar y volver
                </button>
              </div>

              {estadoRespuesta.texto && (
                <p className={`form-message ${estadoRespuesta.tipo === 'error' ? 'error' : 'success'}`}>
                  {estadoRespuesta.texto}
                </p>
              )}
            </form>
          </>

        ) : (
          
          /* --- VISTA: LOGIN NORMAL --- */
          <>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Portal de Clientes</h2>
            <p className="text login-subtitle">Ingresa tus credenciales para acceder a tus documentos.</p>
            
            <form className="form" onSubmit={handleLogin}>
              <input 
                type="email" 
                name="email"
                placeholder="Correo electrónico" 
                className="input" 
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input 
                type="password" 
                name="password"
                placeholder="Contraseña" 
                className="input" 
                value={formData.password}
                onChange={handleChange}
                required
              />
              
              <div style={{ textAlign: 'right', marginTop: '-10px' }}>
                <button 
                  type="button" 
                  onClick={() => { setVistaRecuperar(true); setEstadoRespuesta({ tipo: '', texto: '' }); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--esmeralda)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button type="submit" className="btn-primary btn-full-width" disabled={cargando}>
                {cargando ? 'Verificando...' : 'Iniciar Sesión'}
              </button>

              {estadoRespuesta.texto && (
                <p className={`form-message ${estadoRespuesta.tipo === 'error' ? 'error' : 'success'}`}>
                  {estadoRespuesta.texto}
                </p>
              )}
            </form>
          </>
        )}
      </motion.div>
    </section>
  );
}