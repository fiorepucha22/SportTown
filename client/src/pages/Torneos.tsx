import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useNavigate } from 'react-router-dom'
import { TorneoModal } from '../components/TorneoModal'
import { MessageModal } from '../components/MessageModal'

type Torneo = {
  id: number
  nombre: string
  deporte: string
  categoria?: string | null
  fecha_inicio: string
  fecha_fin: string
  provincia: string
  ciudad: string
  sede?: string | null
  descripcion?: string | null
  cupo: number
  inscritos: number
  estado: string
  is_inscrito?: boolean
}

const PROVINCIAS = ['Valencia', 'Alicante', 'Castellón'] as const
const MY_KEY = 'sporttown_my_tournaments'

export function Torneos() {
  const auth = useAuth()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [provincia, setProvincia] = useState('')
  const [deporte, setDeporte] = useState('')
  const [estado, setEstado] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Torneo[]>([])
  const [inscribiendo, setInscribiendo] = useState<number | null>(null)
  const [selectedTorneo, setSelectedTorneo] = useState<Torneo | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [messageModal, setMessageModal] = useState<{ open: boolean; type: 'success' | 'error'; title: string; message: string }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (q.trim()) params.set('q', q.trim())
        if (provincia) params.set('provincia', provincia)
        if (deporte) params.set('deporte', deporte)
        if (estado) params.set('estado', estado)
        const qs = params.toString()

        const res = await apiFetch<{ data: Torneo[] }>(`/api/torneos${qs ? `?${qs}` : ''}`)
        if (!cancelled) {
          // Preservar el estado de inscripción de los torneos anteriores
          setItems((prevItems) => {
            const newItems = res.data
            return newItems.map((newTorneo) => {
              const prevTorneo = prevItems.find((p) => p.id === newTorneo.id)
              // Si el torneo ya estaba marcado como inscrito, mantenerlo
              if (prevTorneo?.is_inscrito) {
                return { ...newTorneo, is_inscrito: true }
              }
              return newTorneo
            })
          })
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando torneos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [q, provincia, deporte, estado, auth.token])

  const deportes = useMemo(() => {
    const set = new Set(items.map((i) => i.deporte).filter(Boolean))
    return Array.from(set).sort()
  }, [items])

  async function handleInscribir(torneo: Torneo) {
    if (!auth.token) {
      nav('/login', { state: { returnTo: '/torneos' } })
      return
    }

    // Los administradores no pueden inscribirse
    if (auth.user?.is_admin) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Acceso restringido',
        message: 'Los administradores no pueden inscribirse a torneos.',
      })
      return
    }

    // Verificar si ya está inscrito antes de intentar
    if (torneo.is_inscrito) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Ya estás inscrito',
        message: 'Ya estás inscrito en este torneo.',
      })
      return
    }

    setInscribiendo(torneo.id)
    setError(null)

    try {
      await apiFetch<{ data: Torneo; message: string }>(`/api/torneos/${torneo.id}/inscribir`, {
        method: 'POST',
      })

      // Actualizar inmediatamente el estado local para bloquear el botón
      setItems((prev) =>
        prev.map((t) => (t.id === torneo.id ? { ...t, is_inscrito: true, inscritos: t.inscritos + 1 } : t))
      )

      addMineId(torneo.id)

      // Mostrar modal de éxito
      setMessageModal({
        open: true,
        type: 'success',
        title: 'Inscripción exitosa',
        message: `Te has inscrito correctamente al torneo "${torneo.nombre}".`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al inscribirse'
      // Mostrar modal de error
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error al inscribirse',
        message: msg,
      })
    } finally {
      setInscribiendo(null)
    }
  }


  return (
    <div>
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Torneos (Comunidad Valenciana)</h2>
          <p className="pageSubtitle">Compite, sigue las fechas y encuentra tu torneo ideal.</p>
        </div>
        <Link className="btn btnGhost btnSmall" to="/mis-torneos">
          Mis torneos
        </Link>
      </div>

      <div className="toolbar toolbar3">
        <div className="field">
          <label className="label" htmlFor="q">
            Buscar
          </label>
          <input
            id="q"
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pádel, tenis, Valencia, Alicante…"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="provincia">
            Provincia
          </label>
          <select id="provincia" className="input" value={provincia} onChange={(e) => setProvincia(e.target.value)}>
            <option value="">Todas</option>
            {PROVINCIAS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="deporte">
            Deporte
          </label>
          <select id="deporte" className="input" value={deporte} onChange={(e) => setDeporte(e.target.value)}>
            <option value="">Todos</option>
            {deportes.map((d) => (
              <option key={d} value={d}>
                {formatDeporte(d)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="estado">
            Estado
          </label>
          <select id="estado" className="input" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="abierto">Abierto</option>
            <option value="cerrado">Cerrado</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      {loading ? <div className="muted">Cargando…</div> : null}
      {!loading && items.length === 0 ? <div className="muted">No hay torneos para esos filtros.</div> : null}

      <div className="gridCards">
        {items.map((t, idx) => {
          const plazas = Math.max(0, (t.cupo ?? 0) - (t.inscritos ?? 0))
          const isCompleto = plazas === 0 || t.estado === 'cerrado'
          const isInscribiendo = inscribiendo === t.id
          
          // Verificar si la fecha de inicio ya pasó o es hoy
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          const fechaInicio = new Date(t.fecha_inicio)
          fechaInicio.setHours(0, 0, 0, 0)
          const fechaYaPaso = fechaInicio <= hoy
          
          // Si la fecha ya pasó o es hoy, cerrar inscripciones
          const estadoFinal = fechaYaPaso || isCompleto ? 'cerrado' : t.estado
          const yaInscrito = t.is_inscrito === true
          const esAdmin = auth.user?.is_admin === true

          return (
            <div key={t.id} className="card" style={{ ['--stagger' as any]: idx }}>
              <div className="cardTop">
                <div className="badge">
                  {formatDeporte(t.deporte)}
                  {t.categoria ? ` · ${formatTipo(t.categoria)}` : ''}
                </div>
                <div className={`chip chip-${estadoFinal}`}>{formatEstado(estadoFinal)}</div>
              </div>

              <h3 className="cardTitle">{t.nombre}</h3>
              <p className="cardDesc">{t.descripcion || 'Torneo de la Comunidad Valenciana.'}</p>

              <div className="cardMeta" style={{ marginTop: 'auto' }}>
                <div>
                  {t.ciudad}, {t.provincia}
                  {t.sede ? ` · ${t.sede}` : ''}
                </div>
                <div>{formatRangoFechas(t.fecha_inicio, t.fecha_fin)}</div>
                <div>
                  Plazas: {t.inscritos}/{t.cupo} · {isCompleto ? 'Completo' : `${plazas} libres`}
                </div>
              </div>

              <div className="cardActions">
                <button
                  className={yaInscrito ? 'btn btnGhost' : 'btn btnPrimary'}
                  type="button"
                  disabled={yaInscrito || estadoFinal !== 'abierto' || isCompleto || isInscribiendo || fechaYaPaso || esAdmin}
                  onClick={() => void handleInscribir(t)}
                >
                  {isInscribiendo
                    ? 'Inscribiendo...'
                    : esAdmin
                    ? 'Solo usuarios'
                    : yaInscrito
                    ? 'Inscrito'
                    : fechaYaPaso
                    ? 'Inscripción cerrada'
                    : estadoFinal !== 'abierto'
                    ? 'Inscripción cerrada'
                    : isCompleto
                    ? 'Completo'
                    : 'Inscribirme'}
                </button>
                <button
                  className="btn btnGhost"
                  type="button"
                  onClick={() => {
                    setSelectedTorneo(t)
                    setModalOpen(true)
                  }}
                >
                  Ver detalle
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <TorneoModal
        open={modalOpen}
        torneo={selectedTorneo}
        onClose={() => {
          setModalOpen(false)
          setSelectedTorneo(null)
        }}
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

function addMineId(id: number) {
  try {
    const raw = localStorage.getItem(MY_KEY)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    const ids = new Set<number>(Array.isArray(arr) ? arr.map((x) => Number(x)) : [])
    ids.add(id)
    localStorage.setItem(MY_KEY, JSON.stringify(Array.from(ids).filter((n) => Number.isFinite(n) && n > 0)))
  } catch {
    // ignore
  }
}

function formatDeporte(deporte: string) {
  return deporte.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatTipo(tipo: string) {
  return tipo.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatEstado(estado: string) {
  if (estado === 'abierto') return 'Abierto'
  if (estado === 'cerrado') return 'Cerrado'
  if (estado === 'finalizado') return 'Finalizado'
  return formatTipo(estado)
}

function formatRangoFechas(a: string, b: string) {
  const da = new Date(a)
  const db = new Date(b)
  const same = da.toDateString() === db.toDateString()
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
  return same ? fmt(da) : `${fmt(da)} → ${fmt(db)}`
}


