import { Badge } from '../atoms/Badge'

export function QuotaBadge({ quota }: { quota: number }) {
  const tone = quota <= 0 ? 'rose' : quota <= 2 ? 'amber' : 'emerald'
  return (
    <Badge tone={tone} dot>
      {quota <= 0 ? 'Sin cupos' : `${quota} cupo${quota === 1 ? '' : 's'}`}
    </Badge>
  )
}
