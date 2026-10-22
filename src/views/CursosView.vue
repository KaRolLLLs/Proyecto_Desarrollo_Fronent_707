<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const cursos = ref([])
const cargando = ref(true)
const mensaje = ref('')
const error = ref('')

const formulario = ref({
  id_curso: null,
  nombre: '',
  nivel_mcer: 'A1',
  descripcion: '',
  id_curso_prerrequisito: null,
  activo: true,
})

async function cargarCursos() {
  cargando.value = true
  try {
    const res = await api.cursos.listar()
    cursos.value = res.cursos || []
  } catch (err) {
    error.value = err.message || 'Error al cargar cursos'
  } finally {
    cargando.value = false
  }
}

function limpiarFormulario() {
  formulario.value = {
    id_curso: null,
    nombre: '',
    nivel_mcer: 'A1',
    descripcion: '',
    id_curso_prerrequisito: null,
    activo: true,
  }
}

function seleccionarParaEditar(curso) {
  formulario.value = {
    id_curso: curso.id_curso,
    nombre: curso.nombre,
    nivel_mcer: curso.nivel_mcer,
    descripcion: curso.descripcion || '',
    id_curso_prerrequisito: curso.id_curso_prerrequisito || null,
    activo: Boolean(curso.activo),
  }
}

async function guardarCurso() {
  mensaje.value = ''
  error.value = ''

  try {
    if (formulario.value.id_curso) {
      await api.cursos.actualizar(formulario.value.id_curso, formulario.value)
      mensaje.value = 'Curso actualizado exitosamente.'
    } else {
      await api.cursos.crear(formulario.value)
      mensaje.value = 'Curso registrado exitosamente.'
    }
    limpiarFormulario()
    await cargarCursos()
  } catch (err) {
    error.value = err.message || 'Error al guardar curso'
  }
}

async function desactivarCurso(id) {
  if (!confirm('¿Desea desactivar este curso?')) return
  try {
    await api.cursos.desactivar(id)
    mensaje.value = 'Curso desactivado correctamente.'
    await cargarCursos()
  } catch (err) {
    error.value = err.message || 'Error al desactivar curso'
  }
}

onMounted(() => {
  cargarCursos()
})
</script>

<template>
  <section>
    <h2>Módulo de Cursos</h2>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>

    <!-- Formulario básico -->
    <form @submit.prevent="guardarCurso">
      <fieldset>
        <legend>
          {{ formulario.id_curso ? 'Editar Curso' : 'Registrar Nuevo Curso' }}
        </legend>

        <div>
          <label for="nombre_curso">Nombre del Curso:</label><br />
          <input
            id="nombre_curso"
            v-model="formulario.nombre"
            type="text"
            required
            placeholder="Ej. Inglés B1"
          />
        </div>

        <br />

        <div>
          <label for="nivel_mcer">Nivel MCER:</label><br />
          <select id="nivel_mcer" v-model="formulario.nivel_mcer" required>
            <option value="A1">A1 - Principiante</option>
            <option value="A2">A2 - Básico</option>
            <option value="B1">B1 - Intermedio</option>
            <option value="B2">B2 - Intermedio Alto</option>
            <option value="C1">C1 - Avanzado</option>
            <option value="C2">C2 - Maestría</option>
          </select>
        </div>

        <br />

        <div>
          <label for="descripcion_curso">Descripción:</label><br />
          <textarea
            id="descripcion_curso"
            v-model="formulario.descripcion"
            rows="3"
            placeholder="Descripción del nivel"
          ></textarea>
        </div>

        <br />

        <div>
          <label for="prerrequisito">Curso Prerrequisito:</label><br />
          <select id="prerrequisito" v-model="formulario.id_curso_prerrequisito">
            <option :value="null">-- Ninguno (Nivel inicial) --</option>
            <option
              v-for="c in cursos.filter((x) => x.id_curso !== formulario.id_curso)"
              :key="c.id_curso"
              :value="c.id_curso"
            >
              {{ c.nombre }} ({{ c.nivel_mcer }})
            </option>
          </select>
        </div>

        <br />

        <div>
          <label>
            <input v-model="formulario.activo" type="checkbox" />
            Curso Activo
          </label>
        </div>

        <br />

        <button type="submit">
          {{ formulario.id_curso ? 'Guardar Cambios' : 'Registrar Curso' }}
        </button>
        <button v-if="formulario.id_curso" type="button" @click="limpiarFormulario">
          Cancelar Edición
        </button>
      </fieldset>
    </form>

    <hr />

    <!-- Tabla de Cursos -->
    <h3>Catálogo de Cursos</h3>
    <p v-if="cargando">Cargando cursos...</p>

    <table v-else border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Nivel MCER</th>
          <th>Descripción</th>
          <th>Prerrequisito</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="curso in cursos" :key="curso.id_curso">
          <td>{{ curso.id_curso }}</td>
          <td>{{ curso.nombre }}</td>
          <td>{{ curso.nivel_mcer }}</td>
          <td>{{ curso.descripcion || 'Sin descripción' }}</td>
          <td>{{ curso.prerrequisito ? curso.prerrequisito.nombre : 'Ninguno' }}</td>
          <td>{{ curso.activo ? 'Activo' : 'Inactivo' }}</td>
          <td>
            <button type="button" @click="seleccionarParaEditar(curso)">Editar</button>
            <button
              v-if="curso.activo"
              type="button"
              @click="desactivarCurso(curso.id_curso)"
            >
              Desactivar
            </button>
          </td>
        </tr>
        <tr v-if="cursos.length === 0">
          <td colspan="7">No hay cursos registrados.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
