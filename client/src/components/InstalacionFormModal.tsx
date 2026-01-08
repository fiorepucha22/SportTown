// Modal de formulario para crear o editar instalaciones deportivas
// Permite a los administradores gestionar instalaciones (CRUD)
import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import type { Instalacion } from '../pages/Instalaciones'
import { MaterialIcon } from './MaterialIcon'
import { apiFetch } from '../lib/api'

type Props = {
  open: boolean
  instalacion: Instalacion | null
  onClose: () => void
  onSuccess: () => void
}

const TIPOS_INSTALACION = [
  { value: 'padel', label: 'Pádel' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'futbol_sala', label: 'Fútbol Sala' },
  { value: 'piscina', label: 'Piscina' },
  { value: 'gimnasio', label: 'Gimnasio' },
]

export function InstalacionFormModal({ open, instalacion, onClose, onSuccess }: Props) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('padel')
  const [descripcion, setDescripcion] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [precioPorHora, setPrecioPorHora] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [activa, setActiva] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (instalacion) {
        // Modo edición
        setNombre(instalacion.nombre || '')
        setTipo(instalacion.tipo || 'padel')
        setDescripcion(instalacion.descripcion || '')
        setUbicacion(instalacion.ubicacion || '')
        setPrecioPorHora(instalacion.precio_por_hora || '')
        setImagenUrl(instalacion.imagen_url || '')
        setActiva(instalacion.activa !== undefined ? instalacion.activa : true)
      } else {
        // Modo creación - resetear formulario
        setNombre('')
        setTipo('padel')
        setDescripcion('')
        setUbicacion('')
        setPrecioPorHora('')
        setImagenUrl('')
        setActiva(true)
      }
      setError(null)
    }
  }, [open, instalacion])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const data = {
        nombre,
        tipo,
        descripcion: descripcion || null,
        ubicacion: ubicacion || null,
        precio_por_hora: parseFloat(precioPorHora),
        imagen_url: imagenUrl || null,
        activa,
      }

      if (instalacion) {
        // Actualizar
        await apiFetch(`/api/instalaciones/${instalacion.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      } else {
        // Crear
        await apiFetch('/api/instalaciones', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando instalación')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={instalacion ? 'Editar instalación' : 'Crear instalación'} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle">
              <MaterialIcon name={instalacion ? 'edit' : 'add'} style={{ fontSize: '28px', marginRight: '12px', verticalAlign: 'middle' }} />
              {instalacion ? 'Editar Instalación' : 'Crear Instalación'}
            </div>
            <div className="modalSub">{instalacion ? 'Modifica los datos de la instalación' : 'Agrega una nueva instalación al sistema'}</div>
          </div>
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="modalBody">
          {error ? <div className="alert alertError">{error}</div> : null}

          <form onSubmit={onSubmit} className="form">
            <div className="field">
              <label className="label" htmlFor="nombre">
                Nombre *
              </label>
              <input
                id="nombre"
                className="input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Pista de Pádel 1"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="tipo">
                Tipo *
              </label>
              <select id="tipo" className="input" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                {TIPOS_INSTALACION.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                className="input"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción de la instalación..."
                rows={3}
              />
            </div>

            <div className="fieldRow">
              <div className="field">
                <label className="label" htmlFor="ubicacion">
                  Ubicación
                </label>
                <input
                  id="ubicacion"
                  className="input"
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej: Edificio A, Planta 2"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="precio_por_hora">
                  Precio por hora (€) *
                </label>
                <input
                  id="precio_por_hora"
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioPorHora}
                  onChange={(e) => setPrecioPorHora(e.target.value)}
                  placeholder="15.00"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="imagen_url" style={{ opacity: 0.5 }}>
                URL de imagen (deshabilitado)
              </label>
              <input
                id="imagen_url"
                className="input inputReadonly"
                type="url"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled
                readOnly
                style={{ cursor: 'not-allowed' }}
              />
            </div>

            <div className="field">
              <label className="checkboxLabel">
                <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} />
                <span>Instalación activa (disponible para reservas)</span>
              </label>
            </div>

            <div className="formActions">
              <button type="button" className="btn btnGhost" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="btn btnPrimary" disabled={saving}>
                {saving ? 'Guardando...' : instalacion ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

