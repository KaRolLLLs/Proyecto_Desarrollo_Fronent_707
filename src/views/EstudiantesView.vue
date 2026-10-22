<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const estudiantes = ref([])
const cargando = ref(true)
const mensaje = ref('')
const error = ref('')

const formulario = ref({
  id_estudiante: null,
  nombre: '',
  correo: '',
  contrasena: 'password123',
  codigo_institucional: '',
  carrera: 'Ingeniería en Sistemas Computacionales',
  nivel_actual: 'A1',
  estado: true,
})

async function cargarEstudiantes() {
  cargando.value = true
  try {
    const res = await api.estudiantes.listar()
    estudiantes.value = res.estudiantes || []
  } catch (err) {
    error.value = err.message || 'Error al cargar estudiantes'
  } finally {
    cargando.value = false
  }
}

function limpiarFormulario() {
  formulario.value = {
    id_estudiante: null,
    nombre: '',
    correo: '',
    contrasena: 'password123',
    codigo_institucional: '',
    carrera: 'Ingeniería en Sistemas Computacionales',
    nivel_actual: 'A1',
    estado: true,
  }
}

function seleccionarParaEditar(est) {
  formulario.value = {
    id_estudiante: est.id_estudiante,
    nombre: est.usuario?.nombre || '',
    correo: est.usuario?.correo || '',
    contrasena: '',
    codigo_institucional: est.codigo_institucional,
    carrera: est.carrera,
    nivel_actual: est.nivel_actual || 'A1',
    estado: Boolean(est.usuario?.estado),
  }
}

async function guardarEstudiante() {
  mensaje.value = ''
  error.value = ''

  try {
    if (formulario.value.id_estudiante) {
      await api.estudiantes.actualizar(formulario.value.id_estudiante, formulario.value)
      mensaje.value = 'Estudiante actualizado con éxito.'
    } else {
      await api.estudiantes.crear(formulario.value)
      mensaje.value = 'Estudiante registrado con éxito.'
    }
    limpiarFormulario()
    await cargarEstudiantes()
  } catch (err) {
    error.value = err.message || 'Error al guardar estudiante'
  }
}

onMounted(() => {
  cargarEstudiantes()
})
</script>

<template>
  <section>
    <h2>Módulo de Estudiantes</h2>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>

    <!-- Formulario de Estudiante -->
    <form @submit.prevent="guardarEstudiante">
      <fieldset>
        <legend>
          {{ formulario.id_estudiante ? 'Editar Estudiante' : 'Registrar Nuevo Estudiante' }}
        </legend>

        <div>
          <label for="est_codigo">Código Institucional / Matrícula:</label><br />
          <input
            id="est_codigo"
            v-model="formulario.codigo_institucional"
            type="text"
            required
            placeholder="Ej. 22MS0001"
          />
        </div>

        <br />

        <div>
          <label for="est_nombre">Nombre Completo:</label><br />
          <input
            id="est_nombre"
            v-model="formulario.nombre"
            type="text"
            required
            placeholder="Nombre y Apellidos"
          />
        </div>

        <br />

        <div>
          <label for="est_correo">Correo Institucional:</label><br />
          <input
            id="est_correo"
            v-model="formulario.correo"
            type="email"
            required
            placeholder="alumno@itsm.edu.mx"
          />
        </div>

        <br />

        <div>
          <label for="est_pass">
            Contraseña
            {{ formulario.id_estudiante ? '(Opcional, dejar vacío para no cambiarla)' : '' }}:
          </label><br />
          <input
            id="est_pass"
            v-model="formulario.contrasena"
            type="password"
            :required="!formulario.id_estudiante"
          />
        </div>

        <br />

        <div>
          <label for="est_carrera">Carrera:</label><br />
          <input
            id="est_carrera"
            v-model="formulario.carrera"
            type="text"
            required
            placeholder="Ej. Ingeniería en Sistemas Computacionales"
          />
        </div>

        <br />

        <div>
          <label for="est_nivel">Nivel Actual:</label><br />
          <select id="est_nivel" v-model="formulario.nivel_actual">
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>

        <br />

        <div v-if="formulario.id_estudiante">
          <label>
            <input v-model="formulario.estado" type="checkbox" />
            Cuenta Activa
          </label>
          <br /><br />
        </div>

        <button type="submit">
          {{ formulario.id_estudiante ? 'Guardar Cambios' : 'Registrar Estudiante' }}
        </button>
        <button v-if="formulario.id_estudiante" type="button" @click="limpiarFormulario">
          Cancelar Edición
        </button>
      </fieldset>
    </form>

    <hr />

    <!-- Tabla de Estudiantes -->
    <h3>Estudiantes Registrados</h3>
    <p v-if="cargando">Cargando listado de estudiantes...</p>

    <table v-else border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Código</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Carrera</th>
          <th>Nivel Actual</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="est in estudiantes" :key="est.id_estudiante">
          <td>{{ est.codigo_institucional }}</td>
          <td>{{ est.usuario?.nombre }}</td>
          <td>{{ est.usuario?.correo }}</td>
          <td>{{ est.carrera }}</td>
          <td>{{ est.nivel_actual }}</td>
          <td>{{ est.usuario?.estado ? 'Activo' : 'Inactivo' }}</td>
          <td>
            <button type="button" @click="seleccionarParaEditar(est)">Editar</button>
          </td>
        </tr>
        <tr v-if="estudiantes.length === 0">
          <td colspan="7">No hay estudiantes registrados.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
