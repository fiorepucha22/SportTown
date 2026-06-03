// Página principal para listar y gestionar instalaciones deportivas
// Permite buscar, filtrar, ver detalles, reservar (usuarios) o editar/eliminar (admins)
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { InstalacionModal } from '../components/InstalacionModal'
import { InstalacionFormModal } from '../components/InstalacionFormModal'
import { ConfirmModal } from '../components/ConfirmModal'
import { MessageModal } from '../components/MessageModal'
import { useAuth } from '../state/AuthContext'
import { MaterialIcon } from '../components/MaterialIcon'

export type Instalacion = {
  id: number
  nombre: string
  tipo: string
  descripcion?: string | null
  ubicacion?: string | null
  precio_por_hora: string
  activa?: boolean
  imagen_url?: string | null
}

export function Instalaciones() {
  const auth = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Instalacion[]>([])
  const [selectedInstalacion, setSelectedInstalacion] = useState<Instalacion | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingInstalacion, setEditingInstalacion] = useState<Instalacion | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ open: boolean; instalacion: Instalacion | null }>({
    open: false,
    instalacion: null,
  })
  const [messageModal, setMessageModal] = useState<{ open: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  })

  // Redirige al login si el usuario no está autenticado
  // Guarda la ruta actual para volver después del login
  useEffect(() => {
    if (!auth.token && !auth.loading) {
      nav('/login', { state: { returnTo: location.pathname }, replace: true })
    }
  }, [auth.token, auth.loading, nav, location.pathname])

  // Carga las instalaciones desde la API con filtros de búsqueda y tipo
  // Se ejecuta cuando cambian los filtros (q o tipo)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Construye los parámetros de búsqueda
        const params = new URLSearchParams()
        if (q.trim()) params.set('q', q.trim()) // Búsqueda por texto
        if (tipo) params.set('tipo', tipo) // Filtro por tipo
        const qs = params.toString()

        const res = await apiFetch<{ data: Instalacion[] }>(`/api/instalaciones${qs ? `?${qs}` : ''}`)
        if (!cancelled) setItems(res.data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando instalaciones')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true // Cancela la actualización si el componente se desmonta
    }
  }, [q, tipo])

  // Extrae los tipos únicos de instalaciones para el filtro
  const tipos = useMemo(() => {
    const set = new Set(items.map((i) => i.tipo).filter(Boolean))
    return Array.from(set).sort()
  }, [items])

  // Verifica si el usuario actual es administrador
  const esAdmin = auth.user?.is_admin === true

  // Abre el modal de confirmación para eliminar una instalación
  function handleDeleteClick(instalacion: Instalacion) {
    setDeleteConfirmModal({ open: true, instalacion })
  }

  // Ejecuta la eliminación de la instalación después de la confirmación
  async function handleDeleteConfirm() {
    const instalacion = deleteConfirmModal.instalacion
    if (!instalacion) return

    setDeletingId(instalacion.id) // Marca la instalación como "eliminándose"
    setDeleteConfirmModal({ open: false, instalacion: null })
    
    try {
      await apiFetch(`/api/instalaciones/${instalacion.id}`, {
        method: 'DELETE',
      })
      // Recargar la lista para reflejar los cambios
      await reloadItems()
      setMessageModal({
        open: true,
        type: 'success',
        title: 'Instalación eliminada',
        message: `La instalación "${instalacion.nombre}" ha sido eliminada correctamente.`,
      })
    } catch (err) {
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Error al eliminar',
        message: err instanceof Error ? err.message : 'Error eliminando instalación',
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Abre el modal de edición con los datos de la instalación seleccionada
  function handleEdit(instalacion: Instalacion) {
    setEditingInstalacion(instalacion)
    setFormModalOpen(true)
  }

  // Abre el modal de creación (sin instalación seleccionada)
  function handleCreate() {
    setEditingInstalacion(null)
    setFormModalOpen(true)
  }

  // Recarga la lista de instalaciones manteniendo los filtros actuales
  async function reloadItems() {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (tipo) params.set('tipo', tipo)
    const qs = params.toString()
    const res = await apiFetch<{ data: Instalacion[] }>(`/api/instalaciones${qs ? `?${qs}` : ''}`)
    setItems(res.data)
  }

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Instalaciones</h2>
          <p className="pageSubtitle">Elige tu instalación y reserva en segundos.</p>
        </div>
        {esAdmin && (
          <button className="btn btnPrimary" type="button" onClick={handleCreate}>
            <MaterialIcon name="add" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }} />
            Crear Instalación
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="field">
          <label className="label" htmlFor="q">
            Buscar
          </label>
          <input
            id="q"
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pádel, tenis, piscina…"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="tipo">
            Tipo
          </label>
          <select id="tipo" className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {formatTipo(t)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="alert alertError">{error}</div> : null}

      {loading ? <div className="muted">Cargando…</div> : null}

      {!loading && items.length === 0 ? <div className="muted">No hay instalaciones para esos filtros.</div> : null}

      {/* Grid de tarjetas de instalaciones */}
      <div className="gridCards">
        {items.map((i, idx) => {
          return (
            <div key={i.id} className="card" style={{ ['--stagger' as any]: idx }}>
              <div className="cardTop">
                <div className="badge">{formatTipo(i.tipo)}</div>
                <div className="price">
                  <span className="priceNumber">{Number(i.precio_por_hora).toFixed(2)}€</span>
                  <span className="priceUnit">/hora</span>
                </div>
              </div>

              <h3 className="cardTitle">{i.nombre}</h3>
              <p className="cardDesc">{i.descripcion || 'Sin descripción'}</p>

              <div className="cardMeta">{i.ubicacion ? `Ubicación: ${i.ubicacion}` : 'Ubicación no especificada'}</div>

              {/* Acciones diferentes según el rol: admin puede editar/eliminar, usuario puede reservar */}
              <div className="cardActions">
                {esAdmin ? (
                  <>
                    <button
                      className="btn btnGhost btnSmall"
                      type="button"
                      onClick={() => handleEdit(i)}
                      title="Editar instalación"
                    >
                      <MaterialIcon name="edit" />
                    </button>
                    <button
                      className="btn btnGhost btnSmall"
                      type="button"
                      onClick={() => handleDeleteClick(i)}
                      disabled={deletingId === i.id}
                      title="Eliminar instalación"
                    >
                      <MaterialIcon name={deletingId === i.id ? 'hourglass_empty' : 'delete'} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link className="btn btnPrimary" to={`/reservar/${i.id}`}>
                      Reservar
                    </Link>
                    <button
                      className="btn btnGhost"
                      type="button"
                      onClick={() => {
                        setSelectedInstalacion(i)
                        setModalOpen(true)
                      }}
                    >
                      Ver detalle
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <InstalacionModal
        open={modalOpen}
        instalacion={selectedInstalacion}
        onClose={() => {
          setModalOpen(false)
          setSelectedInstalacion(null)
        }}
      />

      <InstalacionFormModal
        open={formModalOpen}
        instalacion={editingInstalacion}
        onClose={() => {
          setFormModalOpen(false)
          setEditingInstalacion(null)
        }}
        onSuccess={reloadItems}
      />

      <ConfirmModal
        open={deleteConfirmModal.open}
        title="Eliminar instalación"
        message={
          deleteConfirmModal.instalacion
            ? `¿Estás seguro de que deseas eliminar la instalación "${deleteConfirmModal.instalacion.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmModal({ open: false, instalacion: null })}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
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

function formatTipo(tipo: string) {
  return tipo.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}


