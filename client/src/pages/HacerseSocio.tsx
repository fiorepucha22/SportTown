import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { apiFetch } from '../lib/api'
import { MessageModal } from '../components/MessageModal'
import { ConfirmModal } from '../components/ConfirmModal'
import { PaymentModal } from '../components/PaymentModal'
import { MaterialIcon } from '../components/MaterialIcon'

type EstadoSocio = {
  es_socio: boolean
  fecha_inicio_socio: string | null
  fecha_fin_socio: string | null
  es_socio_activo: boolean
  suscripcion_cancelada: boolean
  puede_hacerse_socio: boolean
}

export function HacerseSocio() {
  const auth = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState<EstadoSocio | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [messageModal, setMessageModal] = useState<{
    open: boolean
    type: 'success' | 'error' | 'info'
    title: string
    message: string
  }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  })

  const PRECIO_SOCIO = 11.99

  useEffect(() => {
    if (!auth.token) {
      nav('/login', { state: { returnTo: '/hacerse-socio' } })
      return
    }

    if (auth.user?.is_admin) {
      nav('/')
      return
    }

    loadEstado()
  }, [auth.token, auth.user?.is_admin, nav])

  async function loadEstado() {
    setLoading(true)
    try {
      const res = await apiFetch<{ data: EstadoSocio }>('/api/socio/estado')
      setEstado(res.data)
    } catch (err) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Error al cargar el estado de socio',
      })
    } finally {
      setLoading(false)
    }
  }

  function handleHacerseSocio() {
    if (auth.user?.is_admin) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Acceso restringido',
        message: 'Los administradores no pueden hacerse socios.',
      })
      return
    }

    setPayOpen(true)
  }

  async function procesarPago(paymentId: string) {
    try {
      const res = await apiFetch<{ message: string; data: EstadoSocio }>('/api/socio/hacerse-socio', {
        method: 'POST',
        body: JSON.stringify({ payment_id: paymentId }),
      })
      setEstado(res.data)
      setPayOpen(false)
      setMessageModal({
        open: true,
        type: 'success',
        title: '¡Bienvenido como socio!',
        message: res.message,
      })
      // Recargar datos del usuario
      await auth.refresh()
    } catch (err) {
      setPayOpen(false)
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Error al hacerse socio',
      })
    }
  }

  async function handleCancelarSuscripcion() {
    setCanceling(true)
    try {
      const res = await apiFetch<{ message: string; data: EstadoSocio }>('/api/socio/cancelar-suscripcion', {
        method: 'POST',
      })
      setEstado(res.data)
      setCancelModalOpen(false)
      setMessageModal({
        open: true,
        type: 'success',
        title: 'Suscripción cancelada',
        message: res.message,
      })
      // Recargar datos del usuario
      await auth.refresh()
    } catch (err) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Error al cancelar la suscripción',
      })
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <div className="centerWrap">
        <div className="muted">Cargando…</div>
      </div>
    )
  }

  if (!estado) {
    return (
      <div className="centerWrap">
        <div className="panel">
          <h2 className="pageTitle">Hacerse Socio</h2>
          <p className="pageSubtitle">Error al cargar la información.</p>
          <Link className="btn btnPrimary" to="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const fechaFin = estado.fecha_fin_socio ? new Date(estado.fecha_fin_socio) : null
  const fechaFinFormateada = fechaFin
    ? fechaFin.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="centerWrap">
      <div className="panel" style={{ maxWidth: '600px' }}>
        <h2 className="pageTitle">Hacerse Socio</h2>
        <p className="pageSubtitle">
          Conviértete en socio de SportTown y disfruta de promociones y descuentos exclusivos.
        </p>

        {estado.es_socio_activo ? (
          <div className={`alert ${estado.suscripcion_cancelada ? 'alertError' : 'alertOk'}`} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <MaterialIcon 
                name={estado.suscripcion_cancelada ? 'cancel' : 'check_circle'} 
                style={{ fontSize: '24px', color: estado.suscripcion_cancelada ? '#f44336' : '#4caf50' }} 
              />
              <strong>{estado.suscripcion_cancelada ? 'Suscripción cancelada' : 'Eres socio activo'}</strong>
            </div>
            {fechaFinFormateada && (
              <p style={{ margin: 0, fontSize: '14px' }}>
                {estado.suscripcion_cancelada ? (
                  <>
                    Tu suscripción está cancelada pero seguirás disfrutando de los beneficios hasta el <strong>{fechaFinFormateada}</strong>.
                    Después de esa fecha, perderás el acceso a los descuentos exclusivos.
                  </>
                ) : (
                  <>
                    Tu suscripción es válida hasta el <strong>{fechaFinFormateada}</strong>.
                  </>
                )}
              </p>
            )}
          </div>
        ) : estado.es_socio ? (
          <div className="alert alertError" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <MaterialIcon name="warning" style={{ fontSize: '24px', color: '#f44336' }} />
              <strong>Suscripción vencida</strong>
            </div>
            {fechaFinFormateada && (
              <p style={{ margin: 0, fontSize: '14px' }}>
                Tu suscripción venció el <strong>{fechaFinFormateada}</strong>. Renueva tu membresía para seguir
                disfrutando de los beneficios.
              </p>
            )}
          </div>
        ) : null}

        <div style={{ marginBottom: '24px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>Beneficios de ser socio:</h3>
          <ul style={{ margin: 0, paddingLeft: '24px', lineHeight: '1.8' }}>
            <li>Descuentos exclusivos en instalaciones (15% de descuento)</li>
            <li>Promociones especiales en torneos</li>
            <li>Acceso prioritario a nuevas instalaciones</li>
            <li>Suscripción mensual renovable</li>
            <li>
              <strong>Reembolso del 100%</strong> al cancelar reservas (los no socios reciben solo el 50%)
            </li>
          </ul>
        </div>

        {estado.puede_hacerse_socio && (
          <div>
            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <MaterialIcon name="info" style={{ fontSize: '20px', color: 'var(--st-electric-blue)' }} />
                <strong>Precio: {PRECIO_SOCIO.toFixed(2)}€/mes</strong>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                La suscripción es mensual y se renovará automáticamente. Disfruta de descuentos exclusivos en todas las instalaciones.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button className="btn btnPrimary btnLarge" type="button" onClick={handleHacerseSocio} disabled={auth.loading}>
                {estado.es_socio_activo ? 'Renovar suscripción' : 'Hacerse socio'}
              </button>
              
              {estado.es_socio_activo && !estado.suscripcion_cancelada && (
                <button 
                  className="btn btnGhost" 
                  type="button" 
                  onClick={() => setCancelModalOpen(true)}
                  disabled={auth.loading}
                  style={{ color: '#f44336' }}
                >
                  <MaterialIcon name="cancel" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }} />
                  Cancelar suscripción
                </button>
              )}
            </div>
          </div>
        )}

        <div className="muted" style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/">Volver al inicio</Link>
        </div>
      </div>

      <MessageModal
        open={messageModal.open}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
      />

      <PaymentModal
        open={payOpen}
        title="Pagar suscripción de socio"
        amountEur={PRECIO_SOCIO}
        description={`Suscripción mensual SportTown · ${estado?.es_socio_activo ? 'Renovación' : 'Nueva suscripción'}`}
        onCancel={() => setPayOpen(false)}
        onSuccess={(paidId) => void procesarPago(paidId)}
      />

      <ConfirmModal
        open={cancelModalOpen}
        title="Cancelar suscripción"
        message={
          fechaFinFormateada
            ? `¿Estás seguro de que deseas cancelar tu suscripción? Podrás seguir disfrutando de los beneficios hasta el ${fechaFinFormateada}. Después de esa fecha, perderás el acceso a los descuentos exclusivos.`
            : '¿Estás seguro de que deseas cancelar tu suscripción? Podrás seguir disfrutando de los beneficios hasta que expire tu suscripción actual.'
        }
        onConfirm={handleCancelarSuscripcion}
        onCancel={() => setCancelModalOpen(false)}
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        confirmVariant="danger"
      />
    </div>
  )
}

