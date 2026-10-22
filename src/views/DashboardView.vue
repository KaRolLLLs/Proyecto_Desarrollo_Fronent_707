<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const totales = ref({})
const periodoActivo = ref(null)
const ocupacionGrupos = ref([])
const resumenSolicitudes = ref([])
const ultimasSolicitudes = ref([])
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res = await api.dashboard.resumen()
    totales.value = res.totales || {}
    periodoActivo.value = res.periodo_activo
    ocupacionGrupos.value = res.ocupacion_grupos || []
    resumenSolicitudes.value = res.resumen_solicitudes || []
    ultimasSolicitudes.value = res.ultimas_solicitudes || []
  } catch (err) {
    error.value = 'Inicia sesión para visualizar los datos del dashboard. ' + err.message
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section>
    <h2>Dashboard / Panel Principal</h2>

    <p v-if="cargando">Cargando métricas del sistema...</p>
    <p v-if="error"><strong>Aviso:</strong> {{ error }}</p>

    <div v-if="!cargando && !error">
      <h3>Resumen General</h3>
      <ul>
        <li><strong>Estudiantes Registrados:</strong> {{ totales.estudiantes }}</li>
        <li><strong>Docentes Registrados:</strong> {{ totales.docentes }}</li>
        <li><strong>Cursos Activos:</strong> {{ totales.cursos }}</li>
        <li><strong>Grupos Abiertos:</strong> {{ totales.grupos_abiertos }}</li>
        <li>
          <strong>Periodo Escolar Vigente:</strong>
          {{ periodoActivo ? periodoActivo.nombre : 'Sin periodo activo' }}
        </li>
      </ul>

      <hr />

      <h3>Ocupación de Grupos (Vista SQL: v_ocupacion_grupos)</h3>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead>
          <tr>
            <th>Clave Grupo</th>
            <th>Curso</th>
            <th>Nivel</th>
            <th>Periodo</th>
            <th>Docente</th>
            <th>Cupo Máximo</th>
            <th>Inscritos</th>
            <th>Lugares Disponibles</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in ocupacionGrupos" :key="g.id_grupo">
            <td>{{ g.clave }}</td>
            <td>{{ g.curso }}</td>
            <td>{{ g.nivel_mcer }}</td>
            <td>{{ g.periodo }}</td>
            <td>{{ g.docente || 'Sin asignar' }}</td>
            <td>{{ g.cupo_max }}</td>
            <td>{{ g.inscritos }}</td>
            <td>{{ g.lugares_disponibles }}</td>
          </tr>
          <tr v-if="ocupacionGrupos.length === 0">
            <td colspan="8">No hay grupos registrados en este momento.</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h3>Resumen de Solicitudes y Trámites (Vista SQL: v_solicitudes_resumen)</h3>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead>
          <tr>
            <th>Tipo de Solicitud</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Horas Promedio Atención</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, idx) in resumenSolicitudes" :key="idx">
            <td>{{ s.tipo_solicitud }}</td>
            <td>{{ s.estado }}</td>
            <td>{{ s.total }}</td>
            <td>{{ s.horas_promedio_atencion ?? 'N/D' }}</td>
          </tr>
          <tr v-if="resumenSolicitudes.length === 0">
            <td colspan="4">No hay datos de solicitudes aún.</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h3>Últimas Solicitudes Recibidas</h3>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Tipo</th>
            <th>Solicitante</th>
            <th>Asunto</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sol in ultimasSolicitudes" :key="sol.id_solicitud">
            <td>{{ sol.folio }}</td>
            <td>{{ sol.tipo?.nombre }}</td>
            <td>{{ sol.solicitante?.nombre }}</td>
            <td>{{ sol.asunto }}</td>
            <td>{{ sol.estado }}</td>
            <td>{{ sol.fecha_creacion }}</td>
          </tr>
          <tr v-if="ultimasSolicitudes.length === 0">
            <td colspan="6">No se encontraron solicitudes recientes.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
