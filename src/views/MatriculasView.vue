<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const matriculas = ref([])
const estudiantes = ref([])
const grupos = ref([])
const cargando = ref(true)
const mensaje = ref('')
const error = ref('')

const formulario = ref({
  id_estudiante: '',
  id_grupo: '',
})

async function cargarDatos() {
  cargando.value = true
  try {
    const [resMatriculas, resEstudiantes, resGrupos] = await Promise.all([
      api.matriculas.listar(),
      api.estudiantes.listar(),
      api.grupos.listar(),
    ])

    matriculas.value = resMatriculas.matriculas || []
    estudiantes.value = resEstudiantes.estudiantes || []
    grupos.value = resGrupos.grupos || []

    if (estudiantes.value.length > 0 && !formulario.value.id_estudiante) {
      formulario.value.id_estudiante = estudiantes.value[0].id_estudiante
    }
    if (grupos.value.length > 0 && !formulario.value.id_grupo) {
      formulario.value.id_grupo = grupos.value[0].id_grupo
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar datos'
  } finally {
    cargando.value = false
  }
}

async function inscribirEstudiante() {
  mensaje.value = ''
  error.value = ''

  try {
    await api.matriculas.inscribir(
      Number(formulario.value.id_estudiante),
      Number(formulario.value.id_grupo)
    )
    mensaje.value = 'Estudiante matriculado exitosamente en el grupo.'
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'Error al inscribir estudiante'
  }
}

async function cambiarEstado(id, nuevoEstado) {
  mensaje.value = ''
  error.value = ''

  try {
    await api.matriculas.cambiarEstado(id, nuevoEstado)
    mensaje.value = 'Estado de la matrícula actualizado a: ' + nuevoEstado
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'Error al cambiar estado'
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <section>
    <h2>Módulo de Matrículas e Inscripciones</h2>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>

    <!-- Formulario de Inscripción -->
    <form @submit.prevent="inscribirEstudiante">
      <fieldset>
        <legend>Inscribir Alumno a un Grupo</legend>

        <div>
          <label for="mat_estudiante">Seleccionar Estudiante:</label><br />
          <select id="mat_estudiante" v-model="formulario.id_estudiante" required>
            <option
              v-for="est in estudiantes"
              :key="est.id_estudiante"
              :value="est.id_estudiante"
            >
              {{ est.codigo_institucional }} - {{ est.usuario?.nombre }} ({{ est.carrera }})
            </option>
          </select>
        </div>

        <br />

        <div>
          <label for="mat_grupo">Seleccionar Grupo:</label><br />
          <select id="mat_grupo" v-model="formulario.id_grupo" required>
            <option
              v-for="g in grupos"
              :key="g.id_grupo"
              :value="g.id_grupo"
              :disabled="g.lugares_disponibles <= 0"
            >
              {{ g.clave }} - {{ g.curso?.nombre }} | Cupo: {{ g.inscritos }}/{{ g.cupo_max }}
              ({{ g.lugares_disponibles }} lugares) {{ g.lugares_disponibles <= 0 ? '[LLENO]' : '' }}
            </option>
          </select>
        </div>

        <br />

        <button type="submit">Inscribir al Grupo</button>
      </fieldset>
    </form>

    <hr />

    <!-- Tabla de Matrículas -->
    <h3>Historial de Matrículas</h3>
    <p v-if="cargando">Cargando matrículas...</p>

    <table v-else border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Código Estudiante</th>
          <th>Nombre Estudiante</th>
          <th>Grupo</th>
          <th>Curso</th>
          <th>Periodo</th>
          <th>Fecha Matrícula</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in matriculas" :key="m.id_matricula">
          <td>{{ m.id_matricula }}</td>
          <td>{{ m.estudiante?.codigo_institucional }}</td>
          <td>{{ m.estudiante?.usuario?.nombre }}</td>
          <td>{{ m.grupo?.clave }}</td>
          <td>{{ m.grupo?.curso?.nombre }}</td>
          <td>{{ m.grupo?.periodo?.nombre }}</td>
          <td>{{ m.fecha_matricula }}</td>
          <td>
            <strong>{{ m.estado.toUpperCase() }}</strong>
          </td>
          <td>
            <select
              :value="m.estado"
              @change="cambiarEstado(m.id_matricula, $event.target.value)"
            >
              <option value="activa">Activa</option>
              <option value="baja">Baja</option>
              <option value="aprobada">Aprobada</option>
              <option value="reprobada">Reprobada</option>
            </select>
          </td>
        </tr>
        <tr v-if="matriculas.length === 0">
          <td colspan="9">No hay matrículas registradas.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
