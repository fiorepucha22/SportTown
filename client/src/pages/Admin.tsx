import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useAuth } from '../state/AuthContext'
import { MaterialIcon } from '../components/MaterialIcon'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

type StatsData = {
  total_reservas: number
  total_ganancias: number
  reservas_por_dia: Array<{ dia: string; cantidad: number; ganancias: number }>
  reservas_por_instalacion: Array<{ instalacion: string; cantidad: number; ganancias: number }>
  ganancias_por_mes: Array<{ periodo: string; ganancias: number }>
  todas_reservas: Array<{
    id: number
    instalacion: string
    tipo: string
    usuario: string
    email: string
    fecha: string
    hora_inicio: string
    hora_fin: string
    precio_total: number
    estado: string
    created_at: string
  }>
}

const CHART_COLORS = {
  primary: '#B266FF',
  secondary: '#FF4FD8',
  success: '#52FFB8',
  accent: '#0077FF',
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
  } catch {
    return dateStr
  }
}

function formatMonth(periodo: string): string {
  try {
    const [year, month] = periodo.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    return new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }).format(date)
  } catch {
    return periodo
  }
}

export function Admin() {
  const auth = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    if (!auth.token || !auth.user) {
      nav('/login', { replace: true })
      return
    }

    if (!auth.user.is_admin) {
      nav('/', { replace: true })
      return
    }

    async function loadStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch<{ data: StatsData }>('/api/admin/stats')
        setStats(res.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando estadísticas')
      } finally {
        setLoading(false)
      }
    }

    void loadStats()
  }, [auth.token, auth.user, nav])

  const metrics = useMemo(() => {
    if (!stats) return null

    const reservasEsteMes = stats.todas_reservas.filter((r) => {
      const fecha = new Date(r.fecha)
      const ahora = new Date()
      return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
    }).length

    const gananciasEsteMes = reservasEsteMes
      ? reservasEsteMes * (stats.total_ganancias / Math.max(stats.total_reservas, 1))
      : 0

    const promedioPorReserva = stats.total_reservas > 0 ? stats.total_ganancias / stats.total_reservas : 0

    return {
      totalReservas: stats.total_reservas,
      totalGanancias: stats.total_ganancias,
      reservasEsteMes,
      gananciasEsteMes,
      promedioPorReserva,
    }
  }, [stats])

  if (loading) {
    return (
      <div className="adminLoading">
        <div className="adminSpinner" />
        <div className="muted" style={{ marginTop: '16px' }}>Cargando estadísticas…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <div className="alert alertError">{error}</div>
      </div>
    )
  }

  if (!stats || !metrics) return null

  return (
    <div className="adminPage">
      <div className="adminHeader">
        <div>
          <h1 className="adminTitle">Panel de Administración</h1>
          <p className="adminSubtitle">Gestión y análisis de reservas</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="adminMetrics">
        <div className="metricCard metricCardPrimary">
          <div className="metricIcon">
            <MaterialIcon name="bar_chart" style={{ fontSize: '32px' }} />
          </div>
          <div className="metricContent">
            <div className="metricLabel">Total Reservas</div>
            <div className="metricValue">{metrics.totalReservas.toLocaleString('es-ES')}</div>
            <div className="metricChange">
              {metrics.reservasEsteMes > 0 ? `+${metrics.reservasEsteMes} este mes` : 'Sin reservas este mes'}
            </div>
          </div>
        </div>

        <div className="metricCard metricCardSuccess">
          <div className="metricIcon">
            <MaterialIcon name="payments" style={{ fontSize: '32px' }} />
          </div>
          <div className="metricContent">
            <div className="metricLabel">Total Ganancias</div>
            <div className="metricValue">{metrics.totalGanancias.toFixed(2)}€</div>
            <div className="metricChange">
              {metrics.gananciasEsteMes > 0
                ? `+${metrics.gananciasEsteMes.toFixed(2)}€ este mes`
                : 'Sin ganancias este mes'}
            </div>
          </div>
        </div>

        <div className="metricCard metricCardAccent">
          <div className="metricIcon">
            <MaterialIcon name="trending_up" style={{ fontSize: '32px' }} />
          </div>
          <div className="metricContent">
            <div className="metricLabel">Promedio por Reserva</div>
            <div className="metricValue">{metrics.promedioPorReserva.toFixed(2)}€</div>
            <div className="metricChange">Ticket promedio</div>
          </div>
        </div>

        <div className="metricCard metricCardSecondary">
          <div className="metricIcon">
            <MaterialIcon name="calendar_today" style={{ fontSize: '32px' }} />
          </div>
          <div className="metricContent">
            <div className="metricLabel">Reservas Este Mes</div>
            <div className="metricValue">{metrics.reservasEsteMes}</div>
            <div className="metricChange">Últimos 30 días</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="adminCharts">
        {stats.reservas_por_dia.length > 0 && (
          <div className="adminChartCard">
            <div className="chartHeader">
              <h3 className="chartTitle">Reservas y Ganancias Diarias</h3>
              <span className="chartSubtitle">Últimos 30 días</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={stats.reservas_por_dia}>
                <defs>
                  <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis
                  dataKey="dia"
                  stroke="rgba(255, 255, 255, 0.5)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => {
                    try {
                      const date = new Date(value)
                      return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(date)
                    } catch {
                      return value
                    }
                  }}
                />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 15, 44, 0.98)',
                    border: '1px solid rgba(178, 102, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: any, name: any) => {
                    if (value == null || name == null) return ['', '']
                    if (name === 'Ganancias') return [`${Number(value).toFixed(2)}€`, name]
                    return [value, name]
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={(value) => (value === 'Ganancias' ? 'Ganancias (€)' : value)}
                />
                <Area
                  type="monotone"
                  dataKey="cantidad"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={3}
                  fill="url(#colorReservas)"
                  name="Reservas"
                />
                <Area
                  type="monotone"
                  dataKey="ganancias"
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={3}
                  fill="url(#colorGanancias)"
                  name="Ganancias"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats.reservas_por_instalacion.length > 0 && (
          <div className="adminChartCard">
            <div className="chartHeader">
              <h3 className="chartTitle">Rendimiento por Instalación</h3>
              <span className="chartSubtitle">Cantidad y ganancias</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.reservas_por_instalacion}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis
                  dataKey="instalacion"
                  stroke="rgba(255, 255, 255, 0.5)"
                  style={{ fontSize: '12px' }}
                  angle={-35}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 15, 44, 0.98)',
                    border: '1px solid rgba(178, 102, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                  formatter={(value: any, name: any) => {
                    if (value == null || name == null) return ['', '']
                    if (name === 'Ganancias') return [`${Number(value).toFixed(2)}€`, name]
                    return [value, name]
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={(value) => (value === 'Ganancias' ? 'Ganancias (€)' : value)}
                />
                <Bar dataKey="cantidad" fill={CHART_COLORS.primary} name="Cantidad" radius={[8, 8, 0, 0]} />
                <Bar dataKey="ganancias" fill={CHART_COLORS.secondary} name="Ganancias" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats.ganancias_por_mes.length > 0 && (
          <div className="adminChartCard">
            <div className="chartHeader">
              <h3 className="chartTitle">Ganancias Mensuales</h3>
              <span className="chartSubtitle">Últimos 12 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.ganancias_por_mes}>
                <defs>
                  <linearGradient id="colorGananciasMes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis
                  dataKey="periodo"
                  stroke="rgba(255, 255, 255, 0.5)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={formatMonth}
                />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 15, 44, 0.98)',
                    border: '1px solid rgba(82, 255, 184, 0.3)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                  labelFormatter={(value) => formatMonth(value)}
                  formatter={(value: number | undefined) =>
                    value != null ? [`${value.toFixed(2)}€`, 'Ganancias'] : ['', '']
                  }
                />
                <Bar dataKey="ganancias" fill="url(#colorGananciasMes)" name="Ganancias (€)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabla de reservas */}
      <div className="adminTableCard">
        <div className="tableHeader">
          <h3 className="tableTitle">Historial de Reservas</h3>
          <span className="tableSubtitle">{stats.todas_reservas.length} reservas totales</span>
        </div>
        <div className="tableWrapper">
          <table className="adminTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Instalación</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th className="textRight">Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {stats.todas_reservas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="tableEmpty">
                    No hay reservas registradas
                  </td>
                </tr>
              ) : (
                stats.todas_reservas.map((reserva) => (
                  <tr key={reserva.id}>
                    <td className="tableId">#{reserva.id}</td>
                    <td>
                      <div className="tableInstalacion">{reserva.instalacion}</div>
                      <div className="tableTipo">{reserva.tipo}</div>
                    </td>
                    <td>
                      <div className="tableUsuario">{reserva.usuario}</div>
                      <div className="tableEmail">{reserva.email}</div>
                    </td>
                    <td className="tableDate">{formatDate(reserva.fecha)}</td>
                    <td className="tableTime">
                      {reserva.hora_inicio.slice(0, 5)} - {reserva.hora_fin.slice(0, 5)}
                    </td>
                    <td className="tablePrice textRight">{reserva.precio_total.toFixed(2)}€</td>
                    <td>
                      <span className={`statusBadge status${reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}`}>
                        {reserva.estado}
                      </span>
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
