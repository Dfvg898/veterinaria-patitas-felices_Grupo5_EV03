// =============================================================================
// DATOS INICIALES REALISTAS - VETERINARIA "PATITAS FELICES" (SEDE ARICA)
// 100% coherentes con el Informe EV02 (8 trabajadores, 4 roles, 17 CU, 34 RF)
// =============================================================================

export const ROLES_PERMISOS = {
  Administrador: {
    color: '#C41230',
    badgeBg: '#FDECEF',
    descripcion: 'Propietario de la clínica. Acceso total a usuarios, inventario, finanzas, reportes y supervisión.',
    modulos: ['dashboard', 'clientes', 'citas', 'fichas', 'recordatorios', 'inventario', 'finanzas', 'reportes', 'usuarios', 'tareas_rls'],
    puedeCrearUsuarios: true,
    puedeGestionarCatalogo: true,
    puedeRegistrarGastos: true,
    puedeExportarReportes: true,
    puedeRegistrarAtencion: true,
    puedeAgendarCobrar: true,
    puedeMoverStock: true
  },
  Veterinario: {
    color: '#0D6E6E',
    badgeBg: '#E6F5F5',
    descripcion: 'Médico veterinario. Registra atenciones clínicas, recetas, vacunas, urgencias y consulta agenda e historial.',
    modulos: ['dashboard', 'clientes', 'citas', 'fichas', 'inventario', 'tareas_rls'],
    puedeCrearUsuarios: false,
    puedeGestionarCatalogo: false,
    puedeRegistrarGastos: false,
    puedeExportarReportes: false,
    puedeRegistrarAtencion: true,
    puedeAgendarCobrar: false,
    puedeMoverStock: false
  },
  Recepcionista: {
    color: '#1D5B9B',
    badgeBg: '#E8F1FA',
    descripcion: 'Atención de mesón. Gestiona clientes, mascotas, agenda de citas, recordatorios, ventas y cobros.',
    modulos: ['dashboard', 'clientes', 'citas', 'recordatorios', 'finanzas', 'tareas_rls'],
    puedeCrearUsuarios: false,
    puedeGestionarCatalogo: false,
    puedeRegistrarGastos: false,
    puedeExportarReportes: false,
    puedeRegistrarAtencion: false,
    puedeAgendarCobrar: true,
    puedeMoverStock: false
  },
  Asistente: {
    color: '#B45309',
    badgeBg: '#FEF3C7',
    descripcion: 'Apoyo clínico y bodega. Consulta agenda e historial, apoya en vacunación/urgencias y registra movimientos de stock.',
    modulos: ['dashboard', 'citas', 'fichas', 'inventario', 'tareas_rls'],
    puedeCrearUsuarios: false,
    puedeGestionarCatalogo: false,
    puedeRegistrarGastos: false,
    puedeExportarReportes: false,
    puedeRegistrarAtencion: false,
    puedeAgendarCobrar: false,
    puedeMoverStock: true
  }
}

// Los 8 trabajadores definidos en el Contexto de Producción de la EV02:
// 1 Administrador (propietario), 3 Veterinarios, 1 Recepcionista y 3 Asistentes
export const INITIAL_USUARIOS = [
  { id: 'u1', nombre: 'Dr. Fernando Soto (Propietario)', rut: '13.452.810-4', correo: 'admin@patitasfelices.cl', pass: 'Admin2026!', rol: 'Administrador', especialidad: 'Dirección y Cirugía General', activo: true, intentos: 0, bloqueado: false },
  { id: 'u2', nombre: 'Dra. Camila Rojas', rut: '17.892.341-K', correo: 'veterinario@patitasfelices.cl', pass: 'Vet2026!', rol: 'Veterinario', especialidad: 'Medicina Interna Pequeños Animales', activo: true, intentos: 0, bloqueado: false },
  { id: 'u3', nombre: 'Dr. Martín Vega', rut: '18.234.119-2', correo: 'mvega@patitasfelices.cl', pass: 'Vet2026!', rol: 'Veterinario', especialidad: 'Dermatología y Exóticos', activo: true, intentos: 0, bloqueado: false },
  { id: 'u4', nombre: 'Dra. Valentina Ríos', rut: '19.104.552-7', correo: 'vrios@patitasfelices.cl', pass: 'Vet2026!', rol: 'Veterinario', especialidad: 'Medicina Preventiva y Felinos', activo: true, intentos: 0, bloqueado: false },
  { id: 'u5', nombre: 'Carla Morales', rut: '19.588.420-1', correo: 'recepcion@patitasfelices.cl', pass: 'Recep2026!', rol: 'Recepcionista', especialidad: 'Atención de Clientes y Caja', activo: true, intentos: 0, bloqueado: false },
  { id: 'u6', nombre: 'Tomás Araya', rut: '20.412.889-5', correo: 'asistente@patitasfelices.cl', pass: 'Asist2026!', rol: 'Asistente', especialidad: 'Enfermería y Vacunatorio', activo: true, intentos: 0, bloqueado: false },
  { id: 'u7', nombre: 'Sofía Pizarro', rut: '21.003.714-8', correo: 'spizarro@patitasfelices.cl', pass: 'Asist2026!', rol: 'Asistente', especialidad: 'Peluquería y Apoyo Clínico', activo: true, intentos: 0, bloqueado: false },
  { id: 'u8', nombre: 'Lucas Cortés', rut: '20.891.203-3', correo: 'lcortes@patitasfelices.cl', pass: 'Asist2026!', rol: 'Asistente', especialidad: 'Control de Bodega y Farmacia', activo: true, intentos: 0, bloqueado: false }
]

export const INITIAL_CLIENTES = [
  { id: 'c1', rut: '15.678.234-9', nombre: 'Marcela Contreras Mamani', telefono: '+56984123090', correo: 'marcela.contreras@gmail.com', direccion: 'Av. Santa María 2450, Arica' },
  { id: 'c2', rut: '18.902.114-5', nombre: 'Rodrigo Tapia Quispe', telefono: '+56976541280', correo: 'rtapia.arica@outlook.cl', direccion: 'Población Chinchorro, Pje. Las Palmeras 412, Arica' },
  { id: 'c3', rut: '12.340.998-1', nombre: 'Carmen Gloria Olivares', telefono: '+56991204455', correo: 'carmen.olivares@gmail.com', direccion: 'Av. Capitán Ávalos 1890, Arica' },
  { id: 'c4', rut: '20.145.672-K', nombre: 'Matías Fuenzalida Flores', telefono: 'telefono-invalido', correo: '', direccion: 'Calle 18 de Septiembre 940, Arica' }
]

export const INITIAL_MASCOTAS = [
  { id: 'm1', fichaCodigo: 'FC-2026-001', clienteId: 'c1', nombre: 'Thor', especie: 'Perro', raza: 'Pastor Alemán', sexo: 'Macho', fechaNacimiento: '2022-05-14', peso: 31.4, alergias: 'Alergia leve a amoxicilina' },
  { id: 'm2', fichaCodigo: 'FC-2026-002', clienteId: 'c1', nombre: 'Luna', especie: 'Gato', raza: 'Doméstico Pelo Corto', sexo: 'Hembra', fechaNacimiento: '2023-08-20', peso: 4.1, alergias: 'Sin alergias registradas' },
  { id: 'm3', fichaCodigo: 'FC-2026-003', clienteId: 'c2', nombre: 'Rocky', especie: 'Perro', raza: 'Poodle Toy', sexo: 'Macho', fechaNacimiento: '2021-11-03', peso: 5.8, alergias: 'Dermatitis estacional' },
  { id: 'm4', fichaCodigo: 'FC-2026-004', clienteId: 'c3', nombre: 'Michi', especie: 'Gato', raza: 'Siamés', sexo: 'Macho', fechaNacimiento: '2020-03-10', peso: 4.9, alergias: 'Sensibilidad digestiva' },
  { id: 'm5', fichaCodigo: 'FC-2026-005', clienteId: 'c4', nombre: 'Copito', especie: 'Conejo', raza: 'Cabeza de León', sexo: 'Macho', fechaNacimiento: '2025-02-01', peso: 1.6, alergias: 'Sin alergias registradas' }
]

export const INITIAL_CITAS = [
  { id: 'ct1', mascotaId: 'm3', servicio: 'Urgencia Traumatológica / Ingesta cuerpo extraño', veterinario: 'Dra. Camila Rojas', fecha: '2026-11-16', hora: '09:30', estado: 'En espera', esUrgencia: true, gravedad: 'Alta / Crítica', motivo: 'Vómito agudo y decaimiento repentino' },
  { id: 'ct2', mascotaId: 'm1', servicio: 'Consulta General y Control Dermatológico', veterinario: 'Dra. Camila Rojas', fecha: '2026-11-16', hora: '10:30', estado: 'Atendida', esUrgencia: false, gravedad: 'Normal', motivo: 'Control de otitis externa' },
  { id: 'ct3', mascotaId: 'm2', servicio: 'Vacunación Triple Felina', veterinario: 'Dra. Valentina Ríos', fecha: '2026-11-16', hora: '11:30', estado: 'Pendiente', esUrgencia: false, gravedad: 'Normal', motivo: 'Refuerzo anual programado' },
  { id: 'ct4', mascotaId: 'm4', servicio: 'Desparasitación Interna y Control Peso', veterinario: 'Dr. Martín Vega', fecha: '2026-11-16', hora: '15:30', estado: 'Pendiente', esUrgencia: false, gravedad: 'Normal', motivo: 'Control preventivo trimestral' },
  { id: 'ct5', mascotaId: 'm5', servicio: 'Consulta Especialista Exóticos', veterinario: 'Dr. Martín Vega', fecha: '2026-11-17', hora: '10:00', estado: 'Pendiente', esUrgencia: false, gravedad: 'Normal', motivo: 'Revisión dental y corte de uñas' }
]

export const INITIAL_ATENCIONES = [
  {
    id: 'at1',
    mascotaId: 'm1',
    fecha: '2026-11-16',
    veterinario: 'Dra. Camila Rojas',
    motivo: 'Control de otitis externa oído derecho y prurito auricular',
    pesoKg: 31.4,
    temperaturaC: 38.6,
    diagnostico: 'Otitis externa bacteriana leve sin perforación timpánica.',
    tratamiento: 'Limpieza ótica con solución clorhexidina + gotas óticas Otiderm cada 12 hrs por 7 días.',
    observaciones: 'Control en 7 días. Evitar ingreso de agua durante el baño.',
    estadoRegistro: 'Finalizada'
  },
  {
    id: 'at2',
    mascotaId: 'm3',
    fecha: '2026-10-18',
    veterinario: 'Dr. Martín Vega',
    motivo: 'Prurito interdigital y enrojecimiento de piel abdominal',
    pesoKg: 5.7,
    temperaturaC: 38.4,
    diagnostico: 'Dermatitis alérgica por picadura de pulga (DAPP).',
    tratamiento: 'Pipeta antipulgas Bravecto + baño medicado con shampoo hipoalergénico.',
    observaciones: 'Tutor reporta mejoría rápida a las 48 horas.',
    estadoRegistro: 'Finalizada'
  }
]

export const INITIAL_VACUNAS = [
  { id: 'v1', mascotaId: 'm1', tipo: 'Vacuna', productoId: 'p1', productoNombre: 'Vacuna Óctuple Canina Nobivac', fechaAplicacion: '2026-05-10', lote: 'NBV-8841A', proximoRefuerzo: '2027-05-10', responsable: 'Dra. Camila Rojas' },
  { id: 'v2', mascotaId: 'm1', tipo: 'Vacuna', productoId: 'p2', productoNombre: 'Vacuna Antirrábica Defensor 3', fechaAplicacion: '2026-11-10', lote: 'DEF-2209B', proximoRefuerzo: '2026-11-20', responsable: 'Tomás Araya (Asistente)' },
  { id: 'v3', mascotaId: 'm2', tipo: 'Vacuna', productoId: 'p3', productoNombre: 'Vacuna Triple Felina Feligen', fechaAplicacion: '2025-11-18', lote: 'FEL-1092C', proximoRefuerzo: '2026-11-18', responsable: 'Dra. Valentina Ríos' },
  { id: 'v4', mascotaId: 'm4', tipo: 'Desparasitación', productoId: 'p4', productoNombre: 'Antiparasitario Interno Drontal Gatos', fechaAplicacion: '2026-08-19', lote: 'DRN-5530X', proximoRefuerzo: '2026-11-19', responsable: 'Tomás Araya (Asistente)' }
]

export const INITIAL_PRODUCTOS = [
  { id: 'p1', sku: 'VAC-OCT-001', nombre: 'Vacuna Óctuple Canina Nobivac', categoria: 'Vacunas', stock: 14, stockMinimo: 6, precio: 18500, fechaVencimiento: '2027-06-30', lote: 'NBV-8841A' },
  { id: 'p2', sku: 'VAC-RAB-002', nombre: 'Vacuna Antirrábica Defensor 3', categoria: 'Vacunas', stock: 3, stockMinimo: 5, precio: 15000, fechaVencimiento: '2027-04-15', lote: 'DEF-2209B' },
  { id: 'p3', sku: 'VAC-FEL-003', nombre: 'Vacuna Triple Felina Feligen', categoria: 'Vacunas', stock: 8, stockMinimo: 5, precio: 17500, fechaVencimiento: '2026-11-28', lote: 'FEL-1092C' },
  { id: 'p4', sku: 'FAR-DRN-004', nombre: 'Antiparasitario Interno Drontal Gatos', categoria: 'Antiparasitarios', stock: 2, stockMinimo: 8, precio: 6500, fechaVencimiento: '2027-09-10', lote: 'DRN-5530X' },
  { id: 'p5', sku: 'FAR-OTI-005', nombre: 'Gotas Óticas Otiderm 15ml', categoria: 'Medicamentos', stock: 11, stockMinimo: 4, precio: 12900, fechaVencimiento: '2026-11-25', lote: 'OTI-4410M' },
  { id: 'p6', sku: 'ALI-ROY-006', nombre: 'Alimento Medicado Royal Canin Renal 2kg', categoria: 'Alimentos', stock: 9, stockMinimo: 3, precio: 26900, fechaVencimiento: '2027-08-20', lote: 'RC-9901Z' }
]

export const INITIAL_MOVIMIENTOS = [
  { id: 'mv1', productoId: 'p1', productoNombre: 'Vacuna Óctuple Canina Nobivac', tipo: 'Entrada', cantidad: 15, motivo: 'Compra factura #4502 Distribuidora VetChile', responsable: 'Dr. Fernando Soto (Propietario)', fecha: '2026-11-02 09:15' },
  { id: 'mv2', productoId: 'p5', productoNombre: 'Gotas Óticas Otiderm 15ml', tipo: 'Salida', cantidad: 1, motivo: 'Venta en consulta ficha FC-2026-001 (Thor)', responsable: 'Carla Morales (Recepcionista)', fecha: '2026-11-16 11:05' },
  { id: 'mv3', productoId: 'p4', productoNombre: 'Antiparasitario Interno Drontal Gatos', tipo: 'Salida', cantidad: 2, motivo: 'Despacho vacunatorio interno', responsable: 'Lucas Cortés (Asistente)', fecha: '2026-11-15 16:40' }
]

export const INITIAL_VENTAS = [
  { id: 'vt1', folio: 'BOL-2026-0101', fecha: '2026-11-16', clienteNombre: 'Marcela Contreras Mamani', mascotaNombre: 'Thor (FC-2026-001)', detalleItems: 'Consulta General ($18.000) + Gotas Óticas Otiderm ($12.900)', total: 30900, medioPago: 'Tarjeta', estadoPago: 'Pagado', saldoPendiente: 0, responsable: 'Carla Morales' },
  { id: 'vt2', folio: 'BOL-2026-0102', fecha: '2026-11-15', clienteNombre: 'Rodrigo Tapia Quispe', mascotaNombre: 'Rocky (FC-2026-003)', detalleItems: 'Control Dermatológico ($18.000) + Alimento Medicado ($26.900)', total: 44900, medioPago: 'Transferencia', estadoPago: 'Deuda pendiente', saldoPendiente: 14900, responsable: 'Carla Morales' },
  { id: 'vt3', folio: 'BOL-2026-0103', fecha: '2026-11-14', clienteNombre: 'Carmen Gloria Olivares', mascotaNombre: 'Michi (FC-2026-004)', detalleItems: 'Vacuna Triple Felina ($17.500) + Desparasitación ($6.500)', total: 24000, medioPago: 'Efectivo', estadoPago: 'Pagado', saldoPendiente: 0, responsable: 'Carla Morales' }
]

export const INITIAL_GASTOS = [
  { id: 'g1', fecha: '2026-11-05', proveedor: 'Distribuidora Farmacéutica VetChile S.A.', categoria: 'Insumos y Vacunas', descripcion: 'Reposición mensual de vacunas Nobivac y antiparasitarios', monto: 185000, estado: 'Pagado', responsable: 'Dr. Fernando Soto (Propietario)' },
  { id: 'g2', fecha: '2026-11-12', proveedor: 'Insumos Clínicos del Norte Ltda.', categoria: 'Material Quirúrgico', descripcion: 'Guantes de nitrilo, jeringas 3ml, gasas estériles y clorhexidina', monto: 64500, estado: 'Pendiente', responsable: 'Dr. Fernando Soto (Propietario)' }
]

export const INITIAL_RECORDATORIOS = [
  { id: 'r1', fechaEnvio: '2026-11-16', clienteNombre: 'Marcela Contreras Mamani', mascotaNombre: 'Luna (FC-2026-002)', contacto: '+56984123090', canal: 'WhatsApp API', tipo: 'Vacuna / Control Próximo (RF22)', mensaje: 'Hola Marcela, te recordamos que Luna tiene agendado su refuerzo de Vacuna Triple Felina hoy a las 11:30 hrs en Veterinaria Patitas Felices.', estadoEntrega: 'Entregado' },
  { id: 'r2', fechaEnvio: '2026-11-16', clienteNombre: 'Carmen Gloria Olivares', mascotaNombre: 'Michi (FC-2026-004)', contacto: '+56991204455', canal: 'Correo / WhatsApp', tipo: 'Cita Próxima 24h (RF23)', mensaje: 'Hola Carmen, recordamos el control y desparasitación de Michi hoy a las 15:30 hrs con el Dr. Martín Vega.', estadoEntrega: 'Entregado' },
  { id: 'r3', fechaEnvio: '2026-11-16', clienteNombre: 'Matías Fuenzalida Flores', mascotaNombre: 'Copito (FC-2026-005)', contacto: 'telefono-invalido', canal: 'WhatsApp API', tipo: 'Cita Próxima 24h (RF23)', mensaje: 'Recordatorio de consulta exóticos para Copito mañana 10:00 hrs.', estadoEntrega: 'No entregado (Contacto inválido)' }
]
