import { useEffect, useState } from 'react'
import { MaterialIcon } from './MaterialIcon'

type Torneo = {
  id?: number
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
  estado?: string
  activo?: boolean
}

type Props = {
  open: boolean
  torneo: Torneo | null
  onClose: () => void
  onSubmit: (data: Partial<Torneo>) => Promise<void>
}

const PROVINCIAS = ['Valencia', 'Alicante', 'Castellón'] as const
const TIPOS_TORNEO = ['Liga', 'Torneo', 'Open', 'Campeonato', 'Copa', 'Circuito'] as const
const DEPORTES = ['futbol_sala', 'padel', 'tenis', 'baloncesto', 'natacion', 'voleibol'] as const
const CATEGORIAS = ['masculino', 'femenino', 'mixto', 'sub18', 'sub20', 'veteranos'] as const

// Ciudades por provincia
const CIUDADES: Record<string, string[]> = {
  Valencia: ['Valencia', 'Gandia', 'Torrent', 'Paterna', 'Sagunto', 'Alzira', 'Xàtiva'],
  Alicante: ['Alicante', 'Elche', 'Orihuela', 'Benidorm', 'Alcoy', 'Denia', 'Torrevieja'],
  Castellón: ['Castellón', 'Villarreal', 'Burriana', 'Vinaròs', 'Benicarló', 'Oropesa del Mar'],
}

// Sedes por ciudad
const SEDES: Record<string, string[]> = {
  'Valencia': ['Polideportivo Municipal', 'Pabellón Central', 'Instalaciones Deportivas Norte', 'Centro Deportivo Levante'],
  'Gandia': ['Polideportivo de Gandia', 'Pabellón Municipal'],
  'Torrent': ['Pabellón de Torrent', 'Complejo Deportivo'],
  'Paterna': ['Pabellón de Paterna', 'Centro Deportivo'],
  'Sagunto': ['Polideportivo de Sagunto'],
  'Alzira': ['Pabellón de Alzira'],
  'Xàtiva': ['Pabellón de Xàtiva'],
  'Alicante': ['Club de Tenis Costa Blanca', 'Polideportivo Municipal', 'Centro Deportivo Alicante', 'Pabellón Central'],
  'Elche': ['Centro Deportivo Elx', 'Polideportivo de Elche', 'Pabellón Municipal'],
  'Orihuela': ['Polideportivo de Orihuela'],
  'Benidorm': ['Centro Deportivo Benidorm', 'Pabellón Municipal'],
  'Alcoy': ['Polideportivo de Alcoy'],
  'Denia': ['Pabellón de Denia'],
  'Torrevieja': ['Centro Deportivo Torrevieja'],
  'Castellón': ['Pabellón Central', 'Polideportivo Municipal', 'Centro Deportivo Norte'],
  'Villarreal': ['Pabellón de Villarreal'],
  'Burriana': ['Polideportivo de Burriana'],
  'Vinaròs': ['Pabellón de Vinaròs'],
  'Benicarló': ['Polideportivo de Benicarló'],
  'Oropesa del Mar': ['Centro Deportivo Oropesa'],
}

function formatDeporte(deporte: string) {
  return deporte.replace(/_/g, ' ')
}

function formatDeporteDisplay(deporte: string) {
  return deporte.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatCategoria(categoria: string) {
  return categoria.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

export function TorneoFormModal({ open, torneo, onClose, onSubmit }: Props) {
  const [tipoTorneo, setTipoTorneo] = useState('')
  const [deporte, setDeporte] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [provincia, setProvincia] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [sede, setSede] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [cupo, setCupo] = useState('16')
  const [activo, setActivo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ciudades disponibles según provincia
  const ciudadesDisponibles = provincia ? (CIUDADES[provincia] || []) : []
  
  // Sedes disponibles según ciudad
  const sedesDisponibles = ciudad ? (SEDES[ciudad] || []) : []


  useEffect(() => {
    if (!open) {
      // Reset form when closing
      setTipoTorneo('')
      setDeporte('')
      setCategoria('')
      setFechaInicio('')
      setFechaFin('')
      setProvincia('')
      setCiudad('')
      setSede('')
      setDescripcion('')
      setCupo('16')
      setActivo(true)
      setError(null)
      return
    }

    // Load torneo data when editing
    if (torneo) {
      // Extraer tipo de torneo del nombre (ej: "Liga fútbol sala Valencia" -> "Liga")
      const nombre = torneo.nombre
      const tipoEncontrado = TIPOS_TORNEO.find(tipo => nombre.toLowerCase().startsWith(tipo.toLowerCase()))
      setTipoTorneo(tipoEncontrado || '')
      
      setDeporte(torneo.deporte || '')
      setCategoria(torneo.categoria || '')
      setFechaInicio(torneo.fecha_inicio || '')
      setFechaFin(torneo.fecha_fin || '')
      setProvincia(torneo.provincia || '')
      // Normalizar ciudad (puede venir como "València" o "Castelló de la Plana")
      const ciudadTorneo = torneo.ciudad || ''
      if (ciudadTorneo === 'València') {
        setCiudad('Valencia')
      } else if (ciudadTorneo === 'Castelló de la Plana') {
        setCiudad('Castellón')
      } else {
        setCiudad(ciudadTorneo)
      }
      setSede(torneo.sede || '')
      setDescripcion(torneo.descripcion || '')
      setCupo(String(torneo.cupo || 16))
      setActivo(torneo.activo !== undefined ? torneo.activo : true)
      setError(null)
    }
  }, [open, torneo])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!tipoTorneo) {
      setError('El tipo de torneo es requerido')
      return
    }
    if (!deporte) {
      setError('El deporte es requerido')
      return
    }
    if (!fechaInicio) {
      setError('La fecha de inicio es requerida')
      return
    }
    if (!fechaFin) {
      setError('La fecha de fin es requerida')
      return
    }

    // Validar fechas
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas
    
    const fechaInicioDate = new Date(fechaInicio)
    fechaInicioDate.setHours(0, 0, 0, 0)
    
    const fechaFinDate = new Date(fechaFin)
    fechaFinDate.setHours(0, 0, 0, 0)

    if (fechaInicioDate < hoy) {
      setError('La fecha de inicio no puede ser anterior a hoy')
      return
    }
    
    if (fechaFinDate < fechaInicioDate) {
      setError('La fecha de fin debe ser posterior o igual a la fecha de inicio')
      return
    }
    if (!provincia) {
      setError('La provincia es requerida')
      return
    }
    if (!ciudad) {
      setError('La ciudad es requerida')
      return
    }
    if (!cupo || parseInt(cupo) < 1) {
      setError('El cupo debe ser mayor a 0')
      return
    }

    // Construir el nombre automáticamente: "Tipo deporte ciudad" (solo primera letra de tipo y ciudad en mayúscula)
    const nombreDeporte = formatDeporte(deporte).toLowerCase()
    const ciudadFormateada = ciudad.charAt(0).toUpperCase() + ciudad.slice(1).toLowerCase()
    const nombreCompleto = `${tipoTorneo} ${nombreDeporte} ${ciudadFormateada}`

    setLoading(true)
    try {
      await onSubmit({
        nombre: nombreCompleto,
        deporte,
        categoria: categoria || null,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        provincia,
        ciudad: ciudad.trim(),
        sede: sede.trim() || null,
        descripcion: descripcion.trim() || null,
        cupo: parseInt(cupo),
        // No enviar estado - el backend lo calculará automáticamente
        activo,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar torneo')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={torneo ? 'Editar Torneo' : 'Crear Torneo'} onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{torneo ? 'Editar Torneo' : 'Crear Torneo'}</div>
            <div className="modalSub">Completa los datos del torneo</div>
          </div>
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modalBody">
            {error && <div className="alert alertError">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="field">
                <label className="label" htmlFor="tipo_torneo">
                  Tipo de Torneo *
                </label>
                <select id="tipo_torneo" className="input" value={tipoTorneo} onChange={(e) => setTipoTorneo(e.target.value)} required>
                  <option value="">Seleccionar...</option>
                  {TIPOS_TORNEO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="deporte">
                  Deporte *
                </label>
                <select id="deporte" className="input" value={deporte} onChange={(e) => setDeporte(e.target.value)} required>
                  <option value="">Seleccionar...</option>
                  {DEPORTES.map((d) => (
                    <option key={d} value={d}>
                      {formatDeporteDisplay(d)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="categoria">
                Categoría
              </label>
              <select id="categoria" className="input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Ninguna</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {formatCategoria(c)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="field">
                <label className="label" htmlFor="fecha_inicio">
                  Fecha de Inicio *
                </label>
                <input
                  id="fecha_inicio"
                  className="input"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="fecha_fin">
                  Fecha de Fin *
                </label>
                <input
                  id="fecha_fin"
                  className="input"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  min={fechaInicio || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="field">
                <label className="label" htmlFor="provincia">
                  Provincia *
                </label>
                <select id="provincia" className="input" value={provincia} onChange={(e) => {
                  setProvincia(e.target.value)
                  setCiudad('')
                  setSede('')
                }} required>
                  <option value="">Seleccionar...</option>
                  {PROVINCIAS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="ciudad">
                  Ciudad *
                </label>
                <select
                  id="ciudad"
                  className="input"
                  value={ciudad}
                  onChange={(e) => {
                    setCiudad(e.target.value)
                    setSede('')
                  }}
                  required
                  disabled={!provincia}
                >
                  <option value="">
                    {provincia ? 'Seleccionar...' : 'Primero selecciona una provincia'}
                  </option>
                  {ciudadesDisponibles.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="sede">
                Sede / Lugar
              </label>
              <select
                id="sede"
                className="input"
                value={sede}
                onChange={(e) => setSede(e.target.value)}
                disabled={!ciudad}
              >
                <option value="">
                  {ciudad ? 'Seleccionar...' : 'Primero selecciona una ciudad'}
                </option>
                {sedesDisponibles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {tipoTorneo && deporte && ciudad && (
              <div className="field">
                <div style={{ padding: '12px', background: 'rgba(178, 102, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(178, 102, 255, 0.2)' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Nombre del torneo:</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
                    {tipoTorneo} {formatDeporte(deporte).toLowerCase()} {ciudad.charAt(0).toUpperCase() + ciudad.slice(1).toLowerCase()}
                  </div>
                </div>
              </div>
            )}

            <div className="field">
              <label className="label" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                className="input"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción breve del torneo..."
                rows={3}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="cupo">
                Cupo (plazas) *
              </label>
              <input
                id="cupo"
                className="input"
                type="number"
                value={cupo}
                onChange={(e) => setCupo(e.target.value)}
                min="1"
                required
              />
            </div>
            
            {torneo && (
              <div className="field">
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Estado del torneo:</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
                    El estado se actualiza automáticamente según las fechas y plazas
                  </div>
                </div>
              </div>
            )}

            {torneo && (
              <div className="field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
                  <span>Activo</span>
                </label>
              </div>
            )}
          </div>

          <div className="modalFooter" style={{ padding: '20px 28px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btnGhost" type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button className="btn btnPrimary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : torneo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

