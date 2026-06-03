import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useAuth } from '../state/AuthContext'
import { MaterialIcon } from '../components/MaterialIcon'
import { MessageModal } from '../components/MessageModal'
import { ConfirmModal } from '../components/ConfirmModal'
import { TorneoFormModal } from '../components/TorneoFormModal'

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
  activo: boolean
  created_at: string
  updated_at: string
}

function formatDeporte(deporte: string) {
  return deporte.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatEstado(estado: string) {
  if (estado === 'abierto') return 'Abierto'
  if (estado === 'cerrado') return 'Cerrado'
  if (estado === 'finalizado') return 'Finalizado'
  return estado
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function AdminGestionTorneos() {
  const auth = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [torneos, setTorneos] = useState<Torneo[]>([])
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingTorneo, setEditingTorneo] = useState<Torneo | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; torneo: Torneo | null }>({
    open: false,
    torneo: null,
  })
  const [messageModal, setMessageModal] = useState<{ open: boolean; type: 'success' | 'error'; title: string; message: string }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  })
  const [_deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!auth.token || !auth.user) {
      nav('/login', { replace: true })
      return
    }

    if (!auth.user.is_admin) {
      nav('/', { replace: true })
      return
    }

    loadTorneos()
  }, [auth.token, auth.user, nav])

  async function loadTorneos() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch<{ data: Torneo[] }>('/api/admin/torneos')
      setTorneos(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando torneos')
    } finally {
      setLoading(false)
    }
  }

  function handleCreate() {
    setEditingTorneo(null)
    setFormModalOpen(true)
  }

  function handleEdit(torneo: Torneo) {
    // Calcular estado para verificar si está finalizado
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaFin = new Date(torneo.fecha_fin)
    fechaFin.setHours(0, 0, 0, 0)
    
    if (fechaFin < hoy) {
      // No permitir editar torneos finalizados
      setMessageModal({
        open: true,
        type: 'error',
        title: 'No se puede editar',
        message: 'Los torneos finalizados no se pueden editar. Solo se pueden eliminar.',
      })
      return
    }
    
    setEditingTorneo(torneo)
    setFormModalOpen(true)
  }

  function handleDeleteClick(torneo: Torneo) {
    setDeleteModal({ open: true, torneo })
  }

  async function handleDeleteConfirm() {
    if (!deleteModal.torneo) return

    setDeleting(true)
    try {
      await apiFetch(`/api/admin/torneos/${deleteModal.torneo.id}`, {
        method: 'DELETE',
      })
      setMessageModal({
        open: true,
        type: 'success',
        title: 'Éxito',
        message: 'Torneo eliminado correctamente',
      })
      setDeleteModal({ open: false, torneo: null })
      await loadTorneos()
    } catch (err) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Error al eliminar torneo',
      })
    } finally {
      setDeleting(false)
    }
  }

  async function handleFormSubmit(torneoData: Partial<Torneo>) {
    try {
      if (editingTorneo) {
        await apiFetch(`/api/admin/torneos/${editingTorneo.id}`, {
          method: 'PUT',
          body: JSON.stringify(torneoData),
        })
        setMessageModal({
          open: true,
          type: 'success',
          title: 'Éxito',
          message: 'Torneo actualizado correctamente',
        })
      } else {
        await apiFetch('/api/admin/torneos', {
          method: 'POST',
          body: JSON.stringify(torneoData),
        })
        setMessageModal({
          open: true,
          type: 'success',
          title: 'Éxito',
          message: 'Torneo creado correctamente',
        })
      }
      setFormModalOpen(false)
      setEditingTorneo(null)
      await loadTorneos()
    } catch (err) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Error al guardar torneo',
      })
    }
  }

  if (loading) {
    return (
      <div className="adminLoading">
        <div className="spinner" />
        <div className="muted">Cargando torneos…</div>
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

  return (
    <div className="adminPage">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Gestión de Torneos</h2>
          <p className="pageSubtitle">Crea, edita y elimina torneos del sistema</p>
        </div>
        <button className="btn btnPrimary" onClick={handleCreate}>
          <MaterialIcon name="add" style={{ fontSize: '18px' }} />
          Crear Torneo
        </button>
      </div>

      {torneos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <MaterialIcon name="emoji_events" style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px', display: 'block' }} />
          <div className="muted" style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '24px' }}>
            No hay torneos registrados
          </div>
          <button className="btn btnPrimary" onClick={handleCreate}>
            Crear primer torneo
          </button>
        </div>
      ) : (
        <>
          {/* Vista de tabla para desktop */}
          <div className="panel" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: 'none', display: 'block' }}>
            <div className="adminTableWrap" style={{ borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <table className="adminTable" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead className="adminTableHead" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <tr>
                  <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', width: '22%' }}>Nombre</th>
                  <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', width: '12%' }}>Deporte</th>
                  <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', width: '16%' }}>Fechas</th>
                  <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', width: '22%' }}>Ubicación</th>
                  <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'center', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', width: '8%' }}>Plazas</th>
                  <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'center', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', width: '10%' }}>Estado</th>
                  <th className="adminTableHeader" style={{ padding: '16px', textAlign: 'center', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', width: '10%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody className="adminTableBody">
                {torneos.map((torneo) => {
                  // Calcular estado basado en fechas (redundante pero para consistencia en frontend)
                  const hoy = new Date()
                  hoy.setHours(0, 0, 0, 0)
                  const fechaInicio = new Date(torneo.fecha_inicio)
                  fechaInicio.setHours(0, 0, 0, 0)
                  const fechaFin = new Date(torneo.fecha_fin)
                  fechaFin.setHours(0, 0, 0, 0)
                  
                  let estadoFinal = torneo.estado
                  // Si la fecha de fin ya pasó, el torneo está finalizado
                  if (fechaFin < hoy) {
                    estadoFinal = 'finalizado'
                  }
                  // Si la fecha de inicio ya pasó pero la fecha fin no, cerrar inscripciones
                  else if (fechaInicio <= hoy && estadoFinal === 'abierto') {
                    estadoFinal = 'cerrado'
                  }
                  
                  return (
                    <tr key={torneo.id} className="adminTableRow" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', transition: 'background 200ms ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td className="adminTableCell" style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', fontSize: '14px', marginBottom: '4px', wordBreak: 'break-word' }}>{torneo.nombre}</div>
                        {torneo.descripcion && (
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', wordBreak: 'break-word' }}>{torneo.descripcion.substring(0, 60)}{torneo.descripcion.length > 60 ? '...' : ''}</div>
                        )}
                      </td>
                      <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', verticalAlign: 'middle', wordBreak: 'break-word' }}>
                        {formatDeporte(torneo.deporte)}
                        {torneo.categoria && (
                          <span style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: '6px' }}>· {torneo.categoria}</span>
                        )}
                      </td>
                      <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', verticalAlign: 'middle', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minWidth: 0 }}>
                          <MaterialIcon name="calendar_today" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)', flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)', whiteSpace: 'nowrap' }}>{formatFecha(torneo.fecha_inicio)}</span>
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)', whiteSpace: 'nowrap' }}>{formatFecha(torneo.fecha_fin)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', verticalAlign: 'top', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minWidth: 0 }}>
                          <MaterialIcon name="location_on" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)', flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)', whiteSpace: 'nowrap' }}>{torneo.ciudad}, {torneo.provincia}</span>
                            {torneo.sede && (
                              <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', whiteSpace: 'nowrap' }}>{torneo.sede}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="adminTableCell" style={{ padding: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center' }}>
                        {torneo.inscritos}/{torneo.cupo}
                      </td>
                      <td className="adminTableCell" style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span className={`chip chip-${estadoFinal}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {formatEstado(estadoFinal)}
                          </span>
                          {!torneo.activo && (
                            <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: 'rgba(255, 0, 0, 0.2)', color: 'rgba(255, 0, 0, 0.9)' }}>
                              Inactivo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="adminTableCell" style={{ padding: '16px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            className="btn btnGhost btnSmall"
                            type="button"
                            onClick={() => handleEdit(torneo)}
                            disabled={estadoFinal === 'finalizado'}
                            style={{ 
                              padding: '8px',
                              minWidth: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: estadoFinal === 'finalizado' ? 0.5 : 1,
                              cursor: estadoFinal === 'finalizado' ? 'not-allowed' : 'pointer',
                              borderRadius: '50%'
                            }}
                            title={estadoFinal === 'finalizado' ? 'Los torneos finalizados no se pueden editar' : 'Editar'}
                          >
                            <MaterialIcon name="edit" style={{ fontSize: '18px' }} />
                          </button>
                          <button
                            className="btn btnGhost btnSmall"
                            type="button"
                            onClick={() => handleDeleteClick(torneo)}
                            style={{ 
                              padding: '8px',
                              minWidth: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#f44336',
                              borderRadius: '50%'
                            }}
                            title="Eliminar"
                          >
                            <MaterialIcon name="delete" style={{ fontSize: '18px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

          {/* Vista de cards para móviles */}
          <div className="adminTableWrap mobileCards" style={{ display: 'none' }}>
            {torneos.map((torneo) => {
              const hoy = new Date()
              hoy.setHours(0, 0, 0, 0)
              const fechaInicio = new Date(torneo.fecha_inicio)
              fechaInicio.setHours(0, 0, 0, 0)
              const fechaFin = new Date(torneo.fecha_fin)
              fechaFin.setHours(0, 0, 0, 0)
              
              let estadoFinal = torneo.estado
              if (fechaFin < hoy) {
                estadoFinal = 'finalizado'
              } else if (fechaInicio <= hoy && estadoFinal === 'abierto') {
                estadoFinal = 'cerrado'
              }
              
              return (
                <div key={torneo.id} className="torneoCardMobile">
                  <div className="torneoCardHeader">
                    <div style={{ flex: 1 }}>
                      <h3 className="torneoCardTitle">{torneo.nombre}</h3>
                      {torneo.descripcion && (
                        <p className="torneoCardDesc">{torneo.descripcion.substring(0, 80)}{torneo.descripcion.length > 80 ? '...' : ''}</p>
                      )}
                    </div>
                    <span className={`chip chip-${estadoFinal}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                      {formatEstado(estadoFinal)}
                    </span>
                  </div>
                  
                  <div className="torneoCardMeta">
                    <div className="torneoCardRow">
                      <span className="torneoCardRowLabel">Deporte:</span>
                      <span>{formatDeporte(torneo.deporte)}{torneo.categoria && ` · ${torneo.categoria}`}</span>
                    </div>
                    
                    <div className="torneoCardRow">
                      <MaterialIcon name="calendar_today" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)' }} />
                      <span>{formatFecha(torneo.fecha_inicio)} - {formatFecha(torneo.fecha_fin)}</span>
                    </div>
                    
                    <div className="torneoCardRow">
                      <MaterialIcon name="location_on" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>{torneo.ciudad}, {torneo.provincia}</span>
                        {torneo.sede && <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{torneo.sede}</span>}
                      </div>
                    </div>
                    
                    <div className="torneoCardRow">
                      <span className="torneoCardRowLabel">Plazas:</span>
                      <span>{torneo.inscritos}/{torneo.cupo}</span>
                    </div>
                    
                    {!torneo.activo && (
                      <div className="torneoCardRow">
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: 'rgba(255, 0, 0, 0.2)', color: 'rgba(255, 0, 0, 0.9)' }}>
                          Inactivo
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="torneoCardActions">
                    <button
                      className="btn btnGhost btnSmall"
                      type="button"
                      onClick={() => handleEdit(torneo)}
                      disabled={estadoFinal === 'finalizado'}
                      style={{ 
                        padding: '8px',
                        minWidth: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: estadoFinal === 'finalizado' ? 0.5 : 1,
                        cursor: estadoFinal === 'finalizado' ? 'not-allowed' : 'pointer',
                        borderRadius: '50%'
                      }}
                      title={estadoFinal === 'finalizado' ? 'Los torneos finalizados no se pueden editar' : 'Editar'}
                    >
                      <MaterialIcon name="edit" style={{ fontSize: '18px' }} />
                    </button>
                    <button
                      className="btn btnGhost btnSmall"
                      type="button"
                      onClick={() => handleDeleteClick(torneo)}
                      style={{ 
                        padding: '8px',
                        minWidth: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f44336',
                        borderRadius: '50%'
                      }}
                      title="Eliminar"
                    >
                      <MaterialIcon name="delete" style={{ fontSize: '18px' }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <TorneoFormModal
        open={formModalOpen}
        torneo={editingTorneo}
        onClose={() => {
          setFormModalOpen(false)
          setEditingTorneo(null)
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Eliminar Torneo"
        message={`¿Estás seguro de que quieres eliminar el torneo "${deleteModal.torneo?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, torneo: null })}
      />

      <MessageModal
        open={messageModal.open}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
      />
    </div>
  )
}

