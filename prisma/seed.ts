import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'
import { PLANTILLAS_BASE } from '../src/lib/plantillas-base'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const etapas = ['NUEVO', 'CONTACTADO', 'CITA_AGENDADA', 'PROPUESTA_ENVIADA', 'GANADO', 'PERDIDO'] as const
const temps = ['CALIENTE', 'TIBIO', 'FRIO'] as const
const origenes = ['Instagram', 'Facebook', 'WhatsApp', 'Referido', 'Google', 'LinkedIn']
const objeciones = ['Precio muy alto', 'No tenía tiempo', 'Eligió a la competencia', 'No era el momento']

const nombres = [
  'Ana López', 'Jorge Ramírez', 'Sofía Pérez', 'Miguel Hernández', 'Lucía Torres',
  'Carlos Méndez', 'Fernanda Ruiz', 'Roberto Díaz', 'Paola Castro', 'Diego Morales',
]

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  const existentes = await prisma.usuario.count()
  if (existentes > 0) {
    console.log('Ya hay datos. Seed omitido.')
    return
  }

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'César Cuapan',
      email: 'cesar@cesaruapan.com',
      password: await bcrypt.hash('Admin2026!', 10),
      rol: 'ADMIN',
      metaMes: 30,
      onboardingCompletado: true,
    },
  })

  const vendedor = await prisma.usuario.create({
    data: {
      nombre: 'Vendedor Demo',
      email: 'vendedor@cesaruapan.com',
      password: await bcrypt.hash('Vendedor2026!', 10),
      rol: 'VENDEDOR',
      metaMes: 20,
      onboardingCompletado: true,
    },
  })

  // Etiquetas
  await prisma.etiqueta.createMany({
    data: [
      { nombre: 'VIP', color: '#e8b763' },
      { nombre: 'Referido', color: '#34d399' },
      { nombre: 'Interesado', color: '#60a5fa' },
    ],
  })

  // Configuración
  await prisma.configuracion.create({ data: {} })

  // Plantillas globales
  for (const p of PLANTILLAS_BASE) {
    await prisma.plantillaMensaje.create({
      data: { nombre: p.nombre, contenido: p.contenido, canal: 'WHATSAPP', etapa: p.etapa, tipo: p.tipo },
    })
  }

  // Clientes
  for (let i = 0; i < nombres.length; i++) {
    const etapa = etapas[i % etapas.length]
    const estado = etapa === 'GANADO' ? 'GANADO' : etapa === 'PERDIDO' ? 'PERDIDO' : 'ACTIVO'
    const valor = 5000 + Math.floor(Math.random() * 40000)
    const diasAtras = Math.floor(Math.random() * 60)
    const ultimoContacto = new Date(Date.now() - diasAtras * 86400000)

    const empresa = await prisma.empresa.create({
      data: { nombre: `Empresa ${nombres[i].split(' ')[1]}`, giro: 'Servicios', puesto: 'Director', numEmpleados: 5 + i },
    })

    const cliente = await prisma.cliente.create({
      data: {
        nombre: nombres[i],
        telefono: `22212345${(10 + i).toString()}`,
        correo: `${nombres[i].split(' ')[0].toLowerCase()}@example.com`,
        origen: rand(origenes),
        etapa,
        estado: estado as never,
        temperatura: rand(temps),
        objecion: estado === 'PERDIDO' ? rand(objeciones) : null,
        valorEstimado: valor,
        retoPrincipal: 'Aumentar ventas y organizar su negocio',
        proximaAccion: estado === 'ACTIVO' ? 'Dar seguimiento' : null,
        fechaProximaAccion: estado === 'ACTIVO' ? new Date(Date.now() + (i - 3) * 86400000) : null,
        usuarioId: i % 2 === 0 ? admin.id : vendedor.id,
        empresaId: empresa.id,
        ultimoContacto,
      },
    })

    // Historial de notas
    await prisma.nota.createMany({
      data: [
        { clienteId: cliente.id, usuarioId: admin.id, contenido: 'Primer contacto realizado', tipo: 'LLAMADA', creadoEn: new Date(Date.now() - (diasAtras + 5) * 86400000) },
        { clienteId: cliente.id, usuarioId: admin.id, contenido: 'Envío de información', tipo: 'MENSAJE', creadoEn: new Date(Date.now() - diasAtras * 86400000) },
      ],
    })

    // Pagos para algunos
    if (i % 2 === 0) {
      const estatus = i % 4 === 0 ? 'PAGADO' : i % 6 === 0 ? 'VENCIDO' : 'PENDIENTE'
      await prisma.pago.create({
        data: {
          clienteId: cliente.id,
          monto: Math.round(valor / 2),
          metodo: rand(['TRANSFERENCIA', 'TARJETA', 'LIGA_PAGO'] as const),
          estatus: estatus as never,
          folio: i + 1,
          concepto: 'Primer pago',
          fechaPago: estatus === 'PAGADO' ? new Date(Date.now() - i * 86400000 * 3) : null,
          fechaVencimiento: new Date(Date.now() + 15 * 86400000),
        },
      })
    }

    // Citas (pasadas y futuras)
    await prisma.cita.create({
      data: {
        clienteId: cliente.id,
        usuarioId: admin.id,
        titulo: 'Sesión de diagnóstico',
        fecha: new Date(Date.now() + (i - 4) * 86400000),
        duracion: 45,
        confirmada: i % 2 === 0,
      },
    })
  }

  // Histórico de cierres en 6 meses
  for (let m = 1; m <= 6; m++) {
    const fecha = new Date()
    fecha.setMonth(fecha.getMonth() - m)
    const emp = await prisma.empresa.create({ data: { nombre: `Cliente histórico ${m}` } })
    const c = await prisma.cliente.create({
      data: {
        nombre: `Cliente histórico ${m}`,
        etapa: 'GANADO',
        estado: 'GANADO',
        temperatura: 'CALIENTE',
        valorEstimado: 20000,
        usuarioId: admin.id,
        empresaId: emp.id,
        creadoEn: fecha,
        actualizadoEn: fecha,
        ultimoContacto: fecha,
      },
    })
    await prisma.pago.create({
      data: { clienteId: c.id, monto: 20000, metodo: 'TRANSFERENCIA', estatus: 'PAGADO', folio: 100 + m, fechaPago: fecha },
    })
  }

  // Recordatorio para admin
  await prisma.recordatorio.create({
    data: { usuarioId: admin.id, texto: 'Llamar a Ana López para cerrar propuesta', fecha: new Date() },
  })

  console.log('Seed completado.')
  console.log('Admin: cesar@cesaruapan.com / Admin2026!')
  console.log('Vendedor: vendedor@cesaruapan.com / Vendedor2026!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
