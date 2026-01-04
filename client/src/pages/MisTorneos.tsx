import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useAuth } from '../state/AuthContext'
import { MessageModal } from '../components/MessageModal'
import { ConfirmModal } from '../components/ConfirmModal'

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
}

export function MisTorneos() {
  const auth = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Torneo[]>([])
  const [desinscribiendo, setDesinscribiendo] = useState<number | null>(null)
  const [messageModal, setMessageModal] = useState<{ open: boolean; type: 'success' | 'error'; title: string; message: string }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  })
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; torneo: Torneo | null }>({
    open: false,
    torneo: null,
  })

  useEffect(() => {
    if (!auth.token) {
      nav('/login', { state: { returnTo: '/mis-torneos' } })
      return
    }

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch<{ data: Torneo[] }>('/api/torneos/mis-torneos')
        setItems(res.data || [])
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Error cargando torneos'
        setError(errorMsg)
        console.error('Error loading mis torneos:', e)
        setItems([]) // Asegurar que items esté vacío en caso de error
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [auth.token, nav])

  function handleDesinscribirClick(torneo: Torneo) {
    setConfirmModal({
      open: true,
      torneo,
    })
  }

  async function handleDesinscribirConfirm() {
    if (!confirmModal.torneo) return

    const torneo = confirmModal.torneo
    setConfirmModal({ open: false, torneo: null })
    setDesinscribiendo(torneo.id)
    setError(null)

    try {
      await apiFetch<{ data: Torneo; message: string }>(`/api/torneos/${torneo.id}/desinscribir`, {
        method: 'POST',
      })

      // Eliminar de la lista
      setItems((prev) => prev.filter((t) => t.id !== torneo.id))
      
      // Mostrar modal de éxito
      setMessageModal({
        open: true,
        type: 'success',
        title: 'Desinscripción exitosa',
        message: `Te has desinscrito correctamente del torneo "${torneo.nombre}".`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al desinscribirse'
      // Mostrar modal de error
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error al desinscribirse',
        message: msg,
      })
    } finally {
      setDesinscribiendo(null)
    }
  }

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Mis torneos</h2>
          <p className="pageSubtitle">Torneos a los que te has inscrito.</p>
        </div>
        <Link className="btn btnGhost btnSmall" to="/torneos">
          Explorar torneos
        </Link>
      </div>

      {loading ? <div className="muted">Cargando…</div> : null}

      {!loading && !error && items.length === 0 ? (
        <div className="panel">
          <h3 className="pageTitle">Aún no estás inscrito</h3>
          <p className="pageSubtitle">Entra en Torneos y pulsa "Inscribirme" para añadirlo aquí.</p>
          <Link className="btn btnPrimary" to="/torneos">
            Ver torneos
          </Link>
        </div>
      ) : null}

      <div className="gridCards">
        {items.map((t, idx) => {
          const isDesinscribiendo = desinscribiendo === t.id
          return (
            <div key={t.id} className="card" style={{ ['--stagger' as any]: idx }}>
              <div className="cardTop">
                <div className="badge">
                  {formatDeporte(t.deporte)}
                  {t.categoria ? ` · ${formatTipo(t.categoria)}` : ''}
                </div>
                <div className={`chip chip-${t.estado}`}>{formatEstado(t.estado)}</div>
              </div>

              <h3 className="cardTitle">{t.nombre}</h3>
              <p className="cardDesc">{t.descripcion || 'Torneo de la Comunidad Valenciana.'}</p>

              <div className="cardMeta">
                <div>
                  {t.ciudad}, {t.provincia}
                  {t.sede ? ` · ${t.sede}` : ''}
                </div>
                <div>{formatRangoFechas(t.fecha_inicio, t.fecha_fin)}</div>
                <div>
                  Plazas: {t.inscritos}/{t.cupo} · {t.cupo - t.inscritos} libres
                </div>
              </div>

              <div className="cardActions">
                <Link className="btn btnGhost" to="/torneos">
                  Ver en torneos
                </Link>
                <button
                  className="btn btnGhost"
                  type="button"
                  disabled={isDesinscribiendo}
                  onClick={() => handleDesinscribirClick(t)}
                  style={isDesinscribiendo ? { opacity: 0.6 } : {}}
                >
                  {isDesinscribiendo ? 'Desinscribiendo...' : 'Desinscribirme'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <MessageModal
        open={messageModal.open}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
      />

      <ConfirmModal
        open={confirmModal.open}
        title="Confirmar desinscripción"
        message={confirmModal.torneo ? `¿Estás seguro de que quieres desinscribirte de "${confirmModal.torneo.nombre}"?` : ''}
        onConfirm={handleDesinscribirConfirm}
        onCancel={() => setConfirmModal({ open: false, torneo: null })}
        confirmText="Desinscribirme"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </div>
  )
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
