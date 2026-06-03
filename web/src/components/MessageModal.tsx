// Modal para mostrar mensajes al usuario (éxito, error o información)
// Muestra icono y color según el tipo de mensaje
import { MaterialIcon } from './MaterialIcon'

type Props = {
  open: boolean
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  onClose: () => void
}

export function MessageModal({ open, type, title, message, onClose }: Props) {
  if (!open) return null

  const iconName = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'
  const iconColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MaterialIcon name={iconName} style={{ fontSize: '28px', color: iconColor }} />
              {title}
            </div>
          </div>
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="modalBody">
          <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px 0', color: 'var(--text-secondary)' }}>
            {message}
          </p>

          <div className="instalacionDetailFooter">
            <button className="btn btnPrimary" onClick={onClose}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

