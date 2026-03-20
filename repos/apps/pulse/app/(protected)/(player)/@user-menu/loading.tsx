import {
  AvatarFallback,
  Avatar as AvatarRoot
} from '@infra/shadcn/components/ui/avatar'

export default function UserMenuLoading() {
  return (
    <AvatarRoot>
      <AvatarFallback className="grayscale">PS</AvatarFallback>
    </AvatarRoot>
  )
}
