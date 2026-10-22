<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const notificaciones = ref([])
const noLeidas = ref(0)
const cargando = ref(true)
const mensaje = ref('')
const error = ref('')

async function cargarNotificaciones() {
  cargando.value = true
  try {
    const res = await api.notificaciones.listar()
    notificaciones.value = res.notificaciones || []
    noLeidas.value = res.no_leidas || 0
  } catch (err) {
    error.value = err.message || 'Error al cargar notificaciones'
  } finally {
    cargando.value = false
  }
}

async function marcarLeida(id) {
  try {
    await api.notificaciones.marcarLeida(id)
    await cargarNotificaciones()
  } catch (err) {
    error.value = err.message || 'Error al marcar notificación'
  }
}

async function marcarTodasLeidas() {
  try {
    await api.notificaciones.marcarTodasLeidas()
    mensaje.value = 'Todas las notificaciones fueron marcadas como leídas.'
    await cargarNotificaciones()
  } catch (err) {
    error.value = err.message || 'Error al actualizar notificaciones'
  }
}

onMounted(() => {
  cargarNotificaciones()
})
</script>

<template>
  <section>
    <h2>Módulo de Notificaciones</h2>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>

    <p>
      <strong>Notificaciones sin leer:</strong> {{ noLeidas }}
      <button
        v-if="noLeidas > 0"
        type="button"
        @click="marcarTodasLeidas"
      >
        Marcar Todas como Leídas
      </button>
    </p>

    <p v-if="cargando">Cargando notificaciones...</p>

    <table v-else border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Título</th>
          <th>Mensaje</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in notificaciones" :key="n.id_notificacion">
          <td>{{ n.tipo }}</td>
          <td><strong>{{ n.titulo }}</strong></td>
          <td>{{ n.mensaje }}</td>
          <td>{{ n.fecha_creacion }}</td>
          <td>{{ n.leida ? 'Leída' : 'NO LEÍDA' }}</td>
          <td>
            <button
              v-if="!n.leida"
              type="button"
              @click="marcarLeida(n.id_notificacion)"
            >
              Marcar Leída
            </button>
          </td>
        </tr>
        <tr v-if="notificaciones.length === 0">
          <td colspan="6">No tienes notificaciones.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
