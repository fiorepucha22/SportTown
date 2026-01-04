import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
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

type ReservaResponse = {
  data: {
    id: number
    instalacion_id: number
    fecha: string
    hora_inicio: string
    hora_fin: string
    precio_total: string
    estado: string
  }
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
  const [horaInicio, setHoraInicio] = useState('18:00')
  const [horaFin, setHoraFin] = useState('19:00')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState<ReservaResponse['data'] | null>(null)
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
      // si falla disponibilidad, no rompemos la pantalla; solo no podemos bloquear slots.
      setBusy([])
    } finally {
      setDispLoading(false)
    }
  }, [instalacionId, fecha])

  useEffect(() => {
    void loadDisponibilidad()
  }, [loadDisponibilidad])

  const esSocioActivo = useMemo(() => {
    if (!auth.user?.es_socio || !auth.user?.fecha_fin_socio) return false
    const fechaFin = new Date(auth.user.fecha_fin_socio)
    return fechaFin >= new Date()
  }, [auth.user])

  const precioEstimado = useMemo(() => {
    if (!instalacion) return null
    const start = toMinutes(horaInicio)
    const end = toMinutes(horaFin)
    if (start == null || end == null || end <= start) return null
    const hours = (end - start) / 60
    return Number(instalacion.precio_por_hora) * hours
  }, [instalacion, horaInicio, horaFin])

  const precioConDescuento = useMemo(() => {
    if (!precioEstimado || !esSocioActivo) return null
    return precioEstimado * 0.85 // 15% de descuento
  }, [precioEstimado, esSocioActivo])

  const isSelectedBusy = useMemo(() => {
    const start = toMinutes(horaInicio)
    const end = toMinutes(horaFin)
    if (start == null || end == null) return false
    return busy.some((b) => overlaps(start, end, b.startMin, b.endMin))
  }, [busy, horaInicio, horaFin])

  const slots = useMemo(() => {
    const OPEN = 8 * 60
    const CLOSE = 22 * 60
    const SLOT = 60
    const out: Array<{ startMin: number; endMin: number; label: string; busy: boolean; selected: boolean }> = []
    const selectedStart = toMinutes(horaInicio)
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
        selected: selectedStart === startMin,
      })
    }
    return out
  }, [busy, horaInicio])

  const dayPills = useMemo(() => {
    const now = new Date()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      const label = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(d)
      return { iso, label }
    })
    return days
  }, [])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setActionError(null)
    setOk(null)

    // Los administradores no pueden reservar instalaciones
    if (auth.user?.is_admin) {
      setActionError('Los administradores no pueden reservar instalaciones.')
      return
    }

    if (precioEstimado == null) {
      setActionError('Selecciona un horario válido antes de pagar.')
      return
    }

    if (isSelectedBusy) {
      setActionError('Ese horario ya está reservado. Elige otro disponible.')
      return
    }

    setPayOpen(true)
  }

  async function createReserva(paidId: string) {
    setPaymentId(paidId)
    setSaving(true)
    try {
      const res = await apiFetch<ReservaResponse & { meta?: { precio_base: number; descuento_socio: number; precio_final: number; es_socio: boolean } }>('/api/reservas', {
        method: 'POST',
        body: JSON.stringify({
          instalacion_id: instalacionId,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          payment_id: paidId, 
        }),
      })
      setOk(res.data)
      setPayOpen(false)
      // Recargar disponibilidad automáticamente después de reservar
      await loadDisponibilidad()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error creando reserva'
      if (msg.toLowerCase().includes('ya existe una reserva')) {
        setActionError('Ese horario se reservó justo ahora. No se confirmó la reserva. Elige otro horario.')
        // Recargar disponibilidad para actualizar la UI
        await loadDisponibilidad()
      } else {
        setActionError(msg)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="muted">Cargando…</div>
  if (loadError) return <div className="alert alertError">{loadError}</div>
  if (!instalacion) return <div className="muted">No encontrado</div>

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
          Reserva confirmada (#{ok.id}) · {ok.fecha} {ok.hora_inicio}-{ok.hora_fin} · {Number(ok.precio_total).toFixed(2)}€
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
            <input 
              id="fecha" 
              className="input inputReadonly" 
              type="date" 
              value={fecha} 
              readOnly
              required 
            />
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
              <label className="label">Horario</label>
              <span className="muted">{dispLoading ? 'Cargando disponibilidad…' : 'Selecciona un slot (1h)'}</span>
            </div>
            <div className="slotGrid" role="list">
              {slots.map((s) => (
                <button
                  key={s.startMin}
                  type="button"
                  role="listitem"
                  className={`slotBtn ${s.busy ? 'slotBusy' : ''} ${s.selected ? 'slotSelected' : ''}`}
                  disabled={s.busy || saving}
                  onClick={() => {
                    setHoraInicio(fromMinutes(s.startMin))
                    setHoraFin(fromMinutes(s.endMin))
                  }}
                >
                  <span className="slotTime">{s.label}</span>
                  {s.busy ? (
                    <span className="slotTag slotTagBusy">Ocupado</span>
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
            {isSelectedBusy && (
              <div className="reservaSummaryError">
                <MaterialIcon name="warning" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }} />
                Este horario ya está ocupado. Por favor, selecciona otro disponible.
              </div>
            )}
          </div>

          <div className="formActions">
            {auth.user?.is_admin ? (
              <div className="alert alertError">
                Los administradores no pueden reservar instalaciones.
              </div>
            ) : (
              <button className="btn btnPrimary btnLarge" type="submit" disabled={saving || auth.loading || (precioConDescuento ?? precioEstimado) == null || isSelectedBusy}>
                {saving ? 'Confirmando…' : `Pagar y confirmar ${precioConDescuento != null ? precioConDescuento.toFixed(2) : precioEstimado?.toFixed(2) ?? '0.00'}€`}
              </button>
            )}
          </div>
        </form>
      </div>

      <PaymentModal
        open={payOpen}
        title="Pagar reserva"
        amountEur={precioConDescuento ?? precioEstimado ?? 0}
        description={`${instalacion.nombre} · ${fecha} · ${horaInicio}-${horaFin}${esSocioActivo ? ' · Descuento socio aplicado' : ''}`}
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


