<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const docentes = ref([])
const cargando = ref(true)
const mensaje = ref('')
const error = ref('')

const formulario = ref({
  id_docente: null,
  nombre: '',
  correo: '',
  contrasena: 'password123',
  especialidad: '',
  certificaciones: '',
  estado: true,
})

async function cargarDocentes() {
  cargando.value = true
  try {
    const res = await api.docentes.listar()
    docentes.value = res.docentes || []
  } catch (err) {
    error.value = err.message || 'Error al cargar docentes'
  } finally {
    cargando.value = false
  }
}

function limpiarFormulario() {
  formulario.value = {
    id_docente: null,
    nombre: '',
    correo: '',
    contrasena: 'password123',
    especialidad: '',
    certificaciones: '',
    estado: true,
  }
}

function seleccionarParaEditar(doc) {
  formulario.value = {
    id_docente: doc.id_docente,
    nombre: doc.usuario?.nombre || '',
    correo: doc.usuario?.correo || '',
    contrasena: '',
    especialidad: doc.especialidad || '',
    certificaciones: doc.certificaciones || '',
    estado: Boolean(doc.usuario?.estado),
  }
}

async function guardarDocente() {
  mensaje.value = ''
  error.value = ''

  try {
    if (formulario.value.id_docente) {
      await api.docentes.actualizar(formulario.value.id_docente, formulario.value)
      mensaje.value = 'Docente actualizado con éxito.'
    } else {
      await api.docentes.crear(formulario.value)
      mensaje.value = 'Docente registrado exitosamente.'
    }
    limpiarFormulario()
    await cargarDocentes()
  } catch (err) {
    error.value = err.message || 'Error al guardar docente'
  }
}

onMounted(() => {
  cargarDocentes()
})
</script>

<template>
  <section>
    <h2>Módulo de Docentes</h2>

    <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
    <p v-if="error"><strong>Error:</strong> {{ error }}</p>

    <!-- Formulario de Docente -->
    <form @submit.prevent="guardarDocente">
      <fieldset>
        <legend>
          {{ formulario.id_docente ? 'Editar Docente' : 'Registrar Nuevo Docente' }}
        </legend>

        <div>
          <label for="doc_nombre">Nombre Completo:</label><br />
          <input
            id="doc_nombre"
            v-model="formulario.nombre"
            type="text"
            required
            placeholder="Nombre del Profesor(a)"
          />
        </div>

        <br />

        <div>
          <label for="doc_correo">Correo Electrónico:</label><br />
          <input
            id="doc_correo"
            v-model="formulario.correo"
            type="email"
            required
            placeholder="docente@itsm.edu.mx"
          />
        </div>

        <br />

        <div>
          <label for="doc_pass">
            Contraseña
            {{ formulario.id_docente ? '(Opcional, dejar vacío para conservar)' : '' }}:
          </label><br />
          <input
            id="doc_pass"
            v-model="formulario.contrasena"
            type="password"
            :required="!formulario.id_docente"
          />
        </div>

        <br />

        <div>
          <label for="doc_especialidad">Especialidad:</label><br />
          <input
            id="doc_especialidad"
            v-model="formulario.especialidad"
            type="text"
            placeholder="Ej. Inglés conversacional y gramática"
          />
        </div>

        <br />

        <div>
          <label for="doc_cert">Certificaciones:</label><br />
          <input
            id="doc_cert"
            v-model="formulario.certificaciones"
            type="text"
            placeholder="Ej. TOEFL, Cambridge CELTA, TKT"
          />
        </div>

        <br />

        <div v-if="formulario.id_docente">
          <label>
            <input v-model="formulario.estado" type="checkbox" />
            Docente Activo
          </label>
          <br /><br />
        </div>

        <button type="submit">
          {{ formulario.id_docente ? 'Guardar Cambios' : 'Registrar Docente' }}
        </button>
        <button v-if="formulario.id_docente" type="button" @click="limpiarFormulario">
          Cancelar Edición
        </button>
      </fieldset>
    </form>

    <hr />

    <!-- Tabla de Docentes -->
    <h3>Docentes Registrados</h3>
    <p v-if="cargando">Cargando docentes...</p>

    <table v-else border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Especialidad</th>
          <th>Certificaciones</th>
          <th>Grupos Asignados</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in docentes" :key="doc.id_docente">
          <td>{{ doc.id_docente }}</td>
          <td>{{ doc.usuario?.nombre }}</td>
          <td>{{ doc.usuario?.correo }}</td>
          <td>{{ doc.especialidad || 'General' }}</td>
          <td>{{ doc.certificaciones || 'Sin registrar' }}</td>
          <td>
            <span v-if="doc.grupos && doc.grupos.length > 0">
              {{ doc.grupos.map((g) => g.clave).join(', ') }}
            </span>
            <span v-else>Ninguno</span>
          </td>
          <td>{{ doc.usuario?.estado ? 'Activo' : 'Inactivo' }}</td>
          <td>
            <button type="button" @click="seleccionarParaEditar(doc)">Editar</button>
          </td>
        </tr>
        <tr v-if="docentes.length === 0">
          <td colspan="8">No hay docentes registrados.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
