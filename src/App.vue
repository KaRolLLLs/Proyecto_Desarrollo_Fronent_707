<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import api from './services/api'

const estadoConexion = ref('Comprobando...')
const usuario = ref(null)

async function verificarConexion() {
  try {
    const res = await api.ping()
    estadoConexion.value = 'Conectado a Laravel (' + res.status + ')'
  } catch (err) {
    estadoConexion.value = 'Sin conexión con Backend (Inicia php artisan serve)'
  }
}

function actualizarUsuario() {
  const u = localStorage.getItem('usuario')
  usuario.value = u ? JSON.parse(u) : null
}

onMounted(() => {
  verificarConexion()
  actualizarUsuario()
})
</script>

<template>
  <div>
    <!-- Encabezado del Sistema -->
    <header>
      <h1>Sistema de Gestión de Inglés</h1>
      <p>
        <strong>Estado de API Backend:</strong> {{ estadoConexion }} |
        <strong>Usuario:</strong>
        {{ usuario ? `${usuario.nombre} [${usuario.rol}]` : 'No autenticado' }}
      </p>

      <!-- Navegación de Módulos del Sistema -->
      <nav>
        <p>
          <RouterLink to="/">[ Dashboard ]</RouterLink> |
          <RouterLink to="/login">[ Autenticación / Login ]</RouterLink> |
          <RouterLink to="/cursos">[ Cursos ]</RouterLink> |
          <RouterLink to="/periodos">[ Periodos ]</RouterLink> |
          <RouterLink to="/grupos">[ Grupos y Horarios ]</RouterLink> |
          <RouterLink to="/estudiantes">[ Estudiantes ]</RouterLink> |
          <RouterLink to="/docentes">[ Docentes ]</RouterLink> |
          <RouterLink to="/matriculas">[ Matrículas ]</RouterLink> |
          <RouterLink to="/academico">[ Académico ]</RouterLink> |
          <RouterLink to="/solicitudes">[ Solicitudes ]</RouterLink> |
          <RouterLink to="/notificaciones">[ Notificaciones ]</RouterLink>
        </p>
      </nav>
      <hr />
    </header>

    <!-- Contenido del Módulo Activo -->
    <main>
      <RouterView />
    </main>
  </div>
</template>