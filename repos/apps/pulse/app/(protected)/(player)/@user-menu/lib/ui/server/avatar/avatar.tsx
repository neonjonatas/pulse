import { toInitials } from '@lib/template'
import {
  Avatar as AvatarRoot,
  AvatarFallback,
  AvatarImage
} from '@shadcn/components/ui/avatar'

interface AvatarProps {
  name: string
  src: string
}

export function Avatar(props: AvatarProps) {
  const { name, src } = props

  return (
    <AvatarRoot>
      <AvatarImage src={src} alt={`${name} avatar`} />
      <AvatarFallback>{toInitials(name)}</AvatarFallback>
    </AvatarRoot>
  )
}
