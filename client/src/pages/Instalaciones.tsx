import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { InstalacionModal } from '../components/InstalacionModal'

export type Instalacion = {
  id: number
  nombre: string
  tipo: string
  descripcion?: string | null
  ubicacion?: string | null
  precio_por_hora: string
  activa?: boolean
}

export function Instalaciones() {
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Instalacion[]>([])
  const [selectedInstalacion, setSelectedInstalacion] = useState<Instalacion | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (q.trim()) params.set('q', q.trim())
        if (tipo) params.set('tipo', tipo)
        const qs = params.toString()

        const res = await apiFetch<{ data: Instalacion[] }>(`/api/instalaciones${qs ? `?${qs}` : ''}`)
        if (!cancelled) setItems(res.data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando instalaciones')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [q, tipo])

  const tipos = useMemo(() => {
    const set = new Set(items.map((i) => i.tipo).filter(Boolean))
    return Array.from(set).sort()
  }, [items])

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Instalaciones</h2>
          <p className="pageSubtitle">Elige tu instalación y reserva en segundos.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="field">
          <label className="label" htmlFor="q">
            Buscar
          </label>
          <input
            id="q"
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pádel, tenis, piscina…"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="tipo">
            Tipo
          </label>
          <select id="tipo" className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {formatTipo(t)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="alert alertError">{error}</div> : null}

      {loading ? <div className="muted">Cargando…</div> : null}

      {!loading && items.length === 0 ? <div className="muted">No hay instalaciones para esos filtros.</div> : null}

      <div className="gridCards">
        {items.map((i, idx) => (
          <div key={i.id} className="card" style={{ ['--stagger' as any]: idx }}>
            <div className="cardTop">
              <div className="badge">{formatTipo(i.tipo)}</div>
              <div className="price">
                <span className="priceNumber">{Number(i.precio_por_hora).toFixed(2)}€</span>
                <span className="priceUnit">/hora</span>
              </div>
            </div>

            <h3 className="cardTitle">{i.nombre}</h3>
            <p className="cardDesc">{i.descripcion || 'Sin descripción'}</p>

            <div className="cardMeta">{i.ubicacion ? `Ubicación: ${i.ubicacion}` : 'Ubicación no especificada'}</div>

            <div className="cardActions">
              <Link className="btn btnPrimary" to={`/reservar/${i.id}`}>
                Reservar
              </Link>
              <button
                className="btn btnGhost"
                type="button"
                onClick={() => {
                  setSelectedInstalacion(i)
                  setModalOpen(true)
                }}
              >
                Ver detalle
              </button>
            </div>
          </div>
        ))}
      </div>

      <InstalacionModal
        open={modalOpen}
        instalacion={selectedInstalacion}
        onClose={() => {
          setModalOpen(false)
          setSelectedInstalacion(null)
        }}
      />
    </div>
  )
}

function formatTipo(tipo: string) {
  return tipo.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}


