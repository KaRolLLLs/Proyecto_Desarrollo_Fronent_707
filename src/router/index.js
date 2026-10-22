import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import CursosView from '../views/CursosView.vue'
import PeriodosView from '../views/PeriodosView.vue'
import GruposView from '../views/GruposView.vue'
import EstudiantesView from '../views/EstudiantesView.vue'
import DocentesView from '../views/DocentesView.vue'
import MatriculasView from '../views/MatriculasView.vue'
import AcademicoView from '../views/AcademicoView.vue'
import SolicitudesView from '../views/SolicitudesView.vue'
import NotificacionesView from '../views/NotificacionesView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/cursos',
    name: 'cursos',
    component: CursosView,
  },
  {
    path: '/periodos',
    name: 'periodos',
    component: PeriodosView,
  },
  {
    path: '/grupos',
    name: 'grupos',
    component: GruposView,
  },
  {
    path: '/estudiantes',
    name: 'estudiantes',
    component: EstudiantesView,
  },
  {
    path: '/docentes',
    name: 'docentes',
    component: DocentesView,
  },
  {
    path: '/matriculas',
    name: 'matriculas',
    component: MatriculasView,
  },
  {
    path: '/academico',
    name: 'academico',
    component: AcademicoView,
  },
  {
    path: '/solicitudes',
    name: 'solicitudes',
    component: SolicitudesView,
  },
  {
    path: '/notificaciones',
    name: 'notificaciones',
    component: NotificacionesView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
