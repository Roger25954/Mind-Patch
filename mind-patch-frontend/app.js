// Atrapamos el formulario cuando el usuario hace clic en "Iniciar Sesión"
document.getElementById('formulario-login').addEventListener('submit', async (evento) => {
    
    // Evitamos que la página se recargue (comportamiento por defecto de HTML)
    evento.preventDefault();

    // Obtenemos los valores que el usuario escribió
    const correoIngresado = document.getElementById('correo').value;
    const passwordIngresado = document.getElementById('password').value;
    const mensajeError = document.getElementById('mensaje-error');

    try {
        // Hacemos la petición a tu servidor local (igual que en Thunder Client)
        const respuesta = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: correoIngresado,
                password: passwordIngresado
            })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            localStorage.setItem('mindpatch_token', datos.token);
            // ...
            setTimeout(() => window.location.href = 'panel.html', 1000); // 🟢 Ahora sí redirigimos
        }
            
            
        else {
            // Mostrar error si la contraseña o correo están mal
            mensajeError.style.color = '#ef4444'; // Rojo
            mensajeError.innerText = "❌ " + datos.error;
            mensajeError.style.display = 'block';
        }

    } catch (error) {
        mensajeError.style.color = '#ef4444';
        mensajeError.innerText = "❌ No se pudo conectar con el servidor. ¿Está encendido?";
        mensajeError.style.display = 'block';
    }
});