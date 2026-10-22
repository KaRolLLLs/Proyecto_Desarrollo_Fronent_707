<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const solicitudes = ref([])
const tipos = ref([])
const cargando = ref(true)
const mensaje = ref('')
const error = ref('')

const nuevaSolicitud = ref({
  id_tipo_solicitud: '',
  asunto: '',
  descripcion: '',
})

const solicitudSeleccionada = ref(null)
const respuestaForm = ref({
  estado: 'aprobado',
  respuesta: '',
  comentario: '',
})

async function cargarDatos() {
  cargando.value = true
  try {
    const [resSols, resTipos] = await Promise.all([
      api.solicitudes.listar(),
      api.solicitudes.tipos(),
    ])
    solicitudes.value = resSols.solicitudes || []
    tipos.value = resTipos.tipos || []

    if (tipos.value.length > 0 && !nuevaSolicitud.value.id_tipo_solicitud) {
      nuevaSolicitud.value.id_tipo_solicitud = tipos.value[0].id_tipo_solicitud
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar solicitudes'
  } finally {
    cargando.value = false
  }
}

async function crearSolicitud() {
  mensaje.value = ''
  error.value = ''

  try {
    const res = await api.solicitudes.crear(nuevaSolicitud.value)
    mensaje.value = 'Solicitud creada con folio ' + res.solicitud.folio
    nuevaSolicitud.value = {
      id_tipo_solicitud: tipos.value[0]?.id_tipo_solicitud || '',
      asunto: '',
      descripcion: '',
    }
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'Error al registrar solicitud'
  }
}

async function verDetalle(id) {
  try {
    const res = await api.solicitudes.obtener(id)
    solicitudSeleccionada.value = res.solicitud
    respuestaForm.value = {
      estado: res.solicitud.estado,
      respuesta: res.solicitud.respuesta || '',
      comentario: '',
    }
  } catch (err) {
    error.value = err.message || 'Error al ver detalle de solicitud'
  }
}

async function atenderSolicitud() {
  if (!solicitudSeleccionada.value) return
  mensaje.value = ''
  error.value = ''

  try {
    await api.solicitudes.atender(
      solicitudSeleccionada.value.id_solicitud,
      respuestaForm.value
    )
    mensaje.value = 'Solicitud ' + solicitudSeleccionada.value.folio + ' actualizada.'
    await verDetalle(solicitudSeleccionada.value.id_solicitud)
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'Error al atender solicitud'
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <section>
    <h2>Módulo de Solicitudes y Trámites</h2>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>

    <!-- Formulario para crear solicitud -->
    <form @submit.prevent="crearSolicitud">
      <fieldset>
        <legend>Crear Nueva Solicitud o Trámite</legend>

        <div>
          <label for="sol_tipo">Tipo de Trámite:</label><br />
          <select id="sol_tipo" v-model="nuevaSolicitud.id_tipo_solicitud" required>
            <option
              v-for="t in tipos"
              :key="t.id_tipo_solicitud"
              :value="t.id_tipo_solicitud"
            >
              {{ t.nombre }} {{ t.requiere_adjunto ? '(Requiere adjunto)' : '' }}
            </option>
          </select>
        </div>

        <br />

        <div>
          <label for="sol_asunto">Asunto:</label><br />
          <input
            id="sol_asunto"
            v-model="nuevaSolicitud.asunto"
            type="text"
            required
            placeholder="Ej. Constancia de nivel vigente"
          />
        </div>

        <br />

        <div>
          <label for="sol_desc">Descripción o Motivo:</label><br />
          <textarea
            id="sol_desc"
            v-model="nuevaSolicitud.descripcion"
            rows="3"
            placeholder="Detalles de la petición"
          ></textarea>
        </div>

        <br />

        <button type="submit">Enviar Solicitud</button>
      </fieldset>
    </form>

    <hr />

    <!-- Tabla de Solicitudes -->
    <h3>Bandeja de Solicitudes</h3>
    <p v-if="cargando">Cargando trámites...</p>

    <table v-else border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Folio</th>
          <th>Tipo</th>
          <th>Solicitante</th>
          <th>Asunto</th>
          <th>Estado</th>
          <th>Fecha Creación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in solicitudes" :key="s.id_solicitud">
          <td><strong>{{ s.folio }}</strong></td>
          <td>{{ s.tipo?.nombre }}</td>
          <td>{{ s.solicitante?.nombre }}</td>
          <td>{{ s.asunto }}</td>
          <td>{{ s.estado.toUpperCase() }}</td>
          <td>{{ s.fecha_creacion }}</td>
          <td>
            <button type="button" @click="verDetalle(s.id_solicitud)">Ver / Atender</button>
          </td>
        </tr>
        <tr v-if="solicitudes.length === 0">
          <td colspan="7">No hay solicitudes registradas.</td>
        </tr>
      </tbody>
    </table>

    <br />

    <!-- Detalle y Resolución de Solicitud -->
    <fieldset v-if="solicitudSeleccionada">
      <legend>Detalle de Solicitud: {{ solicitudSeleccionada.folio }}</legend>

      <p><strong>Solicitante:</strong> {{ solicitudSeleccionada.solicitante?.nombre }} ({{ solicitudSeleccionada.solicitante?.correo }})</p>
      <p><strong>Tipo de Solicitud:</strong> {{ solicitudSeleccionada.tipo?.nombre }}</p>
      <p><strong>Asunto:</strong> {{ solicitudSeleccionada.asunto }}</p>
      <p><strong>Descripción:</strong> {{ solicitudSeleccionada.descripcion || 'Sin descripción' }}</p>
      <p><strong>Estado Actual:</strong> {{ solicitudSeleccionada.estado.toUpperCase() }}</p>
      <p><strong>Respuesta Oficial:</strong> {{ solicitudSeleccionada.respuesta || 'Sin respuesta aún' }}</p>

      <h4>Historial de Estados y Seguimiento</h4>
      <ul>
        <li v-for="h in solicitudSeleccionada.historial" :key="h.id_historial">
          [{{ h.fecha_cambio }}] - <strong>{{ h.estado_nuevo }}</strong>: {{ h.comentario }} (por {{ h.usuario?.nombre || 'Sistema' }})
        </li>
      </ul>

      <hr />

      <h4>Atender Solicitud</h4>
      <form @submit.prevent="atenderSolicitud">
        <div>
          <label for="sol_nuevo_estado">Cambiar Estado a:</label><br />
          <select id="sol_nuevo_estado" v-model="respuestaForm.estado">
            <option value="pendiente">Pendiente</option>
            <option value="en_revision">En Revisión</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="completado">Completado</option>
          </select>
        </div>

        <br />

        <div>
          <label for="sol_resp">Respuesta Oficial para el Alumno:</label><br />
          <textarea
            id="sol_resp"
            v-model="respuestaForm.respuesta"
            rows="2"
            placeholder="Respuesta o instrucciones"
          ></textarea>
        </div>

        <br />

        <div>
          <label for="sol_coment">Comentario Interno para el Historial:</label><br />
          <input
            id="sol_coment"
            v-model="respuestaForm.comentario"
            type="text"
            placeholder="Motivo del cambio de estado"
          />
        </div>

        <br />

        <button type="submit">Actualizar y Notificar</button>
        <button type="button" @click="solicitudSeleccionada = null">Cerrar Detalle</button>
      </form>
    </fieldset>
  </section>
</template>
