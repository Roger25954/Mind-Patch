// 1. Verificación de Seguridad: ¿Tiene permiso para estar aquí?
const token = localStorage.getItem('mindpatch_token');

if (!token) {
    window.location.href = 'index.html'; // Si no hay token, fuera.
}

// 2. Función para cargar las evaluaciones desde el Backend
async function cargarDatos() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/evaluaciones/1', { // Consultamos la #1 por ahora
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            mostrarEnPantalla(datos.evaluacion);
        } else {
            document.getElementById('lista-evaluaciones').innerHTML = `<p style="color:red">Error: ${datos.error}</p>`;
        }
    } catch (error) {
        console.error("Error de conexión", error);
    }
}

// 3. Pintar la información en el HTML
function mostrarEnPantalla(evaluacion) {
    const contenedor = document.getElementById('lista-evaluaciones');
    
    // Si la IA ya hizo el análisis, lo mostramos bonito
    const perfil = evaluacion.perfil;
    const fortalezas = perfil ? perfil.perfil_observado.fortalezas.join(', ') : "Pendiente de análisis";

    contenedor.innerHTML = `
        <div class="card">
            <h3>Última Actividad: ${evaluacion.metricas.actividad}</h3>
            <p><strong>Fecha:</strong> ${new Date(evaluacion.fecha_evaluacion).toLocaleDateString()}</p>
            <p><strong>Desempeño (Aciertos):</strong> ${evaluacion.metricas.tasa_aciertos_porcentaje}%</p>
            <hr>
            <h4>🧠 Perfil Cognitivo (IA Gemini):</h4>
            <p><strong>Fortalezas:</strong> ${fortalezas}</p>
            <p style="font-size: 12px; color: #64748b;"><em>${perfil ? perfil.note_etica : ""}</em></p>
        </div>
    `;
}

function cerrarSesion() {
    localStorage.removeItem('mindpatch_token');
    window.location.href = 'index.html';
}

// Arrancar la carga al abrir la página
cargarDatos();
