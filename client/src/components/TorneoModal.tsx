import { MaterialIcon } from './MaterialIcon'

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

type Props = {
  open: boolean
  torneo: Torneo | null
  onClose: () => void
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

function getDeporteIcon(deporte: string) {
  const icons: Record<string, string> = {
    padel: 'sports_tennis',
    tenis: 'sports_tennis',
    futbol_sala: 'sports_soccer',
    piscina: 'pool',
    gimnasio: 'fitness_center',
  }
  return icons[deporte] || 'stadium'
}

function formatRangoFechas(a: string, b: string) {
  const da = new Date(a)
  const db = new Date(b)
  const same = da.toDateString() === db.toDateString()
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
  return same ? fmt(da) : `${fmt(da)} → ${fmt(db)}`
}

export function TorneoModal({ open, torneo, onClose }: Props) {
  if (!open || !torneo) return null

  // Verificar si la fecha de inicio ya pasó o es hoy
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fechaInicio = new Date(torneo.fecha_inicio)
  fechaInicio.setHours(0, 0, 0, 0)
  const fechaYaPaso = fechaInicio <= hoy

  const plazas = Math.max(0, torneo.cupo - torneo.inscritos)
  const isCompleto = plazas === 0 || torneo.estado === 'cerrado'
  // Si la fecha ya pasó o es hoy, cerrar inscripciones
  const estadoFinal = fechaYaPaso || isCompleto ? 'cerrado' : torneo.estado

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <div className="modal modalInstalacion" role="dialog" aria-modal="true" aria-label="Detalles de torneo" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle">
              <MaterialIcon name={getDeporteIcon(torneo.deporte)} style={{ fontSize: '28px', marginRight: '12px', verticalAlign: 'middle' }} />
              {torneo.nombre}
            </div>
            <div className="modalSub">
              {formatDeporte(torneo.deporte)}
              {torneo.categoria ? ` · ${formatTipo(torneo.categoria)}` : ''}
            </div>
          </div>
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="modalBody">
          <div className="instalacionDetailGrid">
            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Descripción</h3>
              <p className="detailText">{torneo.descripcion || 'Sin descripción disponible.'}</p>
            </div>

            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Ubicación</h3>
              <p className="detailText">
                <MaterialIcon name="location_on" className="detailIcon" />
                {torneo.ciudad}, {torneo.provincia}
                {torneo.sede ? ` · ${torneo.sede}` : ''}
              </p>
            </div>

            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Fechas</h3>
              <p className="detailText">
                <MaterialIcon name="calendar_today" className="detailIcon" />
                {formatRangoFechas(torneo.fecha_inicio, torneo.fecha_fin)}
              </p>
            </div>

            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Plazas</h3>
              <div className="detailPrice">
                <span className="detailPriceValue">{torneo.inscritos}/{torneo.cupo}</span>
                <span className="detailPriceUnit">{isCompleto ? 'Completo' : `${plazas} libres`}</span>
              </div>
            </div>

            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Estado</h3>
              <div className="detailBadge">
                <span className={`chip chip-${estadoFinal}`}>{formatEstado(estadoFinal)}</span>
              </div>
            </div>

            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Deporte</h3>
              <div className="detailBadge">
                <MaterialIcon name={getDeporteIcon(torneo.deporte)} className="detailBadgeIcon" />
                {formatDeporte(torneo.deporte)}
                {torneo.categoria ? ` - ${formatTipo(torneo.categoria)}` : ''}
              </div>
            </div>
          </div>

          <div className="instalacionDetailFooter">
            <button className="btn btnPrimary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

