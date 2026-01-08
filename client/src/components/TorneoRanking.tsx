// Componente para mostrar el ranking de jugadores de un torneo
// Muestra posición, puntos, partidos jugados/ganados/perdidos y win rate
import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { MaterialIcon } from './MaterialIcon'

type Props = {
  torneoId: number // ID del torneo para cargar su ranking
}

// Estructura de datos de una entrada en el ranking
type RankingEntry = {
  posicion: number
  jugador_id: number
  jugador_nombre: string
  puntos: number
  partidos_jugados: number
  partidos_ganados: number
  partidos_perdidos: number
  win_rate: number // Porcentaje de victorias
}

// Estructura de datos completa del ranking
type RankingData = {
  torneo_id: number
  torneo_nombre: string
  ranking: RankingEntry[]
}

export function TorneoRanking({ torneoId }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RankingData | null>(null)

  // Carga el ranking del torneo desde la API
  // Usa flag 'cancelled' para evitar actualizaciones si el componente se desmonta
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch<{ data: RankingData }>(`/api/torneos/${torneoId}/ranking`)
        if (!cancelled) setData(res.data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando ranking')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true // Cancela la actualización si el componente se desmonta
    }
  }, [torneoId])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="muted" style={{ marginTop: '12px' }}>Cargando ranking...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alertError" style={{ margin: '20px 0' }}>
        {error}
      </div>
    )
  }

  // Estado vacío: no hay datos de ranking disponibles
  if (!data || !data.ranking || data.ranking.length === 0) {
    return (
      <div className="muted" style={{ padding: '20px', textAlign: 'center' }}>
        No hay datos de ranking disponibles aún.
      </div>
    )
  }

  // Retorna el icono de medalla según la posición (oro, plata, bronce)
  const getMedalIcon = (posicion: number) => {
    if (posicion === 1) return <MaterialIcon name="emoji_events" style={{ color: '#FFD700', fontSize: '24px' }} />
    if (posicion === 2) return <MaterialIcon name="emoji_events" style={{ color: '#C0C0C0', fontSize: '24px' }} />
    if (posicion === 3) return <MaterialIcon name="emoji_events" style={{ color: '#CD7F32', fontSize: '24px' }} />
    return null
  }

  return (
    <div style={{ marginTop: '12px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 700 }}>Ranking de Jugadores</h3>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: 'rgba(178, 102, 255, 0.15)', borderBottom: '2px solid rgba(178, 102, 255, 0.3)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.9)' }}>Pos.</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.9)' }}>Jugador</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.9)' }}>Puntos</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.9)' }}>PJ</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.9)' }}>PG</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.9)' }}>PP</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.9)' }}>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {/* Renderiza cada entrada del ranking con estilos especiales para los top 3 */}
            {data.ranking.map((entry, idx) => (
              <tr
                key={entry.jugador_id}
                style={{
                  borderBottom: idx < data.ranking.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                  background: entry.posicion <= 3 ? 'rgba(178, 102, 255, 0.08)' : 'transparent', // Destaca los top 3
                }}
              >
                <td style={{ padding: '12px', fontWeight: 700, color: entry.posicion <= 3 ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.8)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getMedalIcon(entry.posicion)}
                    <span>{entry.posicion}º</span>
                  </div>
                </td>
                <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>{entry.jugador_nombre}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: 'rgba(178, 102, 255, 1)' }}>{entry.puntos}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)' }}>{entry.partidos_jugados}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: 'rgba(82, 255, 184, 0.9)' }}>{entry.partidos_ganados}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: 'rgba(255, 79, 216, 0.9)' }}>{entry.partidos_perdidos}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
                  {entry.win_rate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="muted" style={{ marginTop: '8px', fontSize: '11px', fontStyle: 'italic' }}>
        * Datos de demostración
      </div>
    </div>
  )
}

