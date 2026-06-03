// Componente para visualizar el cuadro de enfrentamientos de un torneo
// Muestra rondas, partidos, resultados y campeón del torneo
import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { MaterialIcon } from './MaterialIcon'

type Props = {
  torneoId: number
}

type Partido = {
  id: number
  jugador1: string
  jugador1_id: number
  resultado1: number
  jugador2: string
  jugador2_id: number
  resultado2: number
  ganador: string
  ganador_id: number
  estado: string
}

type Ronda = {
  nombre: string
  ronda: string
  partidos: Partido[]
}

type BracketData = {
  torneo_id: number
  torneo_nombre: string
  bracket: {
    rounds: Ronda[]
    campeon: {
      nombre: string
      id: number
    }
  }
}

export function TorneoBracket({ torneoId }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<BracketData | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch<{ data: BracketData }>(`/api/torneos/${torneoId}/bracket`)
        if (!cancelled) setData(res.data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando cuadro de enfrentamientos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [torneoId])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="muted" style={{ marginTop: '12px' }}>Cargando cuadro de enfrentamientos...</p>
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

  if (!data || !data.bracket || !data.bracket.rounds || data.bracket.rounds.length === 0) {
    return (
      <div className="muted" style={{ padding: '20px', textAlign: 'center' }}>
        No hay datos de enfrentamientos disponibles aún.
      </div>
    )
  }

  const { rounds, campeon } = data.bracket

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 700 }}>Cuadro de Enfrentamientos</h3>

      {campeon && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.15))',
            border: '2px solid rgba(255, 215, 0, 0.4)',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          <MaterialIcon name="emoji_events" style={{ fontSize: '32px', color: '#FFD700', marginBottom: '8px' }} />
          <div style={{ fontWeight: 700, fontSize: '18px', color: 'rgba(255, 255, 255, 1)' }}>🏆 Campeón</div>
          <div style={{ fontWeight: 600, fontSize: '16px', color: 'rgba(255, 215, 0, 1)', marginTop: '4px' }}>{campeon.nombre}</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {rounds.map((ronda, rondaIdx) => (
          <div key={ronda.ronda} style={{ marginBottom: rondaIdx < rounds.length - 1 ? '24px' : '0' }}>
            <h4
              style={{
                fontSize: '16px',
                fontWeight: 700,
                marginBottom: '12px',
                color: 'rgba(178, 102, 255, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {ronda.nombre}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {ronda.partidos.map((partido) => {
                const jugador1Gano = partido.ganador === partido.jugador1
                return (
                  <div
                    key={partido.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(217, 217, 217, 0.14)',
                      borderRadius: '12px',
                      padding: '16px',
                      transition: 'all 200ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Jugador 1 */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          background: jugador1Gano ? 'rgba(82, 255, 184, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          borderRadius: '8px',
                          border: jugador1Gano ? '1px solid rgba(82, 255, 184, 0.3)' : '1px solid transparent',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: jugador1Gano ? 700 : 500,
                            color: jugador1Gano ? 'rgba(82, 255, 184, 1)' : 'rgba(255, 255, 255, 0.9)',
                            flex: 1,
                          }}
                        >
                          {partido.jugador1}
                        </span>
                        {partido.estado === 'finalizado' && (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '18px',
                              color: jugador1Gano ? 'rgba(82, 255, 184, 1)' : 'rgba(255, 255, 255, 0.6)',
                              minWidth: '30px',
                              textAlign: 'right',
                            }}
                          >
                            {partido.resultado1}
                          </span>
                        )}
                      </div>

                      {/* Separador VS */}
                      <div style={{ textAlign: 'center', padding: '4px 0', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', fontWeight: 700 }}>
                        VS
                      </div>

                      {/* Jugador 2 */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          background: !jugador1Gano ? 'rgba(82, 255, 184, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          borderRadius: '8px',
                          border: !jugador1Gano ? '1px solid rgba(82, 255, 184, 0.3)' : '1px solid transparent',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: !jugador1Gano ? 700 : 500,
                            color: !jugador1Gano ? 'rgba(82, 255, 184, 1)' : 'rgba(255, 255, 255, 0.9)',
                            flex: 1,
                          }}
                        >
                          {partido.jugador2}
                        </span>
                        {partido.estado === 'finalizado' && (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '18px',
                              color: !jugador1Gano ? 'rgba(82, 255, 184, 1)' : 'rgba(255, 255, 255, 0.6)',
                              minWidth: '30px',
                              textAlign: 'right',
                            }}
                          >
                            {partido.resultado2}
                          </span>
                        )}
                      </div>
                    </div>

                    {partido.estado === 'finalizado' && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Ganador: </span>
                        <span style={{ fontWeight: 700, color: 'rgba(178, 102, 255, 1)' }}>{partido.ganador}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="muted" style={{ marginTop: '16px', fontSize: '12px', fontStyle: 'italic' }}>
        * Datos de demostración. Los enfrentamientos se actualizarán cuando haya partidos registrados.
      </div>
    </div>
  )
}

