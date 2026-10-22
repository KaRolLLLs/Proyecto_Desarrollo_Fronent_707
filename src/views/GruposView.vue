<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const grupos = ref([])
const cursos = ref([])
const periodos = ref([])
const docentes = ref([])
const cargando = ref(true)
const mensaje = ref('')
const error = ref('')

const formulario = ref({
  id_grupo: null,
  clave: '',
  id_curso: '',
  id_periodo: '',
  id_docente: '',
  aula: '',
  cupo_max: 30,
  estado: 'abierto',
  horarios: [
    { dia_semana: 1, hora_inicio: '08:00', hora_fin: '09:00' },
  ],
})

async function cargarDatos() {
  cargando.value = true
  try {
    const [resGrupos, resCursos, resPeriodos, resDocentes] = await Promise.all([
      api.grupos.listar(),
      api.cursos.listar(),
      api.periodos.listar(),
      api.docentes.listar(),
    ])

    grupos.value = resGrupos.grupos || []
    cursos.value = resCursos.cursos || []
    periodos.value = resPeriodos.periodos || []
    docentes.value = resDocentes.docentes || []

    if (periodos.value.length > 0 && !formulario.value.id_periodo) {
      const activo = periodos.value.find((p) => p.activo)
      formulario.value.id_periodo = activo ? activo.id_periodo : periodos.value[0].id_periodo
    }
    if (cursos.value.length > 0 && !formulario.value.id_curso) {
      formulario.value.id_curso = cursos.value[0].id_curso
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar datos'
  } finally {
    cargando.value = false
  }
}

function agregarHorario() {
  formulario.value.horarios.push({
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fin: '09:00',
  })
}

function eliminarHorario(index) {
  formulario.value.horarios.splice(index, 1)
}

function limpiarFormulario() {
  formulario.value = {
    id_grupo: null,
    clave: '',
    id_curso: cursos.value[0]?.id_curso || '',
    id_periodo: periodos.value.find((p) => p.activo)?.id_periodo || '',
    id_docente: '',
    aula: '',
    cupo_max: 30,
    estado: 'abierto',
    horarios: [{ dia_semana: 1, hora_inicio: '08:00', hora_fin: '09:00' }],
  }
}

function seleccionarParaEditar(grupo) {
  formulario.value = {
    id_grupo: grupo.id_grupo,
    clave: grupo.clave,
    id_curso: grupo.id_curso,
    id_periodo: grupo.id_periodo,
    id_docente: grupo.id_docente || '',
    aula: grupo.aula || '',
    cupo_max: grupo.cupo_max,
    estado: grupo.estado,
    horarios: (grupo.horarios || []).map((h) => ({
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio ? h.hora_inicio.substring(0, 5) : '08:00',
      hora_fin: h.hora_fin ? h.hora_fin.substring(0, 5) : '09:00',
    })),
  }
}

async function guardarGrupo() {
  mensaje.value = ''
  error.value = ''

  try {
    const payload = {
      ...formulario.value,
      id_docente: formulario.value.id_docente ? Number(formulario.value.id_docente) : null,
    }

    if (formulario.value.id_grupo) {
      await api.grupos.actualizar(formulario.value.id_grupo, payload)
      mensaje.value = 'Grupo actualizado con éxito.'
    } else {
      await api.grupos.crear(payload)
      mensaje.value = 'Grupo creado exitosamente.'
    }
    limpiarFormulario()
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'Error al guardar grupo'
  }
}

function nombreDia(dia) {
  const dias = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
  }
  return dias[dia] || dia
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <section>
    <h2>Módulo de Grupos y Horarios</h2>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>

    <!-- Formulario de Grupo -->
    <form @submit.prevent="guardarGrupo">
      <fieldset>
        <legend>
          {{ formulario.id_grupo ? 'Editar Grupo' : 'Registrar Nuevo Grupo' }}
        </legend>

        <div>
          <label for="clave_grupo">Clave del Grupo:</label><br />
          <input
            id="clave_grupo"
            v-model="formulario.clave"
            type="text"
            required
            placeholder="Ej. B1-A-2026"
          />
        </div>

        <br />

        <div>
          <label for="grupo_curso">Curso:</label><br />
          <select id="grupo_curso" v-model="formulario.id_curso" required>
            <option v-for="c in cursos" :key="c.id_curso" :value="c.id_curso">
              {{ c.nombre }} ({{ c.nivel_mcer }})
            </option>
          </select>
        </div>

        <br />

        <div>
          <label for="grupo_periodo">Periodo Escolar:</label><br />
          <select id="grupo_periodo" v-model="formulario.id_periodo" required>
            <option v-for="p in periodos" :key="p.id_periodo" :value="p.id_periodo">
              {{ p.nombre }} {{ p.activo ? '(Vigente)' : '' }}
            </option>
          </select>
        </div>

        <br />

        <div>
          <label for="grupo_docente">Docente Asignado:</label><br />
          <select id="grupo_docente" v-model="formulario.id_docente">
            <option value="">-- Sin docente asignado --</option>
            <option v-for="d in docentes" :key="d.id_docente" :value="d.id_docente">
              {{ d.usuario?.nombre }}
            </option>
          </select>
        </div>

        <br />

        <div>
          <label for="grupo_aula">Aula:</label><br />
          <input
            id="grupo_aula"
            v-model="formulario.aula"
            type="text"
            placeholder="Ej. Aula 12 / Laboratorio"
          />
        </div>

        <br />

        <div>
          <label for="cupo_max">Cupo Máximo:</label><br />
          <input
            id="cupo_max"
            v-model="formulario.cupo_max"
            type="number"
            min="1"
            required
          />
        </div>

        <br />

        <div>
          <label for="estado_grupo">Estado:</label><br />
          <select id="estado_grupo" v-model="formulario.estado" required>
            <option value="abierto">Abierto</option>
            <option value="cerrado">Cerrado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <br />

        <fieldset>
          <legend>Horarios de Clase</legend>
          <div v-for="(h, idx) in formulario.horarios" :key="idx">
            <label>Día:</label>
            <select v-model="h.dia_semana">
              <option :value="1">Lunes</option>
              <option :value="2">Martes</option>
              <option :value="3">Miércoles</option>
              <option :value="4">Jueves</option>
              <option :value="5">Viernes</option>
              <option :value="6">Sábado</option>
            </select>

            <label> De: </label>
            <input v-model="h.hora_inicio" type="time" required />

            <label> A: </label>
            <input v-model="h.hora_fin" type="time" required />

            <button type="button" @click="eliminarHorario(idx)">Quitar</button>
            <br /><br />
          </div>

          <button type="button" @click="agregarHorario">+ Añadir Otro Horario</button>
        </fieldset>

        <br />

        <button type="submit">
          {{ formulario.id_grupo ? 'Guardar Cambios' : 'Registrar Grupo' }}
        </button>
        <button v-if="formulario.id_grupo" type="button" @click="limpiarFormulario">
          Cancelar Edición
        </button>
      </fieldset>
    </form>

    <hr />

    <!-- Listado de Grupos -->
    <h3>Grupos Registrados</h3>
    <p v-if="cargando">Cargando grupos...</p>

    <table v-else border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Clave</th>
          <th>Curso</th>
          <th>Periodo</th>
          <th>Docente</th>
          <th>Aula</th>
          <th>Cupo Máx</th>
          <th>Inscritos</th>
          <th>Disponibles</th>
          <th>Horarios</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="g in grupos" :key="g.id_grupo">
          <td>{{ g.clave }}</td>
          <td>{{ g.curso?.nombre }} ({{ g.curso?.nivel_mcer }})</td>
          <td>{{ g.periodo?.nombre }}</td>
          <td>{{ g.docente?.usuario?.nombre || 'Sin asignar' }}</td>
          <td>{{ g.aula || 'Por definir' }}</td>
          <td>{{ g.cupo_max }}</td>
          <td>{{ g.inscritos }}</td>
          <td>{{ g.lugares_disponibles }}</td>
          <td>
            <ul v-if="g.horarios && g.horarios.length > 0">
              <li v-for="h in g.horarios" :key="h.id_horario">
                {{ nombreDia(h.dia_semana) }}: {{ h.hora_inicio }} - {{ h.hora_fin }}
              </li>
            </ul>
            <span v-else>Sin horario</span>
          </td>
          <td>{{ g.estado }}</td>
          <td>
            <button type="button" @click="seleccionarParaEditar(g)">Editar</button>
          </td>
        </tr>
        <tr v-if="grupos.length === 0">
          <td colspan="11">No hay grupos registrados.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
