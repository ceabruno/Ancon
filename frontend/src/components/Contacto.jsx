import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Contacto() {
  const [formData, setFormData] = useState({
    empresa: '',
    email: '',
    mensaje: '',
    telefono_secundario: '' // <-- ESTE ES EL HONEYPOT
  });

  const [estadoRespuesta, setEstadoRespuesta] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState(0);

  // Cuando el componente carga, guardamos la marca de tiempo (Timestamp)
  useEffect(() => {
    setTiempoInicio(Date.now());
  }, []);

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

    // Calculamos cuánto tiempo tardó en enviar desde que cargó la página (en segundos)
    const tiempoTardado = (Date.now() - tiempoInicio) / 1000;

    try {
      const response = await fetch('http://localhost:8080/contacto.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos los datos + el tiempo que tardó
        body: JSON.stringify({ ...formData, tiempo_tardado: tiempoTardado }), 
      });

      const data = await response.json();

      if (response.ok) {
        setEstadoRespuesta({ tipo: 'exito', texto: data.mensaje || 'Mensaje enviado correctamente.' });
        setFormData({ empresa: '', email: '', mensaje: '', telefono_secundario: '' });
        // Reiniciamos el reloj para un nuevo mensaje potencial
        setTiempoInicio(Date.now());
      } else {
        setEstadoRespuesta({ tipo: 'error', texto: data.error || 'Hubo un problema al enviar.' });
      }
    } catch (error) {
      console.error('Error de red:', error);
      setEstadoRespuesta({ 
        tipo: 'error', 
        texto: 'No se pudo conectar con el servidor. Verifica que tu entorno esté activo.' 
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <section id="contacto" className="section-light">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container"
      >
        <h2 className="section-title">Agendar Reunión</h2>
        <p className="text">Déjanos tus datos y nos pondremos en contacto contigo a la brevedad para coordinar nuestra reunión.</p>
        
        <form className="form" onSubmit={handleSubmit}>
          
          <input 
            type="text" 
            name="empresa"
            placeholder="Nombre de la empresa" 
            className="input" 
            value={formData.empresa}
            onChange={handleChange}
            required /* OBLIGATORIO */
          />
          <input 
            type="email" 
            name="email"
            placeholder="Correo electrónico" 
            className="input" 
            value={formData.email}
            onChange={handleChange}
            required /* OBLIGATORIO */
          />

          {/* --- INICIO DEL HONEYPOT --- */}
          {/* Se usa opacity: 0 y position absolute para que no ocupe espacio visual, 
              pero siga en el DOM para que los bots tontos lo llenen. 
              NO TIENE el atributo required. */}
          <div style={{ opacity: 0, position: 'absolute', top: '-9999px', left: '-9999px' }} aria-hidden="true">
            <label htmlFor="telefono_secundario">Por favor, deja este campo vacío si eres humano</label>
            <input 
              type="text" 
              name="telefono_secundario" 
              id="telefono_secundario"
              value={formData.telefono_secundario}
              onChange={handleChange}
              tabIndex="-1" 
              autoComplete="off"
            />
          </div>
          {/* --- FIN DEL HONEYPOT --- */}

          <textarea 
            name="mensaje"
            placeholder="¿En qué podemos ayudarte?" 
            className="textarea"
            value={formData.mensaje}
            onChange={handleChange}
            required /* OBLIGATORIO */
          ></textarea>
          
          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Enviando...' : 'Enviar Mensaje'}
          </button>

          {estadoRespuesta.texto && (
            <p className={`form-message ${estadoRespuesta.tipo === 'error' ? 'error' : 'exito'}`}>
              {estadoRespuesta.texto}
            </p>
          )}

        </form>
      </motion.div>
    </section>
  );
}