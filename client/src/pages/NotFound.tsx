import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="centerWrap">
      <div className="panel">
        <h2 className="pageTitle">Página no encontrada</h2>
        <p className="pageSubtitle">La ruta que buscas no existe.</p>
        <Link className="btn btnPrimary" to="/">
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}


