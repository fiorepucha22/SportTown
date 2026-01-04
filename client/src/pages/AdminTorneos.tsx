import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useAuth } from '../state/AuthContext'
import { MaterialIcon } from '../components/MaterialIcon'

type Inscripcion = {
  inscripcion_id: number
  torneo: {
    id: number
    nombre: string
    deporte: string
    categoria: string | null
    fecha_inicio: string
    fecha_fin: string
    provincia: string
    ciudad: string
    estado: string
  }
  usuario: {
    id: number
    name: string
    email: string
  }
  fecha_inscripcion: string
}

type InscripcionesData = {
  total_inscripciones: number
  inscripciones: Inscripcion[]
  inscripciones_por_torneo: Array<{
    torneo: Inscripcion['torneo']
    total_inscritos: number
  }>
}

function formatDeporte(deporte: string) {
  return deporte.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminTorneos() {
  const auth = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<InscripcionesData | null>(null)

  useEffect(() => {
    if (!auth.token || !auth.user) {
      nav('/login', { replace: true })
      return
    }

    if (!auth.user.is_admin) {
      nav('/', { replace: true })
      return
    }

    async function loadInscripciones() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch<{ data: InscripcionesData }>('/api/admin/inscripciones-torneos')
        setData(res.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando inscripciones')
      } finally {
        setLoading(false)
      }
    }

    void loadInscripciones()
  }, [auth.token, auth.user, nav])

  if (loading) {
    return (
      <div className="adminLoading">
        <div className="spinner" />
        <div className="muted">Cargando inscripciones…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="adminError">
        <div className="alert alertError">{error}</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="adminPage">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Inscripciones de Torneos</h2>
          <p className="pageSubtitle">Gestiona todas las inscripciones de usuarios a los torneos</p>
        </div>
      </div>

      <div className="adminGrid" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="adminCard" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="adminCardIcon" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(178, 102, 255, 0.2), rgba(255, 79, 216, 0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MaterialIcon name="people" style={{ fontSize: '32px', color: 'rgba(178, 102, 255, 0.9)' }} />
          </div>
          <div className="adminCardMeta" style={{ flex: 1 }}>
            <div className="adminCardTitle" style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>Total Inscripciones</div>
            <div className="adminCardValue" style={{ fontSize: '32px', fontWeight: 900, color: 'rgba(255, 255, 255, 0.95)', lineHeight: 1, marginBottom: '6px' }}>{data.total_inscripciones.toLocaleString('es-ES')}</div>
            <div className="adminCardChange" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Usuarios inscritos en total</div>
          </div>
        </div>
        <div className="adminCard" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="adminCardIcon" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0, 119, 255, 0.2), rgba(178, 102, 255, 0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MaterialIcon name="emoji_events" style={{ fontSize: '32px', color: 'rgba(0, 119, 255, 0.9)' }} />
          </div>
          <div className="adminCardMeta" style={{ flex: 1 }}>
            <div className="adminCardTitle" style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>Torneos Activos</div>
            <div className="adminCardValue" style={{ fontSize: '32px', fontWeight: 900, color: 'rgba(255, 255, 255, 0.95)', lineHeight: 1, marginBottom: '6px' }}>{data.inscripciones_por_torneo.length}</div>
            <div className="adminCardChange" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Torneos con inscripciones</div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '28px', marginBottom: '24px', width: '100%', maxWidth: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <MaterialIcon name="list_alt" style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.8)' }} />
          <h3 className="panelTitle" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.95)' }}>Todas las Inscripciones</h3>
        </div>
        <div className="adminTableWrap" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table className="adminTable" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="adminTableHead" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <tr>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>ID</th>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Torneo</th>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Usuario</th>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Deporte</th>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Fechas</th>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Ubicación</th>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Estado</th>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Fecha Inscripción</th>
              </tr>
            </thead>
            <tbody className="adminTableBody">
              {data.inscripciones.length === 0 ? (
                <tr className="adminTableRow">
                  <td colSpan={8} className="adminTableCell" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <MaterialIcon name="inbox" style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px', display: 'block' }} />
                    <div className="muted" style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)' }}>No hay inscripciones registradas</div>
                  </td>
                </tr>
              ) : (
                data.inscripciones.map((inscripcion) => (
                  <tr key={inscripcion.inscripcion_id} className="adminTableRow" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', transition: 'background 200ms ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'var(--font-number)' }}>#{inscripcion.inscripcion_id}</td>
                    <td className="adminTableCell" style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', marginBottom: '4px', fontSize: '14px' }}>{inscripcion.torneo.nombre}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{formatDeporte(inscripcion.torneo.deporte)}</div>
                    </td>
                    <td className="adminTableCell" style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '4px', fontSize: '14px' }}>{inscripcion.usuario.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{inscripcion.usuario.email}</div>
                    </td>
                    <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {formatDeporte(inscripcion.torneo.deporte)}
                      {inscripcion.torneo.categoria && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: '6px' }}>· {inscripcion.torneo.categoria}</span>
                      )}
                    </td>
                    <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', whiteSpace: 'nowrap' }}>
                      {new Date(inscripcion.torneo.fecha_inicio).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                      })}
                      <span style={{ margin: '0 6px', color: 'rgba(255, 255, 255, 0.4)' }}>→</span>
                      {new Date(inscripcion.torneo.fecha_fin).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MaterialIcon name="location_on" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)' }} />
                        {inscripcion.torneo.ciudad}, {inscripcion.torneo.provincia}
                      </div>
                    </td>
                    <td className="adminTableCell" style={{ padding: '16px' }}>
                      <span className={`chip chip-${inscripcion.torneo.estado}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {inscripcion.torneo.estado}
                      </span>
                    </td>
                    <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap' }}>{formatFecha(inscripcion.fecha_inscripcion)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <MaterialIcon name="bar_chart" style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.8)' }} />
          <h3 className="panelTitle" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.95)' }}>Inscripciones por Torneo</h3>
        </div>
        <div className="adminTableWrap" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table className="adminTable" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="adminTableHead" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <tr>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Torneo</th>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Deporte</th>
                <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Fechas</th>
                <th className="adminTableHeader textRight" style={{ padding: '16px', textAlign: 'right', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Total Inscritos</th>
              </tr>
            </thead>
            <tbody className="adminTableBody">
              {data.inscripciones_por_torneo.length === 0 ? (
                <tr className="adminTableRow">
                  <td colSpan={4} className="adminTableCell" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <MaterialIcon name="emoji_events" style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px', display: 'block' }} />
                    <div className="muted" style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)' }}>No hay torneos con inscripciones</div>
                  </td>
                </tr>
              ) : (
                data.inscripciones_por_torneo.map((item) => (
                  <tr key={item.torneo.id} className="adminTableRow" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', transition: 'background 200ms ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="adminTableCell" style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', fontSize: '14px' }}>{item.torneo.nombre}</div>
                    </td>
                    <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>{formatDeporte(item.torneo.deporte)}</td>
                    <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MaterialIcon name="calendar_today" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)' }} />
                        {new Date(item.torneo.fecha_inicio).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                        <span style={{ margin: '0 6px', color: 'rgba(255, 255, 255, 0.4)' }}>→</span>
                        {new Date(item.torneo.fecha_fin).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="adminTableCell textRight" style={{ padding: '16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(178, 102, 255, 0.15)', padding: '8px 14px', borderRadius: '999px', fontWeight: 700, fontSize: '14px', color: 'rgba(255, 255, 255, 0.95)' }}>
                        <MaterialIcon name="people" style={{ fontSize: '18px' }} />
                        {item.total_inscritos}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

