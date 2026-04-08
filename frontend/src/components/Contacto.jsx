import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Contacto() {
  // 1. Variables de estado para guardar lo que el usuario escribe
  const [formData, setFormData] = useState({
    empresa: '',
    email: '',
    mensaje: ''
  });

  // Variables para mostrarle al usuario si se envió bien, si hay error o si está cargando
  const [estadoRespuesta, setEstadoRespuesta] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);

  // 2. Función que actualiza el estado cada vez que se teclea una letra
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value // Usa el 'name' del input para saber qué actualizar
    });
  };

  // 3. Función principal que envía los datos a tu Docker (PHP)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se actualice y se pierdan los datos
    setCargando(true);
    setEstadoRespuesta({ tipo: '', texto: '' }); // Limpiamos mensajes anteriores

    try {
      // Hacemos la petición a tu servidor local de pruebas
      const response = await fetch('http://localhost:8080/contacto.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Convertimos los datos a texto para que PHP los entienda
      });

      // Leemos la respuesta de tu archivo contacto.php
      const data = await response.json();

      if (response.ok) {
        // Si todo sale bien (Código 200)
        setEstadoRespuesta({ tipo: 'exito', texto: data.mensaje || 'Mensaje enviado correctamente.' });
        // Limpiamos las casillas para que queden en blanco de nuevo
        setFormData({ empresa: '', email: '', mensaje: '' });
      } else {
        // Si el PHP detecta un error (ej: correo inválido)
        setEstadoRespuesta({ tipo: 'error', texto: data.error || 'Hubo un problema al enviar.' });
      }
    } catch (error) {
      // Si el servidor de Docker está apagado o falla la conexión
      console.error('Error de red:', error);
      setEstadoRespuesta({ 
        tipo: 'error', 
        texto: 'No se pudo conectar con el servidor. Verifica que tu entorno esté activo.' 
      });
    } finally {
      // Terminamos de cargar, sea cual sea el resultado
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
        
        {/* Agregamos el onSubmit al formulario */}
        <form className="form" onSubmit={handleSubmit}>
          
          {/* Agregamos name, value, onChange y required a cada input */}
          <input 
            type="text" 
            name="empresa"
            placeholder="Nombre de la empresa" 
            className="input" 
            value={formData.empresa}
            onChange={handleChange}
            required
          />
          <input 
            type="email" 
            name="email"
            placeholder="Correo electrónico" 
            className="input" 
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea 
            name="mensaje"
            placeholder="¿En qué podemos ayudarte?" 
            className="textarea"
            value={formData.mensaje}
            onChange={handleChange}
            required
          ></textarea>
          
          {/* Desactivamos el botón si está cargando para que no hagan doble clic */}
          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Enviando...' : 'Enviar Mensaje'}
          </button>

          {/* Bloque para mostrar el mensaje de feedback (usando las clases de App.css) */}
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