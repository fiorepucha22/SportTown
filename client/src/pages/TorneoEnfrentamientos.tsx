import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { TorneoBracket } from '../components/TorneoBracket'
import { MaterialIcon } from '../components/MaterialIcon'

type Torneo = {
  id: number
  nombre: string
  deporte: string
  categoria?: string | null
  fecha_inicio: string
  fecha_fin: string
  provincia: string
  ciudad: string
  estado: string
}

export function TorneoEnfrentamientos() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [torneo, setTorneo] = useState<Torneo | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) {
        setError('ID de torneo no válido')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch<{ data: Torneo }>(`/api/torneos/${id}`)
        if (!cancelled) setTorneo(res.data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando torneo')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="centerWrap">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="muted" style={{ marginTop: '12px' }}>Cargando enfrentamientos...</p>
      </div>
    )
  }

  if (error || !torneo) {
    return (
      <div>
        <div className="alert alertError">{error || 'Torneo no encontrado'}</div>
        <div style={{ marginTop: '20px' }}>
          <Link className="btn btnPrimary" to="/torneos">
            Volver a Torneos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <button
              className="btn btnGhost btnSmall"
              type="button"
              onClick={() => navigate(-1)}
              style={{ padding: '8px 12px' }}
            >
              <MaterialIcon name="arrow_back" style={{ fontSize: '20px' }} />
            </button>
            <h2 className="pageTitle" style={{ margin: 0 }}>
              Cuadro de Enfrentamientos
            </h2>
          </div>
          <p className="pageSubtitle" style={{ marginLeft: '44px' }}>
            {torneo.nombre}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <TorneoBracket torneoId={torneo.id} />
      </div>
    </div>
  )
}

