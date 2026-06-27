export type Rol = 'ADMIN' | 'VENDEDOR' | 'SOLO_LECTURA'

type Accion = 'crear' | 'leer' | 'editar' | 'eliminar' | 'exportar' | 'admin'
type Recurso = 'cliente' | 'pago' | 'cita' | 'nota' | 'archivo' | 'usuario' | 'configuracion' | 'plantilla'

const permisos: Record<Rol, Record<Accion, boolean>> = {
  ADMIN: {
    crear: true, leer: true, editar: true, eliminar: true, exportar: true, admin: true,
  },
  VENDEDOR: {
    crear: true, leer: true, editar: true, eliminar: false, exportar: true, admin: false,
  },
  SOLO_LECTURA: {
    crear: false, leer: true, editar: false, eliminar: false, exportar: false, admin: false,
  },
}

export function puede(rol: Rol, accion: Accion, _recurso?: Recurso): boolean {
  return permisos[rol]?.[accion] ?? false
}
