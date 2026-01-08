// Componente wrapper para iconos de Material Icons
// Simplifica el uso de iconos Material Design en toda la aplicación
type Props = {
  name: string
  className?: string
  style?: React.CSSProperties
}

export function MaterialIcon({ name, className = '', style }: Props) {
  return (
    <span className={`material-icons ${className}`} style={style}>
      {name}
    </span>
  )
}

