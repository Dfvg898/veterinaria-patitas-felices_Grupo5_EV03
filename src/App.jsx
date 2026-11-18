import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import {
  ROLES_PERMISOS,
  INITIAL_USUARIOS,
  INITIAL_CLIENTES,
  INITIAL_MASCOTAS,
  INITIAL_CITAS,
  INITIAL_ATENCIONES,
  INITIAL_VACUNAS,
  INITIAL_PRODUCTOS,
  INITIAL_MOVIMIENTOS,
  INITIAL_VENTAS,
  INITIAL_GASTOS,
  INITIAL_RECORDATORIOS
} from './data/seedVeterinaria'
import './App.css'

const HORARIOS_BASE = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00']

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function App() {
  // 1. Estado de Autenticación Supabase + Rol Activo (CU01, CU02 | RF01-RF04)
  const [supabaseSession, setSupabaseSession] = useState(null)
  const [usuarioActivo, setUsuarioActivo] = useState(null)
  const [correoLogin, setCorreoLogin] = useState('')
  const [passLogin, setPassLogin] = useState('')
  const [alertaGlobal, setAlertaGlobal] = useState(null)
  const [modoOffline, setModoOffline] = useState(false)
  const [moduloActual, setModuloActual] = useState('dashboard')

  // 2. Estado de Datos Clínicos con Caché Local Sincronizado (RNF04, RNF07)
  const [usuarios, setUsuarios] = useState(() => loadLocal('vet_usuarios_v3', INITIAL_USUARIOS))
  const [clientes, setClientes] = useState(() => loadLocal('vet_clientes_v3', INITIAL_CLIENTES))
  const [mascotas, setMascotas] = useState(() => loadLocal('vet_mascotas_v3', INITIAL_MASCOTAS))
  const [citas, setCitas] = useState(() => loadLocal('vet_citas_v3', INITIAL_CITAS))
  const [atenciones, setAtenciones] = useState(() => loadLocal('vet_atenciones_v3', INITIAL_ATENCIONES))
  const [vacunas, setVacunas] = useState(() => loadLocal('vet_vacunas_v3', INITIAL_VACUNAS))
  const [productos, setProductos] = useState(() => loadLocal('vet_productos_v3', INITIAL_PRODUCTOS))
  const [movimientos, setMovimientos] = useState(() => loadLocal('vet_movimientos_v3', INITIAL_MOVIMIENTOS))
  const [ventas, setVentas] = useState(() => loadLocal('vet_ventas_v3', INITIAL_VENTAS))
  const [gastos, setGastos] = useState(() => loadLocal('vet_gastos_v3', INITIAL_GASTOS))
  const [recordatorios, setRecordatorios] = useState(() => loadLocal('vet_recordatorios_v3', INITIAL_RECORDATORIOS))

  // 3. Estado para Tareas RLS en vivo de Supabase (Etapa 5 Grupo 5)
  const [tareasRls, setTareasRls] = useState([])
  const [tituloTarea, setTituloTarea] = useState('')
  const [descTarea, setDescTarea] = useState('')
  const [estadoTarea, setEstadoTarea] = useState('pendiente')
  const [respTarea, setRespTarea] = useState('')
  const [filtroTarea, setFiltroTarea] = useState('Todas')

  // Formularios por módulo
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [formCliente, setFormCliente] = useState({ id: '', rut: '', nombre: '', telefono: '', correo: '', direccion: '' })
  const [formMascota, setFormMascota] = useState({ clienteId: 'c1', nombre: '', especie: 'Perro', raza: '', sexo: 'Macho', fechaNacimiento: '2024-01-15', peso: '', alergias: '' })

  const [filtroFechaCita, setFiltroFechaCita] = useState('2026-11-16')
  const [filtroVetCita, setFiltroVetCita] = useState('Todos')
  const [vistaAgenda, setVistaAgenda] = useState('diaria')
  const [formCita, setFormCita] = useState({ mascotaId: 'm1', servicio: 'Consulta General', veterinario: 'Dra. Camila Rojas', fecha: '2026-11-16', hora: '10:00', esUrgencia: false, gravedad: 'Normal', motivo: '' })

  const [mascotaFichaSel, setMascotaFichaSel] = useState('m1')
  const [formAtencion, setFormAtencion] = useState({ motivo: '', pesoKg: '31.4', temperaturaC: '38.5', diagnostico: '', tratamiento: '', observaciones: '', estadoRegistro: 'Finalizada' })
  const [formVacuna, setFormVacuna] = useState({ tipo: 'Vacuna', productoId: 'p1', fechaAplicacion: '2026-11-16', lote: 'NBV-8841A' })

  const [formProducto, setFormProducto] = useState({ sku: '', nombre: '', categoria: 'Medicamentos', stock: 10, stockMinimo: 5, precio: 12000, fechaVencimiento: '2027-06-30', lote: '' })
  const [formMovStock, setFormMovStock] = useState({ productoId: 'p1', tipo: 'Entrada', cantidad: 5, motivo: 'Reposición de inventario' })

  const [formVenta, setFormVenta] = useState({ clienteId: 'c1', mascotaId: 'm1', servicioMonto: 18000, servicioNombre: 'Consulta General ($18.000)', productoId: 'p5', cantidadProd: 1, medioPago: 'Tarjeta', estadoPago: 'Pagado', abonoInicial: 0 })
  const [formGasto, setFormGasto] = useState({ proveedor: '', categoria: 'Insumos y Vacunas', descripcion: '', monto: 45000, estado: 'Pagado' })

  const [tipoReporte, setTipoReporte] = useState('ventas')
  const [rangoInicio, setRangoInicio] = useState('2026-11-01')
  const [rangoFin, setRangoFin] = useState('2026-11-30')

  const [formUsuario, setFormUsuario] = useState({ nombre: '', rut: '', correo: '', pass: 'Patitas2026!', rol: 'Asistente', especialidad: '' })

  // Persistencia automática en Caché Local (RNF04)
  useEffect(() => { localStorage.setItem('vet_usuarios_v3', JSON.stringify(usuarios)) }, [usuarios])
  useEffect(() => { localStorage.setItem('vet_clientes_v3', JSON.stringify(clientes)) }, [clientes])
  useEffect(() => { localStorage.setItem('vet_mascotas_v3', JSON.stringify(mascotas)) }, [mascotas])
  useEffect(() => { localStorage.setItem('vet_citas_v3', JSON.stringify(citas)) }, [citas])
  useEffect(() => { localStorage.setItem('vet_atenciones_v3', JSON.stringify(atenciones)) }, [atenciones])
  useEffect(() => { localStorage.setItem('vet_vacunas_v3', JSON.stringify(vacunas)) }, [vacunas])
  useEffect(() => { localStorage.setItem('vet_productos_v3', JSON.stringify(productos)) }, [productos])
  useEffect(() => { localStorage.setItem('vet_movimientos_v3', JSON.stringify(movimientos)) }, [movimientos])
  useEffect(() => { localStorage.setItem('vet_ventas_v3', JSON.stringify(ventas)) }, [ventas])
  useEffect(() => { localStorage.setItem('vet_gastos_v3', JSON.stringify(gastos)) }, [gastos])
  useEffect(() => { localStorage.setItem('vet_recordatorios_v3', JSON.stringify(recordatorios)) }, [recordatorios])

  // Escuchar sesión de Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setSupabaseSession(data.session)
      }
    }).catch(() => setModoOffline(true))

    const { data } = supabase.auth.onAuthStateChange((_ev, session) => {
      setSupabaseSession(session)
      if (session?.user) {
        setRespTarea(session.user.email || '')
        cargarTareasSupabase()
      } else {
        setTareasRls([])
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  function notificar(tipo, texto) {
    setAlertaGlobal({ tipo, texto })
    setTimeout(() => setAlertaGlobal(null), 5500)
  }

  // Cargar tareas de la tabla real public.tareas en Supabase (Etapa 5 RLS)
  async function cargarTareasSupabase() {
    try {
      const { data, error } = await supabase.from('tareas').select('*').order('id', { ascending: false })
      if (!error && data) {
        setTareasRls(data)
        setModoOffline(false)
      }
    } catch {
      setModoOffline(true)
    }
  }

  // Login principal (RF01, RF02, RF04: Bloqueo tras 3 intentos fallidos + Supabase Auth)
  async function manejarLogin(e) {
    e.preventDefault()
    const emailNorm = correoLogin.trim().toLowerCase()

    // 1. Verificar si pertenece al personal interno de la clínica
    const idx = usuarios.findIndex(u => u.correo.toLowerCase() === emailNorm)
    if (idx !== -1) {
      const u = usuarios[idx]
      if (!u.activo) {
        notificar('error', `La cuenta de ${u.nombre} se encuentra desactivada por el Administrador (RF03).`)
        return
      }
      if (u.bloqueado) {
        notificar('error', `SEGURIDAD (RF04 / OWASP ASVS V2.2.1): Cuenta bloqueada por superar 3 intentos fallidos. Solicite desbloqueo al Administrador.`)
        return
      }
      if (u.pass !== passLogin) {
        const nuevosIntentos = (u.intentos || 0) + 1
        const quedaBloqueado = nuevosIntentos >= 3
        const copia = [...usuarios]
        copia[idx] = { ...u, intentos: nuevosIntentos, bloqueado: quedaBloqueado }
        setUsuarios(copia)
        if (quedaBloqueado) {
          notificar('error', `ALERTA RF04: 3 intentos fallidos alcanzados. La cuenta ${u.correo} ha sido BLOQUEADA automáticamente.`)
        } else {
          notificar('error', `Contraseña incorrecta para ${u.correo}. Intento ${nuevosIntentos} de 3 antes del bloqueo automático (RF04).`)
        }
        return
      }
      // Login exitoso
      const copia = [...usuarios]
      copia[idx] = { ...u, intentos: 0 }
      setUsuarios(copia)
      setUsuarioActivo(copia[idx])
      setRespTarea(copia[idx].correo)
      setModuloActual('dashboard')
      cargarTareasSupabase()
      notificar('success', `Sesión iniciada como ${u.nombre} — Rol activo: ${u.rol} (RF01, RF02).`)
      return
    }

    // 2. Si es una cuenta de prueba directa de Supabase Auth (ej. alumno1@prueba.cl)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailNorm,
      password: passLogin
    })
    if (error) {
      notificar('error', `Error de autenticación en Supabase Auth: ${error.message}`)
    } else if (data?.user) {
      const perfilSupabase = {
        id: data.user.id,
        nombre: `Usuario Supabase (${data.user.email})`,
        rut: '19.000.000-1',
        correo: data.user.email,
        rol: 'Administrador',
        especialidad: 'Cuenta Autenticada Supabase JWT',
        activo: true
      }
      setUsuarioActivo(perfilSupabase)
      setRespTarea(data.user.email)
      cargarTareasSupabase()
      notificar('success', `Autenticado vía Supabase Auth JWT (${data.user.email}). Políticas RLS activas.`)
    }
  }

  function loginRapidoRol(rolBuscado) {
    const u = usuarios.find(x => x.rol === rolBuscado && x.activo)
    if (!u) return
    if (u.bloqueado) {
      const desbloq = usuarios.map(item => item.id === u.id ? { ...item, intentos: 0, bloqueado: false } : item)
      setUsuarios(desbloq)
    }
    setUsuarioActivo({ ...u, intentos: 0, bloqueado: false })
    setRespTarea(u.correo)
    setModuloActual('dashboard')
    cargarTareasSupabase()
    notificar('success', `Ingreso rápido de demostración como ${u.nombre} (Rol: ${u.rol}).`)
  }

  function simularBloqueoRF04() {
    const targetEmail = correoLogin.trim() || 'recepcion@patitasfelices.cl'
    setCorreoLogin(targetEmail)
    const idx = usuarios.findIndex(u => u.correo.toLowerCase() === targetEmail.toLowerCase())
    if (idx !== -1) {
      const u = usuarios[idx]
      const nuevos = Math.min(3, (u.intentos || 0) + 1)
      const bloq = nuevos >= 3
      const copia = [...usuarios]
      copia[idx] = { ...u, intentos: nuevos, bloqueado: bloq }
      setUsuarios(copia)
      if (bloq) {
        notificar('error', `DEMO RF04: Cuenta ${u.correo} BLOQUEADA tras 3 intentos fallidos consecutivos (OWASP ASVS V2.2.1).`)
      } else {
        notificar('warning', `DEMO RF04: Intento fallido ${nuevos}/3 registrado para ${u.correo}.`)
      }
    }
  }

  async function cerrarSesionCompleta() {
    await supabase.auth.signOut().catch(() => {})
    setUsuarioActivo(null)
    setCorreoLogin('')
    setPassLogin('')
  }

  function cambiarRolEnVivo(nuevoRol) {
    const encontrado = usuarios.find(u => u.rol === nuevoRol) || {
      ...usuarioActivo,
      rol: nuevoRol,
      nombre: `${usuarioActivo.nombre.split(' (')[0]} (${nuevoRol})`
    }
    setUsuarioActivo(encontrado)
    const permisosNuevo = ROLES_PERMISOS[nuevoRol]
    if (!permisosNuevo.modulos.includes(moduloActual)) {
      setModuloActual('dashboard')
    }
    notificar('success', `Vista cambiada al Rol: ${nuevoRol}. Menús y permisos actualizados según matriz RBAC (RF02).`)
  }

  // ===========================================================================
  // FUNCIONES OPERATIVAS DE LOS MÓDULOS (CU02 a CU17 | RF03 a RF34)
  // ===========================================================================

  // CU03: Registrar o editar Cliente (RF05, RF08)
  function guardarCliente(e) {
    e.preventDefault()
    if (!formCliente.rut.trim() || !formCliente.nombre.trim() || !formCliente.telefono.trim()) {
      notificar('error', 'RUT, Nombre completo y Teléfono son obligatorios (CU03).')
      return
    }
    if (formCliente.id) {
      setClientes(clientes.map(c => c.id === formCliente.id ? { ...formCliente } : c))
      notificar('success', `Datos del cliente ${formCliente.nombre} actualizados correctamente (RF08).`)
    } else {
      if (clientes.some(c => c.rut.toLowerCase() === formCliente.rut.trim().toLowerCase())) {
        notificar('warning', 'El RUT ingresado ya está registrado. Puede seleccionarlo para asociarle una nueva mascota (CU03 flujo alternativo).')
        return
      }
      const nuevo = { ...formCliente, id: 'c' + (Date.now()) }
      setClientes([nuevo, ...clientes])
      setFormMascota({ ...formMascota, clienteId: nuevo.id })
      notificar('success', `Cliente ${nuevo.nombre} registrado con éxito (RF05).`)
    }
    setFormCliente({ id: '', rut: '', nombre: '', telefono: '', correo: '', direccion: '' })
  }

  // CU03: Registrar Mascota + Ficha Clínica Digital única (RF06, RF09, RF16)
  function guardarMascota(e) {
    e.preventDefault()
    if (!formMascota.nombre.trim() || !formMascota.peso) {
      notificar('error', 'Debe indicar el nombre y peso actual de la mascota (RF06).')
      return
    }
    const correlativo = String(mascotas.length + 1).padStart(3, '0')
    const codigoFicha = `FC-2026-${correlativo}`
    const nuevaMascota = {
      id: 'm' + Date.now(),
      fichaCodigo: codigoFicha,
      clienteId: formMascota.clienteId,
      nombre: formMascota.nombre.trim(),
      especie: formMascota.especie,
      raza: formMascota.raza.trim() || 'Mestizo',
      sexo: formMascota.sexo,
      fechaNacimiento: formMascota.fechaNacimiento,
      peso: parseFloat(formMascota.peso),
      alergias: formMascota.alergias.trim() || 'Sin alergias registradas'
    }
    setMascotas([nuevaMascota, ...mascotas])
    setFormMascota({ ...formMascota, nombre: '', raza: '', peso: '', alergias: '' })
    notificar('success', `Mascota "${nuevaMascota.nombre}" vinculada al cliente y Ficha Clínica Digital ${codigoFicha} creada automáticamente (RF06, RF09, RF16).`)
  }

  // CU04 & CU11: Agendar Cita validando no cruce de horario (RF10, RF11, RF12, RF21)
  function guardarCita(e) {
    e.preventDefault()
    const colision = citas.find(
      c => c.fecha === formCita.fecha &&
           c.hora === formCita.hora &&
           c.veterinario === formCita.veterinario &&
           c.estado !== 'Cancelada'
    )
    if (colision && !formCita.esUrgencia) {
      const ocupados = citas
        .filter(c => c.fecha === formCita.fecha && c.veterinario === formCita.veterinario && c.estado !== 'Cancelada')
        .map(c => c.hora)
      const libres = HORARIOS_BASE.filter(h => !ocupados.includes(h)).slice(0, 3)
      notificar('error', `COLISIÓN DE HORARIO (RF11): ${formCita.veterinario} ya tiene cita a las ${formCita.hora}. Bloques disponibles sugeridos: ${libres.join(', ')}.`)
      return
    }
    const nuevaCita = {
      id: 'ct' + Date.now(),
      mascotaId: formCita.mascotaId,
      servicio: formCita.esUrgencia ? `URGENCIA: ${formCita.servicio}` : formCita.servicio,
      veterinario: formCita.veterinario,
      fecha: formCita.fecha,
      hora: formCita.hora,
      estado: formCita.esUrgencia ? 'En espera' : 'Pendiente',
      esUrgencia: formCita.esUrgencia,
      gravedad: formCita.esUrgencia ? formCita.gravedad : 'Normal',
      motivo: formCita.motivo.trim() || 'Atención programada'
    }
    setCitas(formCita.esUrgencia ? [nuevaCita, ...citas] : [...citas, nuevaCita])
    setFormCita({ ...formCita, motivo: '', esUrgencia: false })
    notificar('success', formCita.esUrgencia
      ? `Atención de Urgencia ingresada con prioridad alta en la agenda (CU11, RF21).`
      : `Cita agendada para el ${nuevaCita.fecha} a las ${nuevaCita.hora} con ${nuevaCita.veterinario} sin cruce de horario (CU04, RF10, RF11).`)
  }

  // CU05: Cambiar estado / Reprogramar o Cancelar cita liberando horario (RF13, RF15)
  function cambiarEstadoCita(idCita, nuevoEstado) {
    setCitas(citas.map(c => c.id === idCita ? { ...c, estado: nuevoEstado } : c))
    notificar('success', `Estado de la cita actualizado a "${nuevoEstado}" (RF13, RF15).`)
  }

  function reprogramarCita(citaObj) {
    const ocupados = citas
      .filter(c => c.fecha === citaObj.fecha && c.veterinario === citaObj.veterinario && c.estado !== 'Cancelada')
      .map(c => c.hora)
    const siguienteLibre = HORARIOS_BASE.find(h => !ocupados.includes(h)) || '17:30'
    setCitas(citas.map(c => c.id === citaObj.id ? { ...c, hora: siguienteLibre, estado: 'Pendiente' } : c))
    notificar('success', `Cita reprogramada al bloque disponible ${siguienteLibre} hrs, liberando el bloque anterior (${citaObj.hora}) (CU05, RF13).`)
  }

  // CU07: Registrar Atención Clínica en Ficha Digital (RF17, RF18)
  function guardarAtencionClinica(e) {
    e.preventDefault()
    if (!formAtencion.motivo.trim() || !formAtencion.diagnostico.trim()) {
      notificar('error', 'Debe ingresar el motivo de consulta y el diagnóstico clínico (CU07, RF17).')
      return
    }
    const nueva = {
      id: 'at' + Date.now(),
      mascotaId: mascotaFichaSel,
      fecha: new Date().toISOString().slice(0, 10),
      veterinario: usuarioActivo.rol === 'Veterinario' ? usuarioActivo.nombre : 'Dra. Camila Rojas',
      motivo: formAtencion.motivo,
      pesoKg: parseFloat(formAtencion.pesoKg) || 10,
      temperaturaC: parseFloat(formAtencion.temperaturaC) || 38.5,
      diagnostico: formAtencion.diagnostico,
      tratamiento: formAtencion.tratamiento || 'Indicaciones generales en consulta',
      observaciones: formAtencion.observaciones,
      estadoRegistro: formAtencion.estadoRegistro
    }
    setAtenciones([nueva, ...atenciones])
    if (formAtencion.pesoKg) {
      setMascotas(mascotas.map(m => m.id === mascotaFichaSel ? { ...m, peso: parseFloat(formAtencion.pesoKg) } : m))
    }
    if (formAtencion.estadoRegistro === 'Finalizada') {
      setCitas(citas.map(c => (c.mascotaId === mascotaFichaSel && c.estado !== 'Cancelada') ? { ...c, estado: 'Atendida' } : c))
    }
    setFormAtencion({ motivo: '', pesoKg: formAtencion.pesoKg, temperaturaC: '38.5', diagnostico: '', tratamiento: '', observaciones: '', estadoRegistro: 'Finalizada' })
    notificar('success', `Atención clínica registrada (${nueva.estadoRegistro}) en la ficha de la mascota y cita marcada como Atendida (CU07, RF17).`)
  }

  // CU09: Registrar Vacuna/Desparasitación + Cálculo próximo refuerzo (RF19, RF20) + Descuento Stock (RF26)
  function guardarVacunacion(e) {
    e.preventDefault()
    const prod = productos.find(p => p.id === formVacuna.productoId)
    if (!prod) return

    // Calcular fecha de próximo refuerzo automáticamente (RF20)
    const fechaBase = new Date(formVacuna.fechaAplicacion + 'T12:00:00')
    if (formVacuna.tipo === 'Vacuna') {
      fechaBase.setFullYear(fechaBase.getFullYear() + 1)
    } else {
      fechaBase.setMonth(fechaBase.getMonth() + 3)
    }
    const proximoRefuerzo = fechaBase.toISOString().slice(0, 10)

    const nuevoReg = {
      id: 'v' + Date.now(),
      mascotaId: mascotaFichaSel,
      tipo: formVacuna.tipo,
      productoId: prod.id,
      productoNombre: prod.nombre,
      fechaAplicacion: formVacuna.fechaAplicacion,
      lote: formVacuna.lote || prod.lote,
      proximoRefuerzo,
      responsable: usuarioActivo.nombre
    }
    setVacunas([nuevoReg, ...vacunas])

    // Descontar automáticamente 1 unidad del inventario (RF26)
    const nuevoStock = Math.max(0, prod.stock - 1)
    setProductos(productos.map(p => p.id === prod.id ? { ...p, stock: nuevoStock } : p))
    setMovimientos([
      {
        id: 'mv' + Date.now(),
        productoId: prod.id,
        productoNombre: prod.nombre,
        tipo: 'Salida',
        cantidad: 1,
        motivo: `Aplicación clínica ${formVacuna.tipo} en ficha (CU09 / RF26)`,
        responsable: usuarioActivo.nombre,
        fecha: new Date().toISOString().slice(0, 16).replace('T', ' ')
      },
      ...movimientos
    ])
    notificar('success', `${formVacuna.tipo} registrada. Próximo refuerzo calculado automáticamente para el ${proximoRefuerzo} (RF20) y 1 unidad descontada de inventario (RF26).`)
  }

  // CU10: Generar barrido de recordatorios automáticos (RF22, RF23, RF24)
  function ejecutarBarridoRecordatorios() {
    const nuevos = []
    citas.filter(c => c.estado === 'Pendiente').forEach(c => {
      const m = mascotas.find(x => x.id === c.mascotaId)
      const cli = clientes.find(x => x.id === m?.clienteId)
      if (m && cli) {
        const contactoValido = cli.telefono && cli.telefono.startsWith('+569') && cli.telefono.length >= 11
        nuevos.push({
          id: 'r' + Date.now() + Math.random().toString(36).slice(2, 6),
          fechaEnvio: new Date().toISOString().slice(0, 10),
          clienteNombre: cli.nombre,
          mascotaNombre: `${m.nombre} (${m.fichaCodigo})`,
          contacto: cli.telefono || 'Sin teléfono',
          canal: 'WhatsApp / Correo Automático',
          tipo: 'Cita Próxima 24h (RF23)',
          mensaje: `Recordatorio automático: ${m.nombre} tiene cita (${c.servicio}) el ${c.fecha} a las ${c.hora} con ${c.veterinario}.`,
          estadoEntrega: contactoValido ? 'Entregado' : 'No entregado (Contacto inválido)'
        })
      }
    })
    setRecordatorios([...nuevos, ...recordatorios])
    const fallidos = nuevos.filter(n => n.estadoEntrega.includes('No entregado')).length
    notificar('success', `Barrido automático ejecutado (CU10): ${nuevos.length} recordatorios procesados (${fallidos} marcados como no entregados por contacto inválido para revisión de recepción - RF24).`)
  }

  // CU12 & CU13: Inventario y Movimientos de Stock (RF25-RF30)
  function guardarProducto(e) {
    e.preventDefault()
    if (!formProducto.sku.trim() || !formProducto.nombre.trim()) {
      notificar('error', 'Código SKU y Nombre del producto son obligatorios (RF25).')
      return
    }
    if (productos.some(p => p.sku.toLowerCase() === formProducto.sku.trim().toLowerCase())) {
      notificar('warning', 'El código SKU ya existe en el catálogo (CU12 flujo alternativo).')
      return
    }
    const prod = {
      ...formProducto,
      id: 'p' + Date.now(),
      stock: parseInt(formProducto.stock, 10) || 0,
      stockMinimo: parseInt(formProducto.stockMinimo, 10) || 5,
      precio: parseInt(formProducto.precio, 10) || 0
    }
    setProductos([prod, ...productos])
    setFormProducto({ sku: '', nombre: '', categoria: 'Medicamentos', stock: 10, stockMinimo: 5, precio: 12000, fechaVencimiento: '2027-06-30', lote: '' })
    notificar('success', `Producto "${prod.nombre}" agregado al catálogo de inventario (CU12, RF25).`)
  }

  function registrarMovimientoManual(e) {
    e.preventDefault()
    const prod = productos.find(p => p.id === formMovStock.productoId)
    if (!prod) return
    const cant = parseInt(formMovStock.cantidad, 10) || 0
    if (cant <= 0) return

    if (formMovStock.tipo === 'Salida' && cant > prod.stock) {
      notificar('error', `Stock insuficiente (CU13): No puede retirar ${cant} unidades de "${prod.nombre}" (Stock actual: ${prod.stock}).`)
      return
    }
    const nuevoStock = formMovStock.tipo === 'Entrada' ? prod.stock + cant : prod.stock - cant
    setProductos(productos.map(p => p.id === prod.id ? { ...p, stock: nuevoStock } : p))
    setMovimientos([
      {
        id: 'mv' + Date.now(),
        productoId: prod.id,
        productoNombre: prod.nombre,
        tipo: formMovStock.tipo,
        cantidad: cant,
        motivo: formMovStock.motivo,
        responsable: usuarioActivo.nombre,
        fecha: new Date().toISOString().slice(0, 16).replace('T', ' ')
      },
      ...movimientos
    ])
    notificar('success', `Movimiento de ${formMovStock.tipo} (${cant} u.) registrado en el Kardex. Nuevo stock de "${prod.nombre}": ${nuevoStock} (RF27, RF30).`)
  }

  // CU15 & CU16: Ventas/Cobros y Gastos a Proveedores (RF26, RF31, RF32, RF33)
  function registrarVentaCobro(e) {
    e.preventDefault()
    const cli = clientes.find(c => c.id === formVenta.clienteId)
    const masc = mascotas.find(m => m.id === formVenta.mascotaId)
    const prod = productos.find(p => p.id === formVenta.productoId)
    const cantProd = parseInt(formVenta.cantidadProd, 10) || 0
    const subtotalProd = prod ? prod.precio * cantProd : 0
    const totalCalculado = (parseInt(formVenta.servicioMonto, 10) || 0) + subtotalProd
    const saldo = formVenta.estadoPago === 'Deuda pendiente'
      ? Math.max(1000, totalCalculado - (parseInt(formVenta.abonoInicial, 10) || 0))
      : 0

    const folio = `BOL-2026-0${ventas.length + 101}`
    const detalle = `${formVenta.servicioNombre}${prod && cantProd > 0 ? ` + ${cantProd}x ${prod.nombre} ($${subtotalProd.toLocaleString('es-CL')})` : ''}`

    setVentas([
      {
        id: 'vt' + Date.now(),
        folio,
        fecha: new Date().toISOString().slice(0, 10),
        clienteNombre: cli ? cli.nombre : 'Cliente General',
        mascotaNombre: masc ? `${masc.nombre} (${masc.fichaCodigo})` : '-',
        detalleItems: detalle,
        total: totalCalculado,
        medioPago: formVenta.medioPago,
        estadoPago: formVenta.estadoPago,
        saldoPendiente: saldo,
        responsable: usuarioActivo.nombre
      },
      ...ventas
    ])

    if (prod && cantProd > 0) {
      setProductos(productos.map(p => p.id === prod.id ? { ...p, stock: Math.max(0, p.stock - cantProd) } : p))
      setMovimientos([
        {
          id: 'mv' + Date.now(),
          productoId: prod.id,
          productoNombre: prod.nombre,
          tipo: 'Salida',
          cantidad: cantProd,
          motivo: `Venta en recepción ${folio} (RF26, RF31)`,
          responsable: usuarioActivo.nombre,
          fecha: new Date().toISOString().slice(0, 16).replace('T', ' ')
        },
        ...movimientos
      ])
    }
    notificar('success', `Venta ${folio} registrada por $${totalCalculado.toLocaleString('es-CL')} (${formVenta.medioPago} - ${formVenta.estadoPago}) y stock actualizado (CU15, RF31, RF32).`)
  }

  function saldarDeudaVenta(idVenta) {
    setVentas(ventas.map(v => v.id === idVenta ? { ...v, estadoPago: 'Pagado', saldoPendiente: 0 } : v))
    notificar('success', 'Deuda pendiente pagada y comprobante actualizado (RF32).')
  }

  function registrarGastoProveedor(e) {
    e.preventDefault()
    if (!formGasto.proveedor.trim() || !formGasto.descripcion.trim()) return
    const nuevo = {
      id: 'g' + Date.now(),
      fecha: new Date().toISOString().slice(0, 10),
      proveedor: formGasto.proveedor,
      categoria: formGasto.categoria,
      descripcion: formGasto.descripcion,
      monto: parseInt(formGasto.monto, 10) || 0,
      estado: formGasto.estado,
      responsable: usuarioActivo.nombre
    }
    setGastos([nuevo, ...gastos])
    setFormGasto({ proveedor: '', categoria: 'Insumos y Vacunas', descripcion: '', monto: 45000, estado: 'Pagado' })
    notificar('success', `Gasto de proveedor "${nuevo.proveedor}" registrado correctamente (CU16, RF33).`)
  }

  // CU17: Exportar Reportes a Excel (CSV UTF-8 BOM) o PDF/Impresión (RF34)
  function exportarReporteCSV() {
    let filas = []
    if (tipoReporte === 'ventas') {
      filas = [['Folio', 'Fecha', 'Cliente', 'Mascota', 'Detalle', 'Total CLP', 'Medio Pago', 'Estado Pago', 'Saldo Pendiente']]
      ventas.forEach(v => filas.push([v.folio, v.fecha, v.clienteNombre, v.mascotaNombre, v.detalleItems, v.total, v.medioPago, v.estadoPago, v.saldoPendiente]))
    } else if (tipoReporte === 'gastos') {
      filas = [['Fecha', 'Proveedor', 'Categoria', 'Descripcion', 'Monto CLP', 'Estado', 'Responsable']]
      gastos.forEach(g => filas.push([g.fecha, g.proveedor, g.categoria, g.descripcion, g.monto, g.estado, g.responsable]))
    } else if (tipoReporte === 'stock') {
      filas = [['SKU', 'Producto', 'Categoria', 'Stock Actual', 'Stock Minimo', 'Precio CLP', 'Vencimiento', 'Lote']]
      productos.forEach(p => filas.push([p.sku, p.nombre, p.categoria, p.stock, p.stockMinimo, p.precio, p.fechaVencimiento, p.lote]))
    } else {
      filas = [['Fecha', 'Hora', 'Mascota ID', 'Servicio', 'Veterinario', 'Estado', 'Urgencia']]
      citas.forEach(c => filas.push([c.fecha, c.hora, c.mascotaId, c.servicio, c.veterinario, c.estado, c.esUrgencia ? 'SI' : 'NO']))
    }
    const csvContent = '\uFEFF' + filas.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Reporte_${tipoReporte}_PatitasFelices_${rangoInicio}_${rangoFin}.csv`
    a.click()
    URL.revokeObjectURL(url)
    notificar('success', `Reporte de ${tipoReporte.toUpperCase()} exportado a archivo Excel (.csv) correctamente (CU17, RF34).`)
  }

  // CU02: Gestión de Usuarios y Desbloqueo de Cuentas (RF02, RF03, RF04)
  function crearNuevoUsuarioClinica(e) {
    e.preventDefault()
    if (!formUsuario.nombre.trim() || !formUsuario.correo.trim()) return
    const nuevo = {
      ...formUsuario,
      id: 'u' + Date.now(),
      activo: true,
      intentos: 0,
      bloqueado: false
    }
    setUsuarios([...usuarios, nuevo])
    setFormUsuario({ nombre: '', rut: '', correo: '', pass: 'Patitas2026!', rol: 'Asistente', especialidad: '' })
    notificar('success', `Usuario ${nuevo.nombre} creado con rol ${nuevo.rol} (CU02, RF03).`)
  }

  function alternarEstadoUsuario(idUser) {
    setUsuarios(usuarios.map(u => u.id === idUser ? { ...u, activo: !u.activo } : u))
    notificar('success', 'Estado activo/inactivo del usuario actualizado (RF03).')
  }

  function desbloquearUsuario(idUser) {
    setUsuarios(usuarios.map(u => u.id === idUser ? { ...u, intentos: 0, bloqueado: false } : u))
    notificar('success', 'Cuenta desbloqueada y contador de intentos fallidos reiniciado a 0 (RF04).')
  }

  // Funciones de Tareas RLS en Supabase (Etapa 5 Grupo 5)
  async function agregarTareaRls(e) {
    e.preventDefault()
    if (!tituloTarea.trim()) return
    if (supabaseSession?.user) {
      const { error } = await supabase.from('tareas').insert({
        titulo: tituloTarea,
        descripcion: descTarea,
        estado: estadoTarea,
        responsable: respTarea || supabaseSession.user.email,
        user_id: supabaseSession.user.id
      })
      if (error) {
        notificar('error', 'Error RLS en Supabase: ' + error.message)
      } else {
        setTituloTarea('')
        setDescTarea('')
        cargarTareasSupabase()
        notificar('success', 'Tarea insertada en Supabase PostgreSQL con user_id: sesion.user.id (RLS verificado).')
      }
    } else {
      const nuevaLocal = {
        id: 't-' + Date.now(),
        titulo: tituloTarea,
        descripcion: descTarea,
        estado: estadoTarea,
        responsable: respTarea || usuarioActivo.correo,
        user_id: usuarioActivo.id
      }
      setTareasRls([nuevaLocal, ...tareasRls])
      setTituloTarea('')
      setDescTarea('')
      notificar('success', `Tarea registrada para el usuario ${usuarioActivo.nombre} (asociada a user_id: ${usuarioActivo.id}).`)
    }
  }

  // Cálculos derivados para alertas y KPIs
  const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo)
  const hoyDate = new Date('2026-11-16T00:00:00')
  const productosPorVencer = productos.filter(p => {
    const f = new Date(p.fechaVencimiento + 'T00:00:00')
    const diffDias = (f - hoyDate) / (1000 * 60 * 60 * 24)
    return diffDias <= 30
  })
  const totalIngresos = ventas.reduce((acc, v) => acc + v.total, 0)
  const totalDeudas = ventas.reduce((acc, v) => acc + (v.saldoPendiente || 0), 0)
  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0)

  // ===========================================================================
  // VISTA 0: PANTALLA DE ACCESO (SI NO HAY USUARIO ACTIVO)
  // ===========================================================================
  if (!usuarioActivo) {
    return (
      <div className="login-wrapper">
        <div className="login-grid">
          <div className="login-brand">
            <div>
              <span className="brand-badge">INACAP Sede Arica · Ingeniería de Software (TI3043)</span>
              <h1>Veterinaria "Patitas Felices"</h1>
              <p>
                Sistema Integral de Gestión Clínica, Agenda, Inventario y Control Financiero.
                Prototipo funcional EV03 conectado a <strong>Supabase Auth + PostgreSQL RLS</strong>.
              </p>

              <div className="role-demo-box">
                <h3>Acceso Rápido por Rol (Demostración 4 Roles EV02)</h3>
                <div className="role-demo-buttons">
                  <button type="button" className="btn-role-demo" onClick={() => loginRapidoRol('Administrador')}>
                    1. Administrador
                    <span>Dr. Fernando Soto (Propietario)</span>
                  </button>
                  <button type="button" className="btn-role-demo" onClick={() => loginRapidoRol('Veterinario')}>
                    2. Veterinario
                    <span>Dra. Camila Rojas (Box Clínico)</span>
                  </button>
                  <button type="button" className="btn-role-demo" onClick={() => loginRapidoRol('Recepcionista')}>
                    3. Recepcionista
                    <span>Carla Morales (Mesón y Caja)</span>
                  </button>
                  <button type="button" className="btn-role-demo" onClick={() => loginRapidoRol('Asistente')}>
                    4. Asistente
                    <span>Tomás Araya (Vacunas y Stock)</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="stack-pills">
                <span className="stack-pill">React 19 + Vite</span>
                <span className="stack-pill">Supabase Auth (JWT)</span>
                <span className="stack-pill">PostgreSQL + RLS</span>
                <span className="stack-pill">OWASP ASVS & Top 10</span>
                <span className="stack-pill">Grupo 5: G. Aguayo · D. Quispe</span>
              </div>
            </div>
          </div>

          <div className="login-form-side">
            <h2>Iniciar Sesión</h2>
            <p className="login-subtitle">
              Ingresa con tu cuenta de personal o con las cuentas de prueba de Supabase Auth (<code>alumno1@prueba.cl</code>).
            </p>

            {alertaGlobal && (
              <div className={`alert-box alert-${alertaGlobal.tipo === 'error' ? 'error' : alertaGlobal.tipo === 'warning' ? 'warning' : 'success'}`}>
                {alertaGlobal.texto}
              </div>
            )}

            <form onSubmit={manejarLogin}>
              <div className="form-group">
                <label>Correo electrónico institucional o Supabase Auth</label>
                <input
                  type="email"
                  className="form-control"
                  value={correoLogin}
                  onChange={(e) => setCorreoLogin(e.target.value)}
                  placeholder="Ej: admin@patitasfelices.cl o alumno1@prueba.cl"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={passLogin}
                  onChange={(e) => setPassLogin(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>

              <button type="submit" className="btn-primary-vet" style={{ width: '100%', marginBottom: '10px' }}>
                Ingresar al Sistema
              </button>

              <button
                type="button"
                className="btn-outline-vet"
                style={{ width: '100%' }}
                onClick={simularBloqueoRF04}
              >
                Probar Bloqueo de Seguridad tras 3 Intentos Fallidos (RF04 / OWASP)
              </button>
            </form>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#475569', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <strong>Credenciales de prueba EV02/EV03:</strong><br />
              • Admin: <code>admin@patitasfelices.cl</code> / <code>Admin2026!</code><br />
              • Veterinario: <code>veterinario@patitasfelices.cl</code> / <code>Vet2026!</code><br />
              • Recepcionista: <code>recepcion@patitasfelices.cl</code> / <code>Recep2026!</code><br />
              • Asistente: <code>asistente@patitasfelices.cl</code> / <code>Asist2026!</code>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const permisosRol = ROLES_PERMISOS[usuarioActivo.rol] || ROLES_PERMISOS.Administrador
  const mascotaActivaObj = mascotas.find(m => m.id === mascotaFichaSel) || mascotas[0]
  const clienteMascotaActiva = clientes.find(c => c.id === mascotaActivaObj?.clienteId)

  const MENU_ITEMS = [
    { id: 'dashboard', label: '1. Panel General Clínica', badge: 'KPIs' },
    { id: 'clientes', label: '2. Clientes y Mascotas', badge: `${mascotas.length}` },
    { id: 'citas', label: '3. Agenda y Urgencias', badge: `${citas.filter(c => c.estado !== 'Cancelada').length}` },
    { id: 'fichas', label: '4. Fichas Clínicas y Vacunas', badge: 'CU07-09' },
    { id: 'recordatorios', label: '5. Recordatorios Auto', badge: `${recordatorios.length}` },
    { id: 'inventario', label: '6. Inventario y Alertas', badge: `${productosStockBajo.length + productosPorVencer.length} alertas` },
    { id: 'finanzas', label: '7. Ventas, Cobros y Gastos', badge: 'Caja' },
    { id: 'reportes', label: '8. Reportes Exportables', badge: 'PDF/CSV' },
    { id: 'usuarios', label: '9. Usuarios y Roles (RBAC)', badge: '8 trab.' },
    { id: 'tareas_rls', label: '10. Mis Tareas (Supabase RLS)', badge: 'Etapa 5' }
  ]

  return (
    <div className="app-shell">
      {/* BARRA LATERAL CON CONTROL DE ACCESO POR ROL */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <h2>Patitas Felices</h2>
            <span>Clínica Veterinaria · Sede Arica</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.07)', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Sesión Activa</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>{usuarioActivo.nombre}</div>
            <div style={{ marginTop: '6px' }}>
              <span className="tag" style={{ background: permisosRol.badgeBg, color: permisosRol.color }}>
                Rol: {usuarioActivo.rol}
              </span>
            </div>
          </div>

          <nav className="nav-menu">
            {MENU_ITEMS.map(item => {
              const habilitado = permisosRol.modulos.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-btn ${moduloActual === item.id ? 'active' : ''} ${!habilitado ? 'disabled-role' : ''}`}
                  onClick={() => {
                    if (!habilitado) {
                      notificar('error', `RESTRICCIÓN DE ROL (RF02 / OWASP A01): El rol "${usuarioActivo.rol}" no tiene autorización para acceder al módulo "${item.label}".`)
                      return
                    }
                    setModuloActual(item.id)
                  }}
                >
                  <span>{item.label}</span>
                  <span className="nav-badge">{habilitado ? item.badge : '🔒 Rol'}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div>Supabase: <strong>lgfsicqrpfqfeqjdrgoe</strong></div>
          <div>Protección: <strong>RLS + JWT + Ley 21.719</strong></div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Sistema de Gestión Clínica y Operativa "Veterinaria Patitas Felices"</h1>
            <p>{permisosRol.descripcion}</p>
          </div>

          <div className="topbar-right">
            <span className={`status-pill ${modoOffline ? 'status-offline' : 'status-online'}`} onClick={() => setModoOffline(!modoOffline)} style={{ cursor: 'pointer' }} title="Haz clic para simular caída/recuperación de internet (RNF04)">
              {modoOffline ? '⚡ Modo Sin Conexión Activo (Caché Local RNF04)' : '🟢 Supabase Cloud + RLS Sincronizado'}
            </span>

            <div className="role-switcher-bar">
              <strong>Cambiar Rol (Demo):</strong>
              <select value={usuarioActivo.rol} onChange={(e) => cambiarRolEnVivo(e.target.value)}>
                <option value="Administrador">Administrador (Acceso Total)</option>
                <option value="Veterinario">Veterinario (Clínica y Fichas)</option>
                <option value="Recepcionista">Recepcionista (Citas y Caja)</option>
                <option value="Asistente">Asistente (Vacunas y Stock)</option>
              </select>
            </div>

            <button type="button" className="btn-danger-vet" onClick={cerrarSesionCompleta}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="content-body">
          {alertaGlobal && (
            <div className={`alert-box alert-${alertaGlobal.tipo === 'error' ? 'error' : alertaGlobal.tipo === 'warning' ? 'warning' : 'success'}`}>
              {alertaGlobal.texto}
            </div>
          )}

          {/* ===============================================================
              MÓDULO 1: DASHBOARD GENERAL
              =============================================================== */}
          {moduloActual === 'dashboard' && (
            <div>
              <div className="kpi-grid">
                <div className="kpi-card urgent">
                  <div className="kpi-title">Citas y Urgencias Hoy</div>
                  <div className="kpi-value">{citas.filter(c => c.estado !== 'Cancelada').length}</div>
                  <div className="kpi-sub">{citas.filter(c => c.esUrgencia).length} urgencia(s) con prioridad alta (RF21)</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Fichas Clínicas Digitales</div>
                  <div className="kpi-value">{mascotas.length}</div>
                  <div className="kpi-sub">{clientes.length} tutores registrados en Arica (RF16)</div>
                </div>
                <div className="kpi-card warn">
                  <div className="kpi-title">Alertas de Farmacia</div>
                  <div className="kpi-value">{productosStockBajo.length + productosPorVencer.length}</div>
                  <div className="kpi-sub">{productosStockBajo.length} stock crítico (RF28) · {productosPorVencer.length} por vencer (RF29)</div>
                </div>
                <div className="kpi-card finance">
                  <div className="kpi-title">Ingresos Registrados</div>
                  <div className="kpi-value">${totalIngresos.toLocaleString('es-CL')}</div>
                  <div className="kpi-sub">Deudas por cobrar: ${totalDeudas.toLocaleString('es-CL')} (RF32)</div>
                </div>
              </div>

              <div className="panel-grid-2">
                <div className="card-panel">
                  <h3>
                    <span>Agenda Prioritaria de Hoy (16 Nov 2026)</span>
                    <span className="tag tag-teal">CU06 · RF14 · RF21</span>
                  </h3>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Hora</th>
                          <th>Paciente</th>
                          <th>Servicio / Motivo</th>
                          <th>Veterinario</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citas.slice(0, 5).map(c => {
                          const m = mascotas.find(x => x.id === c.mascotaId)
                          return (
                            <tr key={c.id}>
                              <td><strong>{c.hora}</strong></td>
                              <td>
                                <strong>{m?.nombre}</strong> ({m?.especie})
                                {c.esUrgencia && <span className="tag tag-red" style={{ marginLeft: '6px' }}>URGENCIA</span>}
                              </td>
                              <td>{c.servicio}</td>
                              <td>{c.veterinario}</td>
                              <td>
                                <span className={`tag ${c.estado === 'Atendida' ? 'tag-green' : c.estado === 'En espera' ? 'tag-red' : 'tag-amber'}`}>
                                  {c.estado}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card-panel">
                  <h3>
                    <span>Alertas Activas de Stock y Vencimiento (CU14)</span>
                    <span className="tag tag-red">RF28 · RF29</span>
                  </h3>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Stock</th>
                          <th>Vencimiento</th>
                          <th>Tipo de Alerta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productos.filter(p => p.stock <= p.stockMinimo || productosPorVencer.some(v => v.id === p.id)).map(p => (
                          <tr key={p.id}>
                            <td><strong>{p.nombre}</strong><br /><small>{p.sku}</small></td>
                            <td><strong>{p.stock} u.</strong> (Mín: {p.stockMinimo})</td>
                            <td>{p.fechaVencimiento}</td>
                            <td>
                              {p.stock <= p.stockMinimo && <span className="tag tag-red" style={{ marginRight: '4px' }}>Stock Bajo (RF28)</span>}
                              {productosPorVencer.some(v => v.id === p.id) && <span className="tag tag-amber">Próx. a Vencer (RF29)</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card-panel">
                <h3>
                  <span>Matriz de Permisos y Restricciones por Rol en el Prototipo (Actividad 2 EV03)</span>
                  <span className="tag tag-blue">RBAC + Supabase RLS</span>
                </h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rol del Sistema</th>
                        <th>Dotación (EV02)</th>
                        <th>Módulos Habilitados</th>
                        <th>Restricciones de Seguridad Aplicadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Administrador</strong></td>
                        <td>1 (Propietario)</td>
                        <td>Todos los módulos (Usuarios, Clientes, Citas, Fichas, Recordatorios, Inventario, Finanzas, Reportes, Tareas RLS)</td>
                        <td>Único rol autorizado para crear/desactivar cuentas (RF03), gestionar catálogo (RF25), registrar gastos (RF33) y exportar reportes (RF34).</td>
                      </tr>
                      <tr>
                        <td><strong>Veterinario</strong></td>
                        <td>3 profesionales</td>
                        <td>Panel General, Clientes/Mascotas, Agenda, Fichas Clínicas/Vacunas, Consulta Inventario, Tareas RLS</td>
                        <td>Bloqueado para administrar usuarios, registrar cobros de caja, ingresar gastos a proveedores o exportar balances financieros.</td>
                      </tr>
                      <tr>
                        <td><strong>Recepcionista</strong></td>
                        <td>1 administrativo</td>
                        <td>Panel General, Clientes/Mascotas, Agenda de Citas, Recordatorios Automáticos, Ventas y Cobros, Tareas RLS</td>
                        <td>Bloqueado para alterar diagnósticos/tratamientos en Fichas Clínicas (Ley 21.719), administrar inventario o gestionar usuarios.</td>
                      </tr>
                      <tr>
                        <td><strong>Asistente</strong></td>
                        <td>3 asistentes</td>
                        <td>Panel General, Consulta Agenda, Consulta Fichas y Vacunación/Urgencias, Movimientos de Stock, Tareas RLS</td>
                        <td>Bloqueado para cobros de caja, gastos a proveedores, reportes gerenciales y administración de cuentas de usuario.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              MÓDULO 2: CLIENTES Y MASCOTAS (CU03 | RF05-RF09, RF16, RNF03)
              =============================================================== */}
          {moduloActual === 'clientes' && (
            <div>
              <div className="card-panel">
                <h3>
                  <span>Buscador Rápido de Clientes y Mascotas (&lt; 3 segundos – RNF03)</span>
                  <span className="tag tag-teal">RF07 · RNF01 · RNF03</span>
                </h3>
                <input
                  type="text"
                  className="form-control"
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  placeholder="Buscar instantáneamente por nombre del tutor, RUT, teléfono o nombre/ficha de mascota..."
                />
              </div>

              <div className="panel-grid-2">
                <div className="card-panel">
                  <h3>
                    <span>{formCliente.id ? 'Editar Cliente (RF08)' : 'Registrar Nuevo Cliente (RF05)'}</span>
                    <span className="tag tag-blue">CU03</span>
                  </h3>
                  <form onSubmit={guardarCliente}>
                    <div className="form-group">
                      <label>RUT del Cliente</label>
                      <input className="form-control" value={formCliente.rut} onChange={e => setFormCliente({ ...formCliente, rut: e.target.value })} placeholder="Ej: 16.432.110-8" required />
                    </div>
                    <div className="form-group">
                      <label>Nombre Completo</label>
                      <input className="form-control" value={formCliente.nombre} onChange={e => setFormCliente({ ...formCliente, nombre: e.target.value })} placeholder="Nombre y Apellidos" required />
                    </div>
                    <div className="form-group">
                      <label>Teléfono Móvil (WhatsApp Recordatorios)</label>
                      <input className="form-control" value={formCliente.telefono} onChange={e => setFormCliente({ ...formCliente, telefono: e.target.value })} placeholder="+56987654321" required />
                    </div>
                    <div className="form-group">
                      <label>Correo Electrónico y Dirección en Arica</label>
                      <input className="form-control" value={formCliente.direccion} onChange={e => setFormCliente({ ...formCliente, direccion: e.target.value })} placeholder="Av. 18 de Septiembre #1230, Arica" />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" className="btn-primary-vet">{formCliente.id ? 'Guardar Cambios (RF08)' : 'Registrar Cliente (RF05)'}</button>
                      {formCliente.id && (
                        <button type="button" className="btn-secondary-vet" onClick={() => setFormCliente({ id: '', rut: '', nombre: '', telefono: '', correo: '', direccion: '' })}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="card-panel">
                  <h3>
                    <span>Vincular Mascota y Abrir Ficha Digital (RF06, RF09, RF16)</span>
                    <span className="tag tag-teal">Multi-Mascota</span>
                  </h3>
                  <form onSubmit={guardarMascota}>
                    <div className="form-group">
                      <label>Cliente Titular (Permite varias mascotas por cliente - RF09)</label>
                      <select className="form-control" value={formMascota.clienteId} onChange={e => setFormMascota({ ...formMascota, clienteId: e.target.value })}>
                        {clientes.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre} ({c.rut})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label>Nombre de la Mascota</label>
                        <input className="form-control" value={formMascota.nombre} onChange={e => setFormMascota({ ...formMascota, nombre: e.target.value })} placeholder="Ej: Toby" required />
                      </div>
                      <div className="form-group">
                        <label>Especie</label>
                        <select className="form-control" value={formMascota.especie} onChange={e => setFormMascota({ ...formMascota, especie: e.target.value })}>
                          <option value="Perro">Perro</option>
                          <option value="Gato">Gato</option>
                          <option value="Conejo">Conejo</option>
                          <option value="Ave">Ave</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label>Raza</label>
                        <input className="form-control" value={formMascota.raza} onChange={e => setFormMascota({ ...formMascota, raza: e.target.value })} placeholder="Ej: Labrador" />
                      </div>
                      <div className="form-group">
                        <label>Sexo</label>
                        <select className="form-control" value={formMascota.sexo} onChange={e => setFormMascota({ ...formMascota, sexo: e.target.value })}>
                          <option value="Macho">Macho</option>
                          <option value="Hembra">Hembra</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Peso (kg)</label>
                        <input type="number" step="0.1" className="form-control" value={formMascota.peso} onChange={e => setFormMascota({ ...formMascota, peso: e.target.value })} placeholder="12.5" required />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary-vet">Registrar Mascota y Generar Ficha Clínica (RF16)</button>
                  </form>
                </div>
              </div>

              <div className="card-panel">
                <h3>Directorio de Clientes y sus Mascotas Asociadas</h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>RUT / Cliente</th>
                        <th>Teléfono / Dirección</th>
                        <th>Mascotas Asociadas y Código de Ficha (RF09, RF16)</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.filter(c => {
                        const q = busquedaCliente.toLowerCase()
                        if (!q) return true
                        const mascotasCli = mascotas.filter(m => m.clienteId === c.id)
                        return c.nombre.toLowerCase().includes(q) ||
                               c.rut.toLowerCase().includes(q) ||
                               c.telefono.toLowerCase().includes(q) ||
                               mascotasCli.some(m => m.nombre.toLowerCase().includes(q) || m.fichaCodigo.toLowerCase().includes(q))
                      }).map(c => {
                        const mascotasCli = mascotas.filter(m => m.clienteId === c.id)
                        return (
                          <tr key={c.id}>
                            <td><strong>{c.nombre}</strong><br /><span className="tag tag-blue">{c.rut}</span></td>
                            <td>{c.telefono}<br /><small>{c.direccion}</small></td>
                            <td>
                              {mascotasCli.map(m => (
                                <div key={m.id} style={{ marginBottom: '4px' }}>
                                  <span className="tag tag-teal">{m.fichaCodigo}</span> <strong>{m.nombre}</strong> ({m.especie} · {m.raza} · {m.peso} kg)
                                </div>
                              ))}
                            </td>
                            <td>
                              <button type="button" className="btn-outline-vet" onClick={() => setFormCliente(c)}>
                                Editar (RF08)
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              MÓDULO 3: AGENDA DE CITAS Y URGENCIAS (CU04, CU05, CU06, CU11)
              =============================================================== */}
          {moduloActual === 'citas' && (
            <div className="panel-grid-sidebar">
              <div className="card-panel">
                <h3>
                  <span>Agendar Cita / Urgencia</span>
                  <span className="tag tag-teal">CU04 · CU11</span>
                </h3>
                <form onSubmit={guardarCita}>
                  <div className="form-group">
                    <label>Paciente (Mascota y Tutor)</label>
                    <select className="form-control" value={formCita.mascotaId} onChange={e => setFormCita({ ...formCita, mascotaId: e.target.value })}>
                      {mascotas.map(m => {
                        const cli = clientes.find(c => c.id === m.clienteId)
                        return <option key={m.id} value={m.id}>{m.nombre} ({m.fichaCodigo}) - Tutor: {cli?.nombre}</option>
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Médico Veterinario Asignado</label>
                    <select className="form-control" value={formCita.veterinario} onChange={e => setFormCita({ ...formCita, veterinario: e.target.value })}>
                      <option value="Dra. Camila Rojas">Dra. Camila Rojas (Medicina Interna)</option>
                      <option value="Dr. Martín Vega">Dr. Martín Vega (Dermatología y Exóticos)</option>
                      <option value="Dra. Valentina Ríos">Dra. Valentina Ríos (Preventiva y Felinos)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label>Fecha</label>
                      <input type="date" className="form-control" value={formCita.fecha} onChange={e => setFormCita({ ...formCita, fecha: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Hora seleccionada</label>
                      <select className="form-control" value={formCita.hora} onChange={e => setFormCita({ ...formCita, hora: e.target.value })}>
                        {HORARIOS_BASE.map(h => <option key={h} value={h}>{h} hrs</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Horarios Disponibles para {formCita.veterinario} (RF12):</label>
                    <div className="slot-grid">
                      {HORARIOS_BASE.map(h => {
                        const ocupado = citas.some(c => c.fecha === formCita.fecha && c.hora === h && c.veterinario === formCita.veterinario && c.estado !== 'Cancelada')
                        return (
                          <span
                            key={h}
                            className={`slot-chip ${ocupado ? 'slot-busy' : 'slot-free'}`}
                            onClick={() => !ocupado && setFormCita({ ...formCita, hora: h })}
                          >
                            {h} {ocupado ? 'Ocupado' : 'Libre'}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Servicio Requerido</label>
                    <select className="form-control" value={formCita.servicio} onChange={e => setFormCita({ ...formCita, servicio: e.target.value })}>
                      <option value="Consulta General">Consulta General</option>
                      <option value="Vacunación / Control Sano">Vacunación / Control Sano</option>
                      <option value="Desparasitación Interna/Externa">Desparasitación Interna/Externa</option>
                      <option value="Control Dermatológico">Control Dermatológico</option>
                      <option value="Cirugía Menor / Procedimiento">Cirugía Menor / Procedimiento</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ background: '#FDECEF', padding: '10px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#991B1B', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formCita.esUrgencia} onChange={e => setFormCita({ ...formCita, esUrgencia: e.target.checked })} style={{ width: 'auto', margin: 0 }} />
                      🚨 Ingresar como Atención de Urgencia Prioritaria (CU11 / RF21)
                    </label>
                  </div>

                  <button type="submit" className={formCita.esUrgencia ? 'btn-danger-vet' : 'btn-primary-vet'} style={{ width: '100%' }}>
                    {formCita.esUrgencia ? 'Registrar Urgencia con Prioridad Inmediata (RF21)' : 'Confirmar y Agendar Cita (RF10, RF11)'}
                  </button>
                </form>
              </div>

              <div className="card-panel">
                <h3>
                  <span>Agenda {vistaAgenda === 'diaria' ? 'Diaria' : 'Semanal'} Consolidada por Veterinario (RF14)</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-outline-vet" onClick={() => setVistaAgenda(vistaAgenda === 'diaria' ? 'semanal' : 'diaria')}>
                      Cambiar a Vista {vistaAgenda === 'diaria' ? 'Semanal' : 'Diaria'}
                    </button>
                  </div>
                </h3>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <select className="form-control" style={{ maxWidth: '260px' }} value={filtroVetCita} onChange={e => setFiltroVetCita(e.target.value)}>
                    <option value="Todos">Todos los Veterinarios (3)</option>
                    <option value="Dra. Camila Rojas">Dra. Camila Rojas</option>
                    <option value="Dr. Martín Vega">Dr. Martín Vega</option>
                    <option value="Dra. Valentina Ríos">Dra. Valentina Ríos</option>
                  </select>
                  {vistaAgenda === 'diaria' && (
                    <input type="date" className="form-control" style={{ maxWidth: '180px' }} value={filtroFechaCita} onChange={e => setFiltroFechaCita(e.target.value)} />
                  )}
                </div>

                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha / Hora</th>
                        <th>Mascota / Ficha</th>
                        <th>Servicio</th>
                        <th>Veterinario</th>
                        <th>Estado (RF15)</th>
                        <th>Acciones (CU05 / RF13)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.filter(c => {
                        if (filtroVetCita !== 'Todos' && c.veterinario !== filtroVetCita) return false
                        if (vistaAgenda === 'diaria' && c.fecha !== filtroFechaCita) return false
                        return true
                      }).map(c => {
                        const m = mascotas.find(x => x.id === c.mascotaId)
                        return (
                          <tr key={c.id}>
                            <td><strong>{c.fecha}</strong><br />{c.hora} hrs</td>
                            <td>
                              <strong>{m?.nombre}</strong> ({m?.fichaCodigo})
                              {c.esUrgencia && <span className="tag tag-red" style={{ display: 'block', marginTop: '3px' }}>🚨 Prioridad Urgencia</span>}
                            </td>
                            <td>{c.servicio}</td>
                            <td>{c.veterinario}</td>
                            <td>
                              <span className={`tag ${c.estado === 'Atendida' ? 'tag-green' : c.estado === 'Cancelada' ? 'tag-red' : 'tag-amber'}`}>
                                {c.estado}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button type="button" className="btn-outline-vet" onClick={() => reprogramarCita(c)}>Reprogramar</button>
                                {c.estado !== 'Cancelada' && (
                                  <button type="button" className="btn-danger-vet" onClick={() => cambiarEstadoCita(c.id, 'Cancelada')}>Cancelar</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              MÓDULO 4: FICHAS CLÍNICAS Y VACUNAS (CU07, CU08, CU09 | RF16-RF20)
              =============================================================== */}
          {moduloActual === 'fichas' && (
            <div>
              <div className="card-panel">
                <h3>
                  <span>Seleccionar Ficha Clínica Digital de Mascota (CU08 · RF16 · RF18)</span>
                  <span className="tag tag-teal">Búsqueda &lt; 1 seg</span>
                </h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select className="form-control" style={{ maxWidth: '420px' }} value={mascotaFichaSel} onChange={e => setMascotaFichaSel(e.target.value)}>
                    {mascotas.map(m => {
                      const cli = clientes.find(c => c.id === m.clienteId)
                      return <option key={m.id} value={m.id}>{m.fichaCodigo} — {m.nombre} ({m.especie} · {m.raza}) — Tutor: {cli?.nombre}</option>
                    })}
                  </select>
                  {mascotaActivaObj && (
                    <div style={{ fontSize: '13.5px', color: '#1E293B' }}>
                      <strong>Sexo:</strong> {mascotaActivaObj.sexo} | <strong>Peso actual:</strong> {mascotaActivaObj.peso} kg | <strong>Alergias/Alertas:</strong> <span className="tag tag-red">{mascotaActivaObj.alergias}</span> | <strong>Tutor:</strong> {clienteMascotaActiva?.nombre} ({clienteMascotaActiva?.telefono})
                    </div>
                  )}
                </div>
              </div>

              <div className="panel-grid-2">
                {/* Registrar Atención Clínica (CU07) */}
                <div className="card-panel">
                  <h3>
                    <span>Registrar Atención Clínica (CU07 · RF17)</span>
                    <span className="tag tag-blue">{permisosRol.puedeRegistrarAtencion ? 'Veterinario Habilitado' : 'Solo Lectura para Asistente'}</span>
                  </h3>
                  {permisosRol.puedeRegistrarAtencion ? (
                    <form onSubmit={guardarAtencionClinica}>
                      <div className="form-group">
                        <label>Motivo de Consulta / Anamnesis</label>
                        <input className="form-control" value={formAtencion.motivo} onChange={e => setFormAtencion({ ...formAtencion, motivo: e.target.value })} placeholder="Ej: Decaimiento, control post-operatorio, otitis..." required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                          <label>Peso (kg)</label>
                          <input type="number" step="0.1" className="form-control" value={formAtencion.pesoKg} onChange={e => setFormAtencion({ ...formAtencion, pesoKg: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Temp (°C)</label>
                          <input type="number" step="0.1" className="form-control" value={formAtencion.temperaturaC} onChange={e => setFormAtencion({ ...formAtencion, temperaturaC: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Estado Registro</label>
                          <select className="form-control" value={formAtencion.estadoRegistro} onChange={e => setFormAtencion({ ...formAtencion, estadoRegistro: e.target.value })}>
                            <option value="Finalizada">Finalizada (Cierra Cita)</option>
                            <option value="Borrador">Guardar Borrador (CU07)</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Diagnóstico Clínico</label>
                        <input className="form-control" value={formAtencion.diagnostico} onChange={e => setFormAtencion({ ...formAtencion, diagnostico: e.target.value })} placeholder="Diagnóstico presuntivo o definitivo" required />
                      </div>
                      <div className="form-group">
                        <label>Tratamiento / Prescripción y Observaciones</label>
                        <input className="form-control" value={formAtencion.tratamiento} onChange={e => setFormAtencion({ ...formAtencion, tratamiento: e.target.value })} placeholder="Fármacos, dosis, posología y cuidados" required />
                      </div>
                      <button type="submit" className="btn-primary-vet">Guardar Atención en Ficha Clínica (RF17)</button>
                    </form>
                  ) : (
                    <div className="alert-box alert-warning">
                      Tu rol actual ({usuarioActivo.rol}) puede consultar el historial clínico y registrar vacunaciones/desparasitaciones (CU08, CU09), pero el diagnóstico médico formal es exclusivo del rol Veterinario.
                    </div>
                  )}
                </div>

                {/* Registrar Vacunación y Desparasitación (CU09) */}
                <div className="card-panel">
                  <h3>
                    <span>Registrar Vacuna o Desparasitación (CU09 · RF19 · RF20)</span>
                    <span className="tag tag-green">Descuenta Stock (RF26)</span>
                  </h3>
                  <form onSubmit={guardarVacunacion}>
                    <div className="form-group">
                      <label>Tipo de Procedimiento Preventivo</label>
                      <select className="form-control" value={formVacuna.tipo} onChange={e => setFormVacuna({ ...formVacuna, tipo: e.target.value })}>
                        <option value="Vacuna">Vacuna (+1 año próximo refuerzo automático)</option>
                        <option value="Desparasitación">Desparasitación (+3 meses próximo control automático)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Producto Utilizado del Inventario (Descuenta 1 unidad - RF26)</label>
                      <select className="form-control" value={formVacuna.productoId} onChange={e => setFormVacuna({ ...formVacuna, productoId: e.target.value })}>
                        {productos.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre} (Stock actual: {p.stock} u. · Lote: {p.lote})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label>Fecha de Aplicación</label>
                        <input type="date" className="form-control" value={formVacuna.fechaAplicacion} onChange={e => setFormVacuna({ ...formVacuna, fechaAplicacion: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>N° de Lote</label>
                        <input className="form-control" value={formVacuna.lote} onChange={e => setFormVacuna({ ...formVacuna, lote: e.target.value })} placeholder="Ej: NBV-8841A" required />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary-vet">Registrar Procedimiento y Calcular Próximo Refuerzo (RF20)</button>
                  </form>
                </div>
              </div>

              <div className="panel-grid-2">
                <div className="card-panel">
                  <h3>Historial de Atenciones Clínicas de {mascotaActivaObj?.nombre} (RF18)</h3>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fecha / Vet</th>
                          <th>Motivo y Signos</th>
                          <th>Diagnóstico y Tratamiento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atenciones.filter(a => a.mascotaId === mascotaFichaSel).map(a => (
                          <tr key={a.id}>
                            <td><strong>{a.fecha}</strong><br /><small>{a.veterinario}</small><br /><span className="tag tag-green">{a.estadoRegistro}</span></td>
                            <td>{a.motivo}<br /><small>Peso: {a.pesoKg} kg · T°: {a.temperaturaC} °C</small></td>
                            <td><strong>Dx:</strong> {a.diagnostico}<br /><strong>Tx:</strong> {a.tratamiento}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card-panel">
                  <h3>Carnet de Vacunas y Próximos Refuerzos de {mascotaActivaObj?.nombre} (RF19, RF20)</h3>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Tipo / Producto</th>
                          <th>Aplicación / Lote</th>
                          <th>Próximo Refuerzo (RF20)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vacunas.filter(v => v.mascotaId === mascotaFichaSel).map(v => (
                          <tr key={v.id}>
                            <td><span className="tag tag-teal">{v.tipo}</span><br /><strong>{v.productoNombre}</strong></td>
                            <td>{v.fechaAplicacion}<br /><small>Lote: {v.lote}</small></td>
                            <td><span className="tag tag-amber">📅 {v.proximoRefuerzo}</span><br /><small>{v.responsable}</small></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              MÓDULO 5: RECORDATORIOS AUTOMÁTICOS (CU10 | RF22-RF24)
              =============================================================== */}
          {moduloActual === 'recordatorios' && (
            <div>
              <div className="card-panel">
                <h3>
                  <span>Motor de Recordatorios Automáticos a Clientes (CU10 · RF22 · RF23 · RF24)</span>
                  <button type="button" className="btn-primary-vet" onClick={ejecutarBarridoRecordatorios}>
                    ⚡ Ejecutar Barrido Diario de Recordatorios Ahora
                  </button>
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#475569' }}>
                  Revisa automáticamente las fechas próximas de vacunas, controles pendientes (RF22) y citas a 24 horas (RF23), registrando tanto los envíos exitosos como los fallidos por contacto inválido (RF24).
                </p>
              </div>

              <div className="card-panel">
                <h3>Bitácora de Auditoría de Recordatorios Enviados y No Entregados (RF24)</h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cliente / Contacto</th>
                        <th>Mascota</th>
                        <th>Tipo</th>
                        <th>Mensaje Generado</th>
                        <th>Estado de Entrega (RF24)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recordatorios.map(r => (
                        <tr key={r.id}>
                          <td>{r.fechaEnvio}</td>
                          <td><strong>{r.clienteNombre}</strong><br /><code>{r.contacto}</code></td>
                          <td>{r.mascotaNombre}</td>
                          <td><span className="tag tag-blue">{r.tipo}</span></td>
                          <td>{r.mensaje}</td>
                          <td>
                            <span className={`tag ${r.estadoEntrega === 'Entregado' ? 'tag-green' : 'tag-red'}`}>
                              {r.estadoEntrega}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              MÓDULO 6: INVENTARIO, KARDEX Y ALERTAS (CU12, CU13, CU14 | RF25-RF30)
              =============================================================== */}
          {moduloActual === 'inventario' && (
            <div>
              <div className="panel-grid-2">
                <div className="card-panel">
                  <h3>
                    <span>Catalogar Nuevo Producto (CU12 · RF25)</span>
                    <span className="tag tag-red">Solo Administrador</span>
                  </h3>
                  {permisosRol.puedeGestionarCatalogo ? (
                    <form onSubmit={guardarProducto}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                          <label>Código SKU</label>
                          <input className="form-control" value={formProducto.sku} onChange={e => setFormProducto({ ...formProducto, sku: e.target.value })} placeholder="Ej: FAR-AMX-007" required />
                        </div>
                        <div className="form-group">
                          <label>Categoría</label>
                          <select className="form-control" value={formProducto.categoria} onChange={e => setFormProducto({ ...formProducto, categoria: e.target.value })}>
                            <option value="Vacunas">Vacunas</option>
                            <option value="Medicamentos">Medicamentos</option>
                            <option value="Antiparasitarios">Antiparasitarios</option>
                            <option value="Alimentos">Alimentos</option>
                            <option value="Insumos">Insumos Clínicos</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Nombre del Producto</label>
                        <input className="form-control" value={formProducto.nombre} onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })} placeholder="Nombre comercial y presentación" required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                        <div className="form-group">
                          <label>Stock Inicial</label>
                          <input type="number" className="form-control" value={formProducto.stock} onChange={e => setFormProducto({ ...formProducto, stock: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label>Stock Mínimo</label>
                          <input type="number" className="form-control" value={formProducto.stockMinimo} onChange={e => setFormProducto({ ...formProducto, stockMinimo: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label>Precio ($)</label>
                          <input type="number" className="form-control" value={formProducto.precio} onChange={e => setFormProducto({ ...formProducto, precio: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label>Vencimiento</label>
                          <input type="date" className="form-control" value={formProducto.fechaVencimiento} onChange={e => setFormProducto({ ...formProducto, fechaVencimiento: e.target.value })} required />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary-vet">Guardar Producto en Catálogo (RF25)</button>
                    </form>
                  ) : (
                    <div className="alert-box alert-warning">
                      El alta de nuevos productos en el catálogo (CU12) está reservada al Administrador.
                    </div>
                  )}
                </div>

                <div className="card-panel">
                  <h3>
                    <span>Registrar Entrada / Salida Manual de Stock (CU13 · RF27)</span>
                    <span className="tag tag-amber">Admin y Asistente</span>
                  </h3>
                  {permisosRol.puedeMoverStock ? (
                    <form onSubmit={registrarMovimientoManual}>
                      <div className="form-group">
                        <label>Producto</label>
                        <select className="form-control" value={formMovStock.productoId} onChange={e => setFormMovStock({ ...formMovStock, productoId: e.target.value })}>
                          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock} u.)</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                          <label>Tipo de Movimiento</label>
                          <select className="form-control" value={formMovStock.tipo} onChange={e => setFormMovStock({ ...formMovStock, tipo: e.target.value })}>
                            <option value="Entrada">Entrada (Compra / Reposición)</option>
                            <option value="Salida">Salida (Uso Interno / Merma)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Cantidad de Unidades</label>
                          <input type="number" min="1" className="form-control" value={formMovStock.cantidad} onChange={e => setFormMovStock({ ...formMovStock, cantidad: e.target.value })} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Motivo / Respaldo del Movimiento</label>
                        <input className="form-control" value={formMovStock.motivo} onChange={e => setFormMovStock({ ...formMovStock, motivo: e.target.value })} required />
                      </div>
                      <button type="submit" className="btn-primary-vet">Registrar Movimiento y Actualizar Kardex (RF27, RF30)</button>
                    </form>
                  ) : (
                    <div className="alert-box alert-warning">
                      Modo consulta de stock para Veterinario. Los ajustes manuales de bodega los realiza el Administrador o Asistente (CU13).
                    </div>
                  )}
                </div>
              </div>

              <div className="card-panel">
                <h3>Catálogo de Productos y Estado de Alertas (RF25, RF28, RF29)</h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Producto / Categoría</th>
                        <th>Stock Actual</th>
                        <th>Stock Mínimo</th>
                        <th>Precio Venta</th>
                        <th>Vencimiento</th>
                        <th>Estado / Alertas (CU14)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map(p => {
                        const bajo = p.stock <= p.stockMinimo
                        const porVencer = productosPorVencer.some(x => x.id === p.id)
                        return (
                          <tr key={p.id}>
                            <td><code>{p.sku}</code></td>
                            <td><strong>{p.nombre}</strong><br /><small>{p.categoria}</small></td>
                            <td><strong>{p.stock} u.</strong></td>
                            <td>{p.stockMinimo} u.</td>
                            <td>${p.precio.toLocaleString('es-CL')}</td>
                            <td>{p.fechaVencimiento}</td>
                            <td>
                              {bajo && <span className="tag tag-red" style={{ marginRight: '4px' }}>⚠️ Stock Bajo (RF28)</span>}
                              {porVencer && <span className="tag tag-amber">⏳ Próx. Vencer (RF29)</span>}
                              {!bajo && !porVencer && <span className="tag tag-green">Óptimo</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card-panel">
                <h3>Historial de Movimientos de Stock – Kardex de Trazabilidad (RF30)</h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Motivo</th>
                        <th>Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.map(mv => (
                        <tr key={mv.id}>
                          <td>{mv.fecha}</td>
                          <td><strong>{mv.productoNombre}</strong></td>
                          <td><span className={`tag ${mv.tipo === 'Entrada' ? 'tag-green' : 'tag-amber'}`}>{mv.tipo}</span></td>
                          <td><strong>{mv.cantidad} u.</strong></td>
                          <td>{mv.motivo}</td>
                          <td>{mv.responsable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              MÓDULO 7: VENTAS, COBROS Y GASTOS (CU15, CU16 | RF31-RF33)
              =============================================================== */}
          {moduloActual === 'finanzas' && (
            <div>
              <div className="panel-grid-2">
                <div className="card-panel">
                  <h3>
                    <span>Registrar Venta y Cobro en Recepción (CU15 · RF31 · RF32)</span>
                    <span className="tag tag-blue">Cálculo Automático</span>
                  </h3>
                  <form onSubmit={registrarVentaCobro}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label>Cliente</label>
                        <select className="form-control" value={formVenta.clienteId} onChange={e => setFormVenta({ ...formVenta, clienteId: e.target.value })}>
                          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Mascota Atendida</label>
                        <select className="form-control" value={formVenta.mascotaId} onChange={e => setFormVenta({ ...formVenta, mascotaId: e.target.value })}>
                          {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.fichaCodigo})</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Servicio Clínico Realizado</label>
                      <select
                        className="form-control"
                        value={formVenta.servicioMonto}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10)
                          const label = e.target.options[e.target.selectedIndex].text
                          setFormVenta({ ...formVenta, servicioMonto: val, servicioNombre: label })
                        }}
                      >
                        <option value="18000">Consulta General ($18.000)</option>
                        <option value="32000">Atención de Urgencia ($32.000)</option>
                        <option value="12000">Control Sano / Procedimiento ($12.000)</option>
                        <option value="0">Solo Venta de Farmacia / Alimentos ($0)</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label>Producto Adicional de Farmacia (Descuenta Stock - RF26)</label>
                        <select className="form-control" value={formVenta.productoId} onChange={e => setFormVenta({ ...formVenta, productoId: e.target.value })}>
                          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (${p.precio.toLocaleString('es-CL')})</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Cantidad</label>
                        <input type="number" min="0" max="10" className="form-control" value={formVenta.cantidadProd} onChange={e => setFormVenta({ ...formVenta, cantidadProd: e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label>Medio de Pago (RF32)</label>
                        <select className="form-control" value={formVenta.medioPago} onChange={e => setFormVenta({ ...formVenta, medioPago: e.target.value })}>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta">Tarjeta Débito / Crédito</option>
                          <option value="Transferencia">Transferencia Bancaria</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Estado del Cobro (RF32)</label>
                        <select className="form-control" value={formVenta.estadoPago} onChange={e => setFormVenta({ ...formVenta, estadoPago: e.target.value })}>
                          <option value="Pagado">Pagado Completo</option>
                          <option value="Deuda pendiente">Dejar Deuda Pendiente</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary-vet" style={{ width: '100%' }}>
                      Emitir Comprobante Interno y Registrar Venta (CU15)
                    </button>
                  </form>
                </div>

                <div className="card-panel">
                  <h3>
                    <span>Registrar Gastos y Pagos a Proveedores (CU16 · RF33)</span>
                    <span className="tag tag-red">Exclusivo Administrador</span>
                  </h3>
                  {permisosRol.puedeRegistrarGastos ? (
                    <form onSubmit={registrarGastoProveedor}>
                      <div className="form-group">
                        <label>Proveedor / Laboratorio</label>
                        <input className="form-control" value={formGasto.proveedor} onChange={e => setFormGasto({ ...formGasto, proveedor: e.target.value })} placeholder="Ej: Laboratorio Drag Pharma / VetChile" required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                          <label>Categoría de Gasto</label>
                          <select className="form-control" value={formGasto.categoria} onChange={e => setFormGasto({ ...formGasto, categoria: e.target.value })}>
                            <option value="Insumos y Vacunas">Insumos y Vacunas</option>
                            <option value="Material Quirúrgico">Material Quirúrgico</option>
                            <option value="Servicios Básicos Clínica">Servicios Básicos Clínica</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Monto Total ($ CLP)</label>
                          <input type="number" className="form-control" value={formGasto.monto} onChange={e => setFormGasto({ ...formGasto, monto: e.target.value })} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Descripción de Factura / Compra</label>
                        <input className="form-control" value={formGasto.descripcion} onChange={e => setFormGasto({ ...formGasto, descripcion: e.target.value })} placeholder="Detalle de insumos adquiridos" required />
                      </div>
                      <div className="form-group">
                        <label>Estado del Pago al Proveedor</label>
                        <select className="form-control" value={formGasto.estado} onChange={e => setFormGasto({ ...formGasto, estado: e.target.value })}>
                          <option value="Pagado">Pagado</option>
                          <option value="Pendiente">Factura Pendiente de Pago</option>
                        </select>
                      </div>
                      <button type="submit" className="btn-primary-vet">Guardar Gasto Operativo (RF33)</button>
                    </form>
                  ) : (
                    <div className="alert-box alert-warning">
                      El registro de gastos a proveedores (CU16 / RF33) es una función exclusiva del rol Administrador.
                    </div>
                  )}
                </div>
              </div>

              <div className="card-panel">
                <h3>Registro de Ventas, Medios de Pago y Control de Deudas Pendientes (RF31, RF32)</h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Folio / Fecha</th>
                        <th>Cliente / Mascota</th>
                        <th>Detalle Venta</th>
                        <th>Total</th>
                        <th>Medio Pago</th>
                        <th>Estado / Saldo (RF32)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.map(v => (
                        <tr key={v.id}>
                          <td><strong>{v.folio}</strong><br /><small>{v.fecha}</small></td>
                          <td><strong>{v.clienteNombre}</strong><br /><small>{v.mascotaNombre}</small></td>
                          <td>{v.detalleItems}</td>
                          <td><strong>${v.total.toLocaleString('es-CL')}</strong></td>
                          <td><span className="tag tag-blue">{v.medioPago}</span></td>
                          <td>
                            <span className={`tag ${v.estadoPago === 'Pagado' ? 'tag-green' : 'tag-red'}`}>
                              {v.estadoPago} {v.saldoPendiente > 0 ? `($${v.saldoPendiente.toLocaleString('es-CL')})` : ''}
                            </span>
                            {v.estadoPago === 'Deuda pendiente' && (
                              <button type="button" className="btn-outline-vet" style={{ marginLeft: '8px', padding: '4px 8px' }} onClick={() => saldarDeudaVenta(v.id)}>
                                Saldar Deuda
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              MÓDULO 8: REPORTES EXPORTABLES A EXCEL / PDF (CU17 | RF34)
              =============================================================== */}
          {moduloActual === 'reportes' && (
            <div>
              <div className="card-panel">
                <h3>
                  <span>Generador de Reportes Gerenciales Exportables a PDF y Excel (CU17 · RF34)</span>
                  <span className="tag tag-red">Rol Administrador</span>
                </h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tipo de Reporte</label>
                    <select className="form-control" value={tipoReporte} onChange={e => setTipoReporte(e.target.value)}>
                      <option value="ventas">1. Reporte de Ventas e Ingresos</option>
                      <option value="gastos">2. Reporte de Gastos y Proveedores</option>
                      <option value="stock">3. Reporte de Inventario y Alertas Stock</option>
                      <option value="citas">4. Reporte de Citas y Atenciones</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Desde</label>
                    <input type="date" className="form-control" value={rangoInicio} onChange={e => setRangoInicio(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Hasta</label>
                    <input type="date" className="form-control" value={rangoFin} onChange={e => setRangoFin(e.target.value)} />
                  </div>
                  <button type="button" className="btn-primary-vet" onClick={exportarReporteCSV}>
                    📊 Exportar a Excel (.CSV)
                  </button>
                  <button type="button" className="btn-outline-vet" onClick={() => window.print()}>
                    🖨️ Exportar / Imprimir PDF
                  </button>
                </div>

                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-title">Total Ventas Período</div>
                    <div className="kpi-value">${totalIngresos.toLocaleString('es-CL')}</div>
                    <div className="kpi-sub">{ventas.length} transacciones emitidas</div>
                  </div>
                  <div className="kpi-card warn">
                    <div className="kpi-title">Total Gastos Proveedores</div>
                    <div className="kpi-value">${totalGastos.toLocaleString('es-CL')}</div>
                    <div className="kpi-sub">{gastos.length} facturas registradas</div>
                  </div>
                  <div className="kpi-card finance">
                    <div className="kpi-title">Balance Operativo Neto</div>
                    <div className="kpi-value">${(totalIngresos - totalGastos).toLocaleString('es-CL')}</div>
                    <div className="kpi-sub">Utilidad operacional clínica</div>
                  </div>
                  <div className="kpi-card urgent">
                    <div className="kpi-title">Deudas por Cobrar</div>
                    <div className="kpi-value">${totalDeudas.toLocaleString('es-CL')}</div>
                    <div className="kpi-sub">Control de saldos pendientes (RF32)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              MÓDULO 9: USUARIOS, ROLES Y SEGURIDAD (CU02 | RF01-RF04)
              =============================================================== */}
          {moduloActual === 'usuarios' && (
            <div className="panel-grid-sidebar">
              <div className="card-panel">
                <h3>
                  <span>Crear Usuario y Asignar Rol (CU02 · RF03)</span>
                  <span className="tag tag-red">RBAC</span>
                </h3>
                <form onSubmit={crearNuevoUsuarioClinica}>
                  <div className="form-group">
                    <label>Nombre Completo del Trabajador</label>
                    <input className="form-control" value={formUsuario.nombre} onChange={e => setFormUsuario({ ...formUsuario, nombre: e.target.value })} placeholder="Ej: Dr. Pablo Araya" required />
                  </div>
                  <div className="form-group">
                    <label>RUT</label>
                    <input className="form-control" value={formUsuario.rut} onChange={e => setFormUsuario({ ...formUsuario, rut: e.target.value })} placeholder="18.555.222-9" required />
                  </div>
                  <div className="form-group">
                    <label>Correo Institucional</label>
                    <input type="email" className="form-control" value={formUsuario.correo} onChange={e => setFormUsuario({ ...formUsuario, correo: e.target.value })} placeholder="paraya@patitasfelices.cl" required />
                  </div>
                  <div className="form-group">
                    <label>Rol Asignado en el Sistema (RF02)</label>
                    <select className="form-control" value={formUsuario.rol} onChange={e => setFormUsuario({ ...formUsuario, rol: e.target.value })}>
                      <option value="Administrador">Administrador</option>
                      <option value="Veterinario">Veterinario</option>
                      <option value="Recepcionista">Recepcionista</option>
                      <option value="Asistente">Asistente</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Especialidad / Cargo</label>
                    <input className="form-control" value={formUsuario.especialidad} onChange={e => setFormUsuario({ ...formUsuario, especialidad: e.target.value })} placeholder="Ej: Cirugía y Urgencias" />
                  </div>
                  <button type="submit" className="btn-primary-vet" style={{ width: '100%' }}>Registrar Usuario con Rol (RF03)</button>
                </form>
              </div>

              <div className="card-panel">
                <h3>Dotación de la Veterinaria (8 Trabajadores EV02) y Control de Bloqueos (RF04)</h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nombre / RUT</th>
                        <th>Correo</th>
                        <th>Rol (RF02)</th>
                        <th>Seguridad (RF04)</th>
                        <th>Acciones (RF03)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.nombre}</strong><br /><small>{u.rut} · {u.especialidad}</small></td>
                          <td><code>{u.correo}</code></td>
                          <td><span className="tag tag-teal">{u.rol}</span></td>
                          <td>
                            {u.bloqueado ? (
                              <span className="tag tag-red">🔒 Bloqueado (3 intentos)</span>
                            ) : (
                              <span className={`tag ${u.activo ? 'tag-green' : 'tag-amber'}`}>
                                {u.activo ? `Activo (${u.intentos}/3 fallos)` : 'Desactivado'}
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button type="button" className="btn-outline-vet" onClick={() => alternarEstadoUsuario(u.id)}>
                                {u.activo ? 'Desactivar' : 'Activar'}
                              </button>
                              {u.bloqueado && (
                                <button type="button" className="btn-primary-vet" onClick={() => desbloquearUsuario(u.id)}>
                                  Desbloquear (RF04)
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              MÓDULO 10: MIS TAREAS SUPABASE AUTH & RLS (ETAPA 5 GRUPO 5)
              =============================================================== */}
          {moduloActual === 'tareas_rls' && (
            <div className="panel-grid-2">
              <div className="card-panel">
                <h3>
                  <span>Gestor de Tareas por Usuario con Supabase Auth + RLS (Etapa 5 Grupo 5)</span>
                  <span className="tag tag-teal">public.tareas</span>
                </h3>
                <form onSubmit={agregarTareaRls}>
                  <div className="form-group">
                    <label>Título de la Tarea Clínica / Operativa</label>
                    <input className="form-control" value={tituloTarea} onChange={e => setTituloTarea(e.target.value)} placeholder="Ej: Revisar stock de vacunas antirrábicas" required />
                  </div>
                  <div className="form-group">
                    <label>Descripción</label>
                    <input className="form-control" value={descTarea} onChange={e => setDescTarea(e.target.value)} placeholder="Detalles o notas del turno..." />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label>Estado</label>
                      <select className="form-control" value={estadoTarea} onChange={e => setEstadoTarea(e.target.value)}>
                        <option value="pendiente">Pendiente</option>
                        <option value="en progreso">En progreso</option>
                        <option value="hecha">Hecha</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Usuario Responsable (user_id RLS)</label>
                      <input className="form-control" value={respTarea} onChange={e => setRespTarea(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary-vet">Agregar Tarea Protegida por RLS</button>
                </form>

                <div style={{ marginTop: '16px' }}>
                  {tareasRls.length === 0 ? (
                    <div className="alert-box alert-warning">
                      Lista vacía para la sesión actual: las políticas RLS (<code>auth.uid() = user_id</code>) aseguran que cada usuario visualice únicamente sus propias tareas.
                    </div>
                  ) : (
                    tareasRls.map(t => (
                      <div key={t.id} style={{ padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', marginBottom: '8px', background: '#F8FAFC' }}>
                        <strong>{t.titulo}</strong> <span className="tag tag-teal">{t.estado}</span>
                        <div style={{ fontSize: '12.5px', color: '#475569' }}>{t.descripcion} — Resp: {t.responsable}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card-panel">
                <h3>Políticas Row Level Security (RLS) Activas en Supabase</h3>
                <div className="code-viewer">{`ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario puede ver sus tareas"
ON public.tareas FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuario puede crear sus tareas"
ON public.tareas FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario puede modificar sus tareas"
ON public.tareas FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario puede eliminar sus tareas"
ON public.tareas FOR DELETE TO authenticated
USING (auth.uid() = user_id);`}</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
