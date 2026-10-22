<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const correo = ref('admin@itsm.edu.mx')
const contrasena = ref('password123')
const cargando = ref(false)
const mensaje = ref('')
const error = ref('')
const usuarioActual = ref(null)

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const res = await api.auth.me()
      usuarioActual.value = res.usuario
    } catch {
      usuarioActual.value = null
    }
  }
})

async function iniciarSesion() {
  cargando.value = true
  mensaje.value = ''
  error.value = ''

  try {
    const res = await api.auth.login(correo.value, contrasena.value)
    localStorage.setItem('token', res.token)
    localStorage.setItem('usuario', JSON.stringify(res.usuario))
    usuarioActual.value = res.usuario
    mensaje.value = 'Inicio de sesión exitoso. Bienvenido, ' + res.usuario.nombre
  } catch (err) {
    error.value = err.message || 'Error al autenticar'
  } finally {
    cargando.value = false
  }
}

async function cerrarSesion() {
  try {
    await api.auth.logout()
  } catch {
    // Si falla el logout remoto, limpiamos de todas formas
  }
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  usuarioActual.value = null
  mensaje.value = 'Sesión cerrada exitosamente.'
}
</script>

<template>
  <section>
    <h2>Módulo de Autenticación</h2>

    <div v-if="usuarioActual">
      <p>
        <strong>Sesión activa:</strong> {{ usuarioActual.nombre }} ({{ usuarioActual.correo }}) -
        <strong>Rol:</strong> {{ usuarioActual.rol }}
      </p>
      <button type="button" @click="cerrarSesion">Cerrar Sesión</button>
    </div>

    <div v-else>
      <form @submit.prevent="iniciarSesion">
        <fieldset>
          <legend>Ingresar al Sistema</legend>

          <div>
            <label for="correo">Correo Electrónico:</label><br />
            <input
              id="correo"
              v-model="correo"
              type="email"
              required
              placeholder="ejemplo@itsm.edu.mx"
            />
          </div>

          <br />

          <div>
            <label for="contrasena">Contraseña:</label><br />
            <input
              id="contrasena"
              v-model="contrasena"
              type="password"
              required
              placeholder="Contraseña"
            />
          </div>

          <br />

          <button type="submit" :disabled="cargando">
            {{ cargando ? 'Iniciando sesión...' : 'Entrar' }}
          </button>
        </fieldset>
      </form>
    </div>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>
  </section>
</template>
