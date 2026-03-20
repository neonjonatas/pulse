import {
  AvatarFallback,
  Avatar as AvatarRoot
} from '@infra/shadcn/components/ui/avatar'

export default function UserMenuDefault() {
  return (
    <AvatarRoot>
      <AvatarFallback className="grayscale">PS</AvatarFallback>
    </AvatarRoot>
  )
}
