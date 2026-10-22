<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const grupos = ref([])
const idGrupoSeleccionado = ref('')
const fechaAsistencia = ref(new Date().toISOString().substring(0, 10))

// Asistencias
const listaAsistencias = ref([])
const cargandoAsistencias = ref(false)

// Calificaciones
const calificacionesGrupo = ref([])
const cargandoCalificaciones = ref(false)
const formularioCalificacion = ref({
  id_matricula: '',
  nombre: 'Parcial 1',
  tipo: 'parcial',
  ponderacion: 30,
  fecha: new Date().toISOString().substring(0, 10),
  nota: 85,
  publicada: true,
})

// Vista Estudiante
const misCalificaciones = ref([])
const misAsistencias = ref([])
const esEstudiante = ref(false)

const mensaje = ref('')
const error = ref('')

async function inicializar() {
  try {
    const resGrupos = await api.grupos.listar()
    grupos.value = resGrupos.grupos || []
    if (grupos.value.length > 0) {
      idGrupoSeleccionado.value = grupos.value[0].id_grupo
      await consultarAsistencias()
      await consultarCalificaciones()
    }

    // Verificar si el usuario autenticado es estudiante
    const usuarioStr = localStorage.getItem('usuario')
    if (usuarioStr) {
      const u = JSON.parse(usuarioStr)
      if (u.rol === 'estudiante') {
        esEstudiante.value = true
        await cargarExpedienteEstudiante()
      }
    }
  } catch (err) {
    error.value = err.message || 'Error al inicializar módulo académico'
  }
}

async function consultarAsistencias() {
  if (!idGrupoSeleccionado.value) return
  cargandoAsistencias.value = true
  mensaje.value = ''
  error.value = ''

  try {
    const res = await api.academico.getAsistenciasGrupo(
      idGrupoSeleccionado.value,
      fechaAsistencia.value
    )
    listaAsistencias.value = res.asistencias || []
  } catch (err) {
    error.value = err.message || 'Error al consultar asistencias'
  } finally {
    cargandoAsistencias.value = false
  }
}

async function guardarPaseLista() {
  mensaje.value = ''
  error.value = ''

  try {
    const payload = listaAsistencias.value.map((a) => ({
      id_matricula: a.id_matricula,
      estado: a.estado_asistencia,
    }))

    await api.academico.guardarAsistencias(fechaAsistencia.value, payload)
    mensaje.value = 'Asistencias guardadas exitosamente para el ' + fechaAsistencia.value
  } catch (err) {
    error.value = err.message || 'Error al guardar asistencias'
  }
}

async function consultarCalificaciones() {
  if (!idGrupoSeleccionado.value) return
  cargandoCalificaciones.value = true
  try {
    const res = await api.academico.getCalificacionesGrupo(idGrupoSeleccionado.value)
    calificacionesGrupo.value = res.matriculas || []
    if (calificacionesGrupo.value.length > 0 && !formularioCalificacion.value.id_matricula) {
      formularioCalificacion.value.id_matricula = calificacionesGrupo.value[0].id_matricula
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar calificaciones del grupo'
  } finally {
    cargandoCalificaciones.value = false
  }
}

async function registrarCalificacion() {
  mensaje.value = ''
  error.value = ''

  try {
    await api.academico.registrarCalificacion(formularioCalificacion.value)
    mensaje.value = 'Calificación registrada con éxito.'
    await consultarCalificaciones()
  } catch (err) {
    error.value = err.message || 'Error al registrar calificación'
  }
}

async function publicarNota(idCalificacion) {
  try {
    await api.academico.publicarCalificacion(idCalificacion)
    mensaje.value = 'Calificación publicada para el estudiante.'
    await consultarCalificaciones()
  } catch (err) {
    error.value = err.message || 'Error al publicar calificación'
  }
}

async function cargarExpedienteEstudiante() {
  try {
    const [resNotas, resAsist] = await Promise.all([
      api.academico.misCalificaciones(),
      api.academico.misAsistencias(),
    ])
    misCalificaciones.value = resNotas.calificaciones || []
    misAsistencias.value = resAsist.matriculas || []
  } catch (err) {
    console.warn('No se pudo cargar expediente de alumno:', err)
  }
}

onMounted(() => {
  inicializar()
})
</script>

<template>
  <section>
    <h2>Módulo Académico: Asistencias y Calificaciones</h2>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>

    <!-- Selector de Grupo Global para Gestión Docente -->
    <fieldset>
      <legend>Selección de Grupo para Control Académico</legend>
      <label for="sel_grupo">Grupo:</label>
      <select
        id="sel_grupo"
        v-model="idGrupoSeleccionado"
        @change="
          consultarAsistencias();
          consultarCalificaciones();
        "
      >
        <option v-for="g in grupos" :key="g.id_grupo" :value="g.id_grupo">
          {{ g.clave }} - {{ g.curso?.nombre }} (Docente: {{ g.docente?.usuario?.nombre || 'N/A' }})
        </option>
      </select>
    </fieldset>

    <br />

    <!-- SECCIÓN 1: ASISTENCIAS -->
    <fieldset>
      <legend>1. Control de Asistencias (Pase de Lista)</legend>

      <div>
        <label for="fecha_asist">Fecha de Clase:</label>
        <input
          id="fecha_asist"
          v-model="fechaAsistencia"
          type="date"
          @change="consultarAsistencias"
        />
        <button type="button" @click="consultarAsistencias">Consultar Fecha</button>
      </div>

      <br />

      <p v-if="cargandoAsistencias">Cargando lista de asistencia...</p>

      <table v-else border="1" cellpadding="6" cellspacing="0">
        <thead>
          <tr>
            <th>Matrícula / Código</th>
            <th>Estudiante</th>
            <th>Estado de Asistencia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in listaAsistencias" :key="item.id_matricula">
            <td>{{ item.codigo_institucional }}</td>
            <td>{{ item.nombre }}</td>
            <td>
              <select v-model="item.estado_asistencia">
                <option value="presente">Presente</option>
                <option value="retardo">Retardo</option>
                <option value="falta">Falta</option>
                <option value="justificada">Justificada</option>
              </select>
            </td>
          </tr>
          <tr v-if="listaAsistencias.length === 0">
            <td colspan="3">No hay alumnos inscritos en este grupo.</td>
          </tr>
        </tbody>
      </table>

      <br />

      <button
        v-if="listaAsistencias.length > 0"
        type="button"
        @click="guardarPaseLista"
      >
        Guardar Pase de Lista del Día
      </button>
    </fieldset>

    <br />

    <!-- SECCIÓN 2: CALIFICACIONES DEL GRUPO -->
    <fieldset>
      <legend>2. Registro y Publicación de Calificaciones</legend>

      <!-- Formulario para agregar calificación -->
      <form @submit.prevent="registrarCalificacion">
        <h4>Registrar Nota a Estudiante</h4>

        <div>
          <label for="calif_estudiante">Estudiante:</label><br />
          <select id="calif_estudiante" v-model="formularioCalificacion.id_matricula" required>
            <option
              v-for="m in calificacionesGrupo"
              :key="m.id_matricula"
              :value="m.id_matricula"
            >
              {{ m.estudiante?.codigo_institucional }} - {{ m.estudiante?.usuario?.nombre }}
            </option>
          </select>
        </div>

        <br />

        <div>
          <label for="nombre_eval">Nombre de la Evaluación:</label><br />
          <input
            id="nombre_eval"
            v-model="formularioCalificacion.nombre"
            type="text"
            required
            placeholder="Ej. Parcial 1 / Speaking Test"
          />
        </div>

        <br />

        <div>
          <label for="tipo_eval">Tipo:</label><br />
          <select id="tipo_eval" v-model="formularioCalificacion.tipo">
            <option value="parcial">Parcial</option>
            <option value="final">Final</option>
            <option value="actividad">Actividad</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <br />

        <div>
          <label for="ponderacion_eval">Ponderación (%):</label><br />
          <input
            id="ponderacion_eval"
            v-model="formularioCalificacion.ponderacion"
            type="number"
            min="0"
            max="100"
            step="0.01"
            required
          />
        </div>

        <br />

        <div>
          <label for="nota_eval">Calificación (Nota):</label><br />
          <input
            id="nota_eval"
            v-model="formularioCalificacion.nota"
            type="number"
            min="0"
            max="100"
            step="0.01"
            required
          />
        </div>

        <br />

        <div>
          <label>
            <input v-model="formularioCalificacion.publicada" type="checkbox" />
            Publicar inmediatamente para el alumno
          </label>
        </div>

        <br />

        <button type="submit">Guardar Calificación</button>
      </form>

      <hr />

      <h4>Historial de Evaluaciones y Calificaciones del Grupo</h4>
      <p v-if="cargandoCalificaciones">Cargando evaluaciones...</p>

      <table v-else border="1" cellpadding="6" cellspacing="0">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Evaluación</th>
            <th>Tipo</th>
            <th>Ponderación</th>
            <th>Nota</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="m in calificacionesGrupo" :key="m.id_matricula">
            <tr v-for="ev in m.evaluaciones" :key="ev.id_evaluacion">
              <td>{{ m.estudiante?.usuario?.nombre }}</td>
              <td>{{ ev.nombre }}</td>
              <td>{{ ev.tipo }}</td>
              <td>{{ ev.ponderacion }}%</td>
              <td>
                <strong>{{ ev.calificacion ? ev.calificacion.nota : 'Sin calificar' }}</strong>
              </td>
              <td>
                {{
                  ev.calificacion && ev.calificacion.publicada ? 'PUBLICADA' : 'BORRADOR / PENDIENTE'
                }}
              </td>
              <td>
                <button
                  v-if="ev.calificacion && !ev.calificacion.publicada"
                  type="button"
                  @click="publicarNota(ev.calificacion.id_calificacion)"
                >
                  Publicar Nota
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </fieldset>

    <br />

    <!-- SECCIÓN 3: EXPEDIENTE ALUMNO (SI ESTÁ EN SESIÓN UN ALUMNO) -->
    <fieldset v-if="esEstudiante">
      <legend>3. Mi Expediente (Vista de Alumno Autenticado)</legend>

      <h4>Mis Calificaciones Publicadas (Vista SQL: v_calificaciones_publicadas)</h4>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Grupo</th>
            <th>Evaluación</th>
            <th>Ponderación</th>
            <th>Calificación</th>
            <th>Fecha Publicación</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, idx) in misCalificaciones" :key="idx">
            <td>{{ c.curso }}</td>
            <td>{{ c.grupo }}</td>
            <td>{{ c.evaluacion }}</td>
            <td>{{ c.ponderacion }}%</td>
            <td><strong>{{ c.nota }}</strong></td>
            <td>{{ c.fecha_publicacion }}</td>
          </tr>
          <tr v-if="misCalificaciones.length === 0">
            <td colspan="6">No tienes calificaciones publicadas todavía.</td>
          </tr>
        </tbody>
      </table>
    </fieldset>
  </section>
</template>
