// Modal para mostrar detalles completos de una instalación deportiva
// Muestra información: descripción, ubicación, precio, tipo y estado
import type { Instalacion } from '../pages/Instalaciones'
import { MaterialIcon } from './MaterialIcon'

type Props = {
  open: boolean
  instalacion: Instalacion | null
  onClose: () => void
}

function formatTipo(tipo: string) {
  return tipo.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function getTipoIcon(tipo: string) {
  const icons: Record<string, string> = {
    padel: 'sports_tennis',
    tenis: 'sports_tennis',
    futbol_sala: 'sports_soccer',
    piscina: 'pool',
    gimnasio: 'fitness_center',
  }
  return icons[tipo] || 'stadium'
}

export function InstalacionModal({ open, instalacion, onClose }: Props) {
  if (!open || !instalacion) return null

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <div className="modal modalInstalacion" role="dialog" aria-modal="true" aria-label="Detalles de instalación" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle">
              <MaterialIcon name={getTipoIcon(instalacion.tipo)} style={{ fontSize: '28px', marginRight: '12px', verticalAlign: 'middle' }} />
              {instalacion.nombre}
            </div>
            <div className="modalSub">{formatTipo(instalacion.tipo)}</div>
          </div>
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="modalBody">
          <div className="instalacionDetailGrid">
            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Descripción</h3>
              <p className="detailText">{instalacion.descripcion || 'Sin descripción disponible.'}</p>
            </div>

            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Ubicación</h3>
              <p className="detailText">
                <MaterialIcon name="location_on" className="detailIcon" />
                {instalacion.ubicacion || 'Ubicación no especificada'}
              </p>
            </div>

            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Precio</h3>
              <div className="detailPrice">
                <span className="detailPriceValue">{Number(instalacion.precio_por_hora).toFixed(2)}€</span>
                <span className="detailPriceUnit">por hora</span>
              </div>
            </div>

            <div className="instalacionDetailSection">
              <h3 className="detailSectionTitle">Tipo de Instalación</h3>
              <div className="detailBadge">
                <MaterialIcon name={getTipoIcon(instalacion.tipo)} className="detailBadgeIcon" />
                {formatTipo(instalacion.tipo)}
              </div>
            </div>
          </div>

          {instalacion.activa ? (
            <div className="instalacionDetailFooter">
              <button className="btn btnPrimary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          ) : (
            <div className="alert alertError" style={{ marginTop: '20px' }}>
              Esta instalación no está disponible actualmente.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

