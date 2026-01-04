import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useAuth } from '../state/AuthContext'
import { ConfirmModal } from '../components/ConfirmModal'
import { MessageModal } from '../components/MessageModal'
import { MaterialIcon } from '../components/MaterialIcon'

type Reserva = {
  id: number
  instalacion_id: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  precio_total: string
  estado: string
  instalacion?: {
    id: number
    nombre: string
    tipo: string
    precio_por_hora: string
  }
}

export function MisReservas() {
  const auth = useAuth()
  const nav = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Reserva[]>([])
  const [cancelModal, setCancelModal] = useState<{ open: boolean; reserva: Reserva | null; montoReembolso: number }>({
    open: false,
    reserva: null,
    montoReembolso: 0,
  })
  const [canceling, setCanceling] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; reserva: Reserva | null }>({
    open: false,
    reserva: null,
  })
  const [messageModal, setMessageModal] = useState<{
    open: boolean
    type: 'success' | 'error' | 'info'
    title: string
    message: string
  }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  })

  useEffect(() => {
    if (!auth.token && !auth.loading) {
      nav('/login', { state: { returnTo: location.pathname }, replace: true })
    }
  }, [auth.token, auth.loading, nav, location.pathname])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!auth.token) return
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch<{ data: Reserva[] }>('/api/reservas')
        if (!cancelled) setItems(res.data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando reservas')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [auth.token])

  function handleCancelarClick(reserva: Reserva) {
    const precioPagado = Number(reserva.precio_total)
    const esSocio = auth.user?.es_socio && auth.user?.fecha_fin_socio && new Date(auth.user.fecha_fin_socio) >= new Date()
    const montoReembolso = esSocio ? precioPagado : precioPagado * 0.5

    setCancelModal({
      open: true,
      reserva,
      montoReembolso,
    })
  }

  async function handleCancelarConfirm() {
    if (!cancelModal.reserva) return

    setCanceling(true)
    try {
      const res = await apiFetch<{
        message: string
        data: {
          reserva: Reserva
          precio_pagado: number
          monto_reembolso: number
          porcentaje_reembolso: number
          es_socio: boolean
        }
      }>(`/api/reservas/${cancelModal.reserva.id}/cancelar`, {
        method: 'POST',
      })
      
      const mensajeReembolso = res.data.es_socio 
        ? `Como socio, recibirás un reembolso del 100%: ${res.data.monto_reembolso.toFixed(2)}€`
        : `Recibirás un reembolso del 50%: ${res.data.monto_reembolso.toFixed(2)}€`

      // Actualizar la lista de reservas
      setItems((prev) => prev.map((r) => (r.id === cancelModal.reserva!.id ? { ...r, estado: 'cancelada' } : r)))

      setCancelModal({ open: false, reserva: null, montoReembolso: 0 })
      setMessageModal({
        open: true,
        type: 'success',
        title: 'Reserva cancelada',
        message: mensajeReembolso,
      })
    } catch (err) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Error al cancelar la reserva',
      })
    } finally {
      setCanceling(false)
    }
  }

  function handleEliminarClick(reserva: Reserva) {
    setDeleteModal({
      open: true,
      reserva,
    })
  }

  async function handleEliminarConfirm() {
    if (!deleteModal.reserva) return

    setDeleting(deleteModal.reserva.id)
    try {
      await apiFetch(`/api/reservas/${deleteModal.reserva.id}`, {
        method: 'DELETE',
      })

      // Eliminar de la lista
      setItems((prev) => prev.filter((r) => r.id !== deleteModal.reserva!.id))

      setDeleteModal({ open: false, reserva: null })
      setMessageModal({
        open: true,
        type: 'success',
        title: 'Reserva eliminada',
        message: 'La reserva ha sido eliminada exitosamente.',
      })
    } catch (err) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Error al eliminar la reserva',
      })
    } finally {
      setDeleting(null)
    }
  }

  // Función para determinar si una reserva está completada
  function esCompletada(reserva: Reserva): boolean {
    const fechaReserva = new Date(reserva.fecha)
    const [hora, minuto] = reserva.hora_fin.split(':').map(Number)
    const fechaHoraFin = new Date(fechaReserva)
    fechaHoraFin.setHours(hora, minuto, 0, 0)
    return fechaHoraFin < new Date()
  }

  // Función para obtener el estado visual de la reserva
  function getEstadoReserva(reserva: Reserva): string {
    if (reserva.estado === 'cancelada') return 'cancelada'
    if (reserva.estado === 'completada' || esCompletada(reserva)) return 'completada'
    return reserva.estado
  }

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Mis reservas</h2>
          <p className="pageSubtitle">Consulta tus reservas confirmadas y su detalle.</p>
        </div>
        <Link className="btn btnGhost btnSmall" to="/instalaciones">
          Ver instalaciones
        </Link>
      </div>

      {error ? <div className="alert alertError">{error}</div> : null}
      {loading ? <div className="muted">Cargando…</div> : null}
      {!loading && items.length === 0 ? <div className="muted">Aún no tienes reservas.</div> : null}

      <div className="gridCards">
        {items.map((r, idx) => {
          const estadoVisual = getEstadoReserva(r)
          const estaCancelada = estadoVisual === 'cancelada'
          const estaCompletada = estadoVisual === 'completada'
          const puedeEliminar = estaCancelada || estaCompletada

          return (
            <div key={r.id} className="card" style={{ ['--stagger' as any]: idx }}>
              <div className="cardTop">
                <div className="badge">{r.instalacion ? formatTipo(r.instalacion.tipo) : 'Reserva'}</div>
                <div className={`chip chip-${estaCancelada ? 'cerrado' : estaCompletada ? 'finalizado' : r.estado === 'confirmada' ? 'abierto' : 'finalizado'}`}>
                  {formatTipo(estadoVisual)}
                </div>
              </div>

              <h3 className="cardTitle">{r.instalacion?.nombre || `Reserva #${r.id}`}</h3>
              <p className="cardDesc">
                {formatFecha(r.fecha)} · {r.hora_inicio}-{r.hora_fin}
              </p>

              <div className="cardMeta">
                <div>Total: {Number(r.precio_total).toFixed(2)}€</div>
                {r.instalacion ? <div>Precio/hora: {Number(r.instalacion.precio_por_hora).toFixed(2)}€</div> : null}
                {estaCancelada && (
                  <div style={{ color: '#4caf50', fontSize: '14px', marginTop: '4px' }}>
                    <MaterialIcon name="check_circle" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }} />
                    Cancelada
                  </div>
                )}
                {estaCompletada && (
                  <div style={{ color: '#2196f3', fontSize: '14px', marginTop: '4px' }}>
                    <MaterialIcon name="check_circle" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }} />
                    Completada
                  </div>
                )}
              </div>

              <div className="cardActions">
                {!estaCancelada && !estaCompletada && (
                  <button
                    className="btn btnGhost"
                    type="button"
                    onClick={() => handleCancelarClick(r)}
                    style={{ color: '#f44336' }}
                  >
                    <MaterialIcon name="cancel" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }} />
                    Cancelar reserva
                  </button>
                )}
                {puedeEliminar && (
                  <button
                    className="btn btnGhost"
                    type="button"
                    onClick={() => handleEliminarClick(r)}
                    disabled={deleting === r.id}
                    style={{ color: '#f44336' }}
                  >
                    <MaterialIcon name="delete" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }} />
                    {deleting === r.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                )}
                {r.instalacion && !estaCompletada ? (
                  <Link className="btn btnPrimary" to={`/reservar/${r.instalacion.id}`}>
                    Reservar otra hora
                  </Link>
                ) : null}
                <Link className="btn btnGhost" to="/instalaciones">
                  Ver catálogo
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmModal
        open={cancelModal.open}
        title="Cancelar reserva"
        message={
          cancelModal.reserva
            ? `¿Estás seguro de que deseas cancelar esta reserva?${
                auth.user?.es_socio && auth.user?.fecha_fin_socio && new Date(auth.user.fecha_fin_socio) >= new Date()
                  ? `\n\nComo socio, recibirás un reembolso del 100%: ${cancelModal.montoReembolso.toFixed(2)}€`
                  : `\n\nRecibirás un reembolso del 50%: ${cancelModal.montoReembolso.toFixed(2)}€`
              }`
            : ''
        }
        onConfirm={handleCancelarConfirm}
        onCancel={() => setCancelModal({ open: false, reserva: null, montoReembolso: 0 })}
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        confirmVariant="danger"
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Eliminar reserva"
        message={`¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.`}
        onConfirm={handleEliminarConfirm}
        onCancel={() => setDeleteModal({ open: false, reserva: null })}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />

      <MessageModal
        open={messageModal.open}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
      />
    </div>
  )
}

function formatTipo(tipo: string) {
  const estados: Record<string, string> = {
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
    completada: 'Completada',
    pendiente: 'Pendiente',
  }
  if (estados[tipo.toLowerCase()]) {
    return estados[tipo.toLowerCase()]
  }
  return tipo.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}


