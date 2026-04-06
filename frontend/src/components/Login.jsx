import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [estadoRespuesta, setEstadoRespuesta] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);

  // NUEVO: Bloqueo inteligente. Si ya inició sesión, lo enviamos al portal.
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioAncon');
    if (usuarioGuardado) {
      navigate('/portal');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setEstadoRespuesta({ tipo: '', texto: '' });

    try {
      const response = await fetch('http://localhost:8080/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setEstadoRespuesta({ tipo: 'exito', texto: `¡Acceso concedido, bienvenido ${data.usuario.nombre}!` });
        localStorage.setItem('usuarioAncon', JSON.stringify(data.usuario));
        
        setTimeout(() => {
          navigate('/portal');
        }, 1000); 

      } else {
        setEstadoRespuesta({ tipo: 'error', texto: data.error || 'Credenciales incorrectas.' });
      }
    } catch (error) {
      console.error('Error de red:', error);
      setEstadoRespuesta({ 
        tipo: 'error', 
        texto: 'No se pudo conectar con el servidor.' 
      });
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
        <Link to="/" className="btn-back">
          &larr; Volver al inicio
        </Link>

        <h2 className="section-title" style={{ textAlign: 'center' }}>Portal de Clientes</h2>
        <p className="text login-subtitle">
          Ingresa tus credenciales para acceder a tus documentos financieros.
        </p>
        
        <form className="form" onSubmit={handleSubmit}>
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
          
          <button type="submit" className="btn-primary btn-full-width" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>

          {estadoRespuesta.texto && (
            <p className={`form-message ${estadoRespuesta.tipo === 'error' ? 'error' : 'success'}`}>
              {estadoRespuesta.texto}
            </p>
          )}
        </form>
      </motion.div>
    </section>
  );
}