// C:\Users\holam\Desktop\807 materias de repite\desarrollo fronent\Proyecto_fronent\src\services\api.js

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Cliente HTTP centralizado para comunicarse con el backend de Laravel
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    const error = new Error(data.message || 'Error en la petición a la API');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Comprobación de estado
  ping: () => request('/ping'),

  // Autenticación
  auth: {
    login: (correo, contrasena) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, contrasena }),
      }),
    me: () => request('/auth/me'),
    refresh: () => request('/auth/refresh', { method: 'POST' }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // Dashboard general
  dashboard: {
    resumen: () => request('/dashboard/resumen'),
  },

  // Cursos
  cursos: {
    listar: () => request('/cursos'),
    obtener: (id) => request(`/cursos/${id}`),
    crear: (data) =>
      request('/cursos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    actualizar: (id, data) =>
      request(`/cursos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    desactivar: (id) =>
      request(`/cursos/${id}`, {
        method: 'DELETE',
      }),
  },

  // Periodos escolares
  periodos: {
    listar: () => request('/periodos'),
    obtener: (id) => request(`/periodos/${id}`),
    crear: (data) =>
      request('/periodos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    actualizar: (id, data) =>
      request(`/periodos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    activar: (id) =>
      request(`/periodos/${id}/activar`, {
        method: 'PUT',
      }),
  },

  // Grupos y horarios
  grupos: {
    listar: (params = '') => request(`/grupos${params}`),
    obtener: (id) => request(`/grupos/${id}`),
    crear: (data) =>
      request('/grupos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    actualizar: (id, data) =>
      request(`/grupos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    cancelar: (id) =>
      request(`/grupos/${id}`, {
        method: 'DELETE',
      }),
  },

  // Estudiantes
  estudiantes: {
    listar: () => request('/estudiantes'),
    obtener: (id) => request(`/estudiantes/${id}`),
    crear: (data) =>
      request('/estudiantes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    actualizar: (id, data) =>
      request(`/estudiantes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Docentes
  docentes: {
    listar: () => request('/docentes'),
    obtener: (id) => request(`/docentes/${id}`),
    crear: (data) =>
      request('/docentes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    actualizar: (id, data) =>
      request(`/docentes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Matrículas / Inscripciones
  matriculas: {
    listar: (params = '') => request(`/matriculas${params}`),
    inscribir: (id_estudiante, id_grupo) =>
      request('/matriculas', {
        method: 'POST',
        body: JSON.stringify({ id_estudiante, id_grupo }),
      }),
    cambiarEstado: (id, estado) =>
      request(`/matriculas/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado }),
      }),
  },

  // Académico (Asistencias y Calificaciones)
  academico: {
    getAsistenciasGrupo: (idGrupo, fecha = '') =>
      request(`/academico/grupos/${idGrupo}/asistencias${fecha ? `?fecha=${fecha}` : ''}`),
    guardarAsistencias: (fecha, asistencias) =>
      request('/academico/asistencias', {
        method: 'POST',
        body: JSON.stringify({ fecha, asistencias }),
      }),
    getCalificacionesGrupo: (idGrupo) =>
      request(`/academico/grupos/${idGrupo}/calificaciones`),
    registrarCalificacion: (data) =>
      request('/academico/calificaciones', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    publicarCalificacion: (id) =>
      request(`/academico/calificaciones/${id}/publicar`, {
        method: 'PUT',
      }),
    misCalificaciones: () => request('/academico/mis-calificaciones'),
    misAsistencias: () => request('/academico/mis-asistencias'),
  },

  // Solicitudes y Trámites
  solicitudes: {
    tipos: () => request('/solicitudes/tipos'),
    listar: (params = '') => request(`/solicitudes${params}`),
    obtener: (id) => request(`/solicitudes/${id}`),
    crear: (data) =>
      request('/solicitudes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    atender: (id, data) =>
      request(`/solicitudes/${id}/atender`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Notificaciones
  notificaciones: {
    listar: () => request('/notificaciones'),
    marcarLeida: (id) =>
      request(`/notificaciones/${id}/leer`, {
        method: 'PUT',
      }),
    marcarTodasLeidas: () =>
      request('/notificaciones/marcar-todas-leidas', {
        method: 'PUT',
      }),
  },
};

export default api;
