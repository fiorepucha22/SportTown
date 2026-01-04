type Props = {
  title: string
  description: string
  icon: React.ReactNode
  stagger?: number
}

export function FeatureCard({ title, description, icon, stagger = 0 }: Props) {
  return (
    <article className="featureCard" style={{ ['--stagger' as any]: stagger }}>
      <div className="featureIcon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="featureTitle">{title}</h3>
      <p className="featureDesc">{description}</p>
    </article>
  )
}


