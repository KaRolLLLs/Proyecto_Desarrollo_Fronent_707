<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const periodos = ref([])
const cargando = ref(true)
const mensaje = ref('')
const error = ref('')

const formulario = ref({
  id_periodo: null,
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  activo: false,
})

async function cargarPeriodos() {
  cargando.value = true
  try {
    const res = await api.periodos.listar()
    periodos.value = res.periodos || []
  } catch (err) {
    error.value = err.message || 'Error al cargar periodos'
  } finally {
    cargando.value = false
  }
}

function limpiarFormulario() {
  formulario.value = {
    id_periodo: null,
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: false,
  }
}

function seleccionarParaEditar(periodo) {
  formulario.value = {
    id_periodo: periodo.id_periodo,
    nombre: periodo.nombre,
    fecha_inicio: periodo.fecha_inicio ? periodo.fecha_inicio.substring(0, 10) : '',
    fecha_fin: periodo.fecha_fin ? periodo.fecha_fin.substring(0, 10) : '',
    activo: Boolean(periodo.activo),
  }
}

async function guardarPeriodo() {
  mensaje.value = ''
  error.value = ''

  try {
    if (formulario.value.id_periodo) {
      await api.periodos.actualizar(formulario.value.id_periodo, formulario.value)
      mensaje.value = 'Periodo actualizado con éxito.'
    } else {
      await api.periodos.crear(formulario.value)
      mensaje.value = 'Periodo registrado con éxito.'
    }
    limpiarFormulario()
    await cargarPeriodos()
  } catch (err) {
    error.value = err.message || 'Error al guardar periodo'
  }
}

async function activarPeriodo(id) {
  try {
    await api.periodos.activar(id)
    mensaje.value = 'Periodo establecido como periodo activo actual.'
    await cargarPeriodos()
  } catch (err) {
    error.value = err.message || 'Error al activar periodo'
  }
}

onMounted(() => {
  cargarPeriodos()
})
</script>

<template>
  <section>
    <h2>Módulo de Periodos Escolares</h2>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>

    <!-- Formulario -->
    <form @submit.prevent="guardarPeriodo">
      <fieldset>
        <legend>
          {{ formulario.id_periodo ? 'Editar Periodo' : 'Registrar Nuevo Periodo' }}
        </legend>

        <div>
          <label for="nombre_periodo">Nombre del Periodo:</label><br />
          <input
            id="nombre_periodo"
            v-model="formulario.nombre"
            type="text"
            required
            placeholder="Ej. Ago-Dic 2026"
          />
        </div>

        <br />

        <div>
          <label for="fecha_inicio">Fecha de Inicio:</label><br />
          <input
            id="fecha_inicio"
            v-model="formulario.fecha_inicio"
            type="date"
            required
          />
        </div>

        <br />

        <div>
          <label for="fecha_fin">Fecha de Fin:</label><br />
          <input
            id="fecha_fin"
            v-model="formulario.fecha_fin"
            type="date"
            required
          />
        </div>

        <br />

        <div>
          <label>
            <input v-model="formulario.activo" type="checkbox" />
            Marcar como Periodo Vigente/Activo
          </label>
        </div>

        <br />

        <button type="submit">
          {{ formulario.id_periodo ? 'Guardar Cambios' : 'Registrar Periodo' }}
        </button>
        <button v-if="formulario.id_periodo" type="button" @click="limpiarFormulario">
          Cancelar Edición
        </button>
      </fieldset>
    </form>

    <hr />

    <!-- Tabla -->
    <h3>Listado de Periodos</h3>
    <p v-if="cargando">Cargando periodos...</p>

    <table v-else border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Fecha Inicio</th>
          <th>Fecha Fin</th>
          <th>Vigente</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in periodos" :key="p.id_periodo">
          <td>{{ p.id_periodo }}</td>
          <td>{{ p.nombre }}</td>
          <td>{{ p.fecha_inicio }}</td>
          <td>{{ p.fecha_fin }}</td>
          <td>{{ p.activo ? 'SI (ACTIVO)' : 'No' }}</td>
          <td>
            <button type="button" @click="seleccionarParaEditar(p)">Editar</button>
            <button v-if="!p.activo" type="button" @click="activarPeriodo(p.id_periodo)">
              Establecer como Activo
            </button>
          </td>
        </tr>
        <tr v-if="periodos.length === 0">
          <td colspan="6">No hay periodos registrados.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
