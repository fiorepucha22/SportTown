import { MaterialIcon } from './MaterialIcon'

type Props = {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
}

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
}: Props) {
  if (!open) return null

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MaterialIcon name="help_outline" style={{ fontSize: '28px', color: '#ff9800' }} />
              {title}
            </div>
          </div>
          <button className="iconBtn" type="button" onClick={onCancel} aria-label="Cerrar">
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="modalBody">
          <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px 0', color: 'var(--text-secondary)' }}>
            {message}
          </p>

          <div className="instalacionDetailFooter" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btnGhost" onClick={onCancel}>
              {cancelText}
            </button>
            <button
              className="btn btnPrimary"
              onClick={onConfirm}
              style={confirmVariant === 'danger' ? { background: 'linear-gradient(90deg, #f44336, #d32f2f)' } : undefined}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

