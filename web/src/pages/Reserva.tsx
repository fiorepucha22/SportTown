import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { isSocioActivo } from '../lib/auth'
import { PaymentModal } from '../components/PaymentModal'
import { useAuth } from '../state/AuthContext'
import { MaterialIcon } from '../components/MaterialIcon'

type Instalacion = {
  id: number
  nombre: string
  tipo: string
  descripcion?: string | null
  ubicacion?: string | null
  precio_por_hora: string
}

type ReservaItem = {
  id: number
  instalacion_id: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  precio_total: string
  estado: string
}

type ReservaResponse = {
  data: ReservaItem
  reservas?: ReservaItem[]
  meta?: { precio_base: number; descuento_socio: number; precio_final: number; es_socio: boolean; total_reservas?: number }
}

type DisponibilidadResponse = {
  data: {
    instalacion_id: number
    fecha: string
    reservas: Array<{
      hora_inicio: string
      hora_fin: string
      estado: string
    }>
  }
}

const SLOT = 60
const OPEN = 8 * 60
const CLOSE = 22 * 60

export function Reserva() {
  const { id } = useParams()
  const instalacionId = Number(id)
  const auth = useAuth()
  const nav = useNavigate()
  const location = useLocation()

  const [instalacion, setInstalacion] = useState<Instalacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  // Conjunto de horarios seleccionados (cada uno de 1h), identificados por su minuto de inicio
  const [selected, setSelected] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState<{ total: number; importe: number } | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  const [dispLoading, setDispLoading] = useState(false)
  const [busy, setBusy] = useState<Array<{ startMin: number; endMin: number }>>([])

  useEffect(() => {
    if (!auth.token && !auth.loading) {
      nav('/login', { state: { returnTo: location.pathname }, replace: true })
    }
  }, [auth.token, auth.loading, nav, location.pathname])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const res = await apiFetch<{ data: Instalacion }>(`/api/instalaciones/${instalacionId}`)
        if (!cancelled) setInstalacion(res.data)
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Error cargando instalación')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (Number.isFinite(instalacionId) && instalacionId > 0) load()
    else {
      setLoadError('ID inválido')
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [instalacionId])

  // Al cambiar de fecha, limpiar la selección (los slots ya no son válidos)
  useEffect(() => {
    setSelected([])
    setOk(null)
    setActionError(null)
  }, [fecha])

  const loadDisponibilidad = useCallback(async () => {
    if (!Number.isFinite(instalacionId) || instalacionId <= 0) return
    setDispLoading(true)
    try {
      const res = await apiFetch<DisponibilidadResponse>(
        `/api/instalaciones/${instalacionId}/disponibilidad?fecha=${encodeURIComponent(fecha)}`,
      )
      const ranges =
        res.data.reservas?.map((r) => ({
          startMin: toMinutes(r.hora_inicio.slice(0, 5)) ?? 0,
          endMin: toMinutes(r.hora_fin.slice(0, 5)) ?? 0,
        })) ?? []
      setBusy(ranges.filter((x) => x.endMin > x.startMin))
    } catch {
      setBusy([])
    } finally {
      setDispLoading(false)
    }
  }, [instalacionId, fecha])

  useEffect(() => {
    void loadDisponibilidad()
  }, [loadDisponibilidad])

  const esSocioActivo = useMemo(() => isSocioActivo(auth.user), [auth.user])

  const horasSeleccionadas = selected.length // cada slot es de 1 hora

  const precioEstimado = useMemo(() => {
    if (!instalacion || horasSeleccionadas === 0) return null
    return Number(instalacion.precio_por_hora) * horasSeleccionadas
  }, [instalacion, horasSeleccionadas])

  const precioConDescuento = useMemo(() => {
    if (precioEstimado == null || !esSocioActivo) return null
    return precioEstimado * 0.85 // 15% de descuento
  }, [precioEstimado, esSocioActivo])

  const slots = useMemo(() => {
    const out: Array<{ startMin: number; endMin: number; label: string; busy: boolean; selected: boolean }> = []
    for (let m = OPEN; m + SLOT <= CLOSE; m += SLOT) {
      const startMin = m
      const endMin = m + SLOT
      const label = `${fromMinutes(startMin)}-${fromMinutes(endMin)}`
      const busySlot = busy.some((b) => overlaps(startMin, endMin, b.startMin, b.endMin))
      out.push({
        startMin,
        endMin,
        label,
        busy: busySlot,
        selected: selected.includes(startMin),
      })
    }
    return out
  }, [busy, selected])

  const dayPills = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      const label = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(d)
      return { iso, label }
    })
  }, [])

  function toggleSlot(startMin: number) {
    setActionError(null)
    setOk(null)
    setSelected((prev) =>
      prev.includes(startMin) ? prev.filter((m) => m !== startMin) : [...prev, startMin].sort((a, b) => a - b),
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setActionError(null)
    setOk(null)

    if (auth.user?.is_admin) {
      setActionError('Los administradores no pueden reservar instalaciones.')
      return
    }

    if (selected.length === 0) {
      setActionError('Selecciona al menos un horario para reservar.')
      return
    }

    setPayOpen(true)
  }

  async function createReserva(paidId: string) {
    setPaymentId(paidId)
    setSaving(true)
    try {
      const slotsPayload = selected.map((startMin) => ({
        hora_inicio: fromMinutes(startMin),
        hora_fin: fromMinutes(startMin + SLOT),
      }))

      const res = await apiFetch<ReservaResponse>('/api/reservas', {
        method: 'POST',
        body: JSON.stringify({
          instalacion_id: instalacionId,
          fecha,
          slots: slotsPayload,
          payment_id: paidId,
        }),
      })

      const total = res.meta?.total_reservas ?? res.reservas?.length ?? 1
      const importe = res.meta?.precio_final ?? Number(res.data.precio_total)
      setOk({ total, importe })
      setSelected([])
      setPayOpen(false)
      await loadDisponibilidad()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error creando reserva'
      setActionError(msg)
      // Si algún horario se ocupó, refrescar disponibilidad
      await loadDisponibilidad()
      setPayOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="muted">Cargando…</div>
  if (loadError) return <div className="alert alertError">{loadError}</div>
  if (!instalacion) return <div className="muted">No encontrado</div>

  const importeFinal = precioConDescuento ?? precioEstimado ?? 0

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Reservar</h2>
          <p className="pageSubtitle">
            {instalacion.nombre} · {formatTipo(instalacion.tipo)}
          </p>
        </div>
        <Link className="btn btnGhost btnSmall" to="/instalaciones">
          Volver
        </Link>
      </div>

      {ok ? (
        <div className="alert alertOk">
          {ok.total > 1
            ? `${ok.total} reservas confirmadas · Total ${ok.importe.toFixed(2)}€`
            : `Reserva confirmada · ${ok.importe.toFixed(2)}€`}
          {paymentId ? <div className="muted">Pago: {paymentId}</div> : null}
        </div>
      ) : null}

      {actionError ? <div className="alert alertError">{actionError}</div> : null}

      <div className="panel">
        <div className="muted">
          {instalacion.ubicacion ? `Ubicación: ${instalacion.ubicacion}` : null}
          {instalacion.descripcion ? <div>{instalacion.descripcion}</div> : null}
        </div>

        <form onSubmit={onSubmit} className="form">
          <div className="field">
            <label className="label" htmlFor="fecha">
              Fecha
            </label>
            <input id="fecha" className="input inputReadonly" type="date" value={fecha} readOnly required />
            <div className="fieldHint">Selecciona una fecha usando los botones de abajo</div>
          </div>

          <div className="dayPills" aria-label="Días">
            {dayPills.map((d) => (
              <button
                key={d.iso}
                type="button"
                className={`pill ${d.iso === fecha ? 'pillActive' : ''}`}
                onClick={() => setFecha(d.iso)}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="field">
            <div className="labelRow">
              <label className="label">Horarios</label>
              <span className="muted">
                {dispLoading ? 'Cargando disponibilidad…' : 'Puedes seleccionar varios slots (1h cada uno)'}
              </span>
            </div>
            <div className="slotGrid" role="list">
              {slots.map((s) => (
                <button
                  key={s.startMin}
                  type="button"
                  role="listitem"
                  className={`slotBtn ${s.busy ? 'slotBusy' : ''} ${s.selected ? 'slotSelected' : ''}`}
                  disabled={s.busy || saving}
                  onClick={() => toggleSlot(s.startMin)}
                >
                  <span className="slotTime">{s.label}</span>
                  {s.busy ? (
                    <span className="slotTag slotTagBusy">Ocupado</span>
                  ) : s.selected ? (
                    <span className="slotTag slotTagFree">Seleccionado</span>
                  ) : (
                    <span className="slotTag slotTagFree">Libre</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="reservaSummary">
            <div className="reservaSummaryRow">
              <span className="muted">Precio por hora:</span>
              <span className="reservaSummaryValue">{Number(instalacion.precio_por_hora).toFixed(2)}€</span>
            </div>
            <div className="reservaSummaryRow">
              <span className="muted">Horarios seleccionados:</span>
              <span className="reservaSummaryValue">{horasSeleccionadas}</span>
            </div>
            {precioEstimado != null && (
              <>
                {esSocioActivo && precioConDescuento != null ? (
                  <>
                    <div className="reservaSummaryRow">
                      <span>Subtotal:</span>
                      <span className="reservaSummaryValue">{precioEstimado.toFixed(2)}€</span>
                    </div>
                    <div className="reservaSummaryRow" style={{ color: '#4caf50' }}>
                      <span>
                        <MaterialIcon name="star" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }} />
                        Descuento socio (15%):
                      </span>
                      <span className="reservaSummaryValue" style={{ color: '#4caf50' }}>
                        -{(precioEstimado - precioConDescuento).toFixed(2)}€
                      </span>
                    </div>
                    <div className="reservaSummaryRow reservaSummaryTotal">
                      <span>Total estimado:</span>
                      <span className="reservaSummaryValue">{precioConDescuento.toFixed(2)}€</span>
                    </div>
                  </>
                ) : (
                  <div className="reservaSummaryRow reservaSummaryTotal">
                    <span>Total estimado:</span>
                    <span className="reservaSummaryValue">{precioEstimado.toFixed(2)}€</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="formActions">
            {auth.user?.is_admin ? (
              <div className="alert alertError">Los administradores no pueden reservar instalaciones.</div>
            ) : (
              <button
                className="btn btnPrimary btnLarge"
                type="submit"
                disabled={saving || auth.loading || selected.length === 0}
              >
                {saving ? 'Confirmando…' : `Pagar y confirmar ${importeFinal.toFixed(2)}€`}
              </button>
            )}
          </div>
        </form>
      </div>

      <PaymentModal
        open={payOpen}
        title="Pagar reserva"
        amountEur={importeFinal}
        description={`${instalacion.nombre} · ${fecha} · ${selected.length} horario(s)${esSocioActivo ? ' · Descuento socio aplicado' : ''}`}
        onCancel={() => setPayOpen(false)}
        onSuccess={(paidId) => void createReserva(paidId)}
      />
    </div>
  )
}

function toMinutes(hhmm: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null
  return h * 60 + min
}

function fromMinutes(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && aEnd > bStart
}

function formatTipo(tipo: string) {
  return tipo.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
