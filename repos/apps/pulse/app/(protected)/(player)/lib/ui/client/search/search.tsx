import { SearchIcon } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@shadcn/components/ui/input-group'

export function Search() {
  return (
    <InputGroup className="mx-4 sm:mx-0 sm:w-3/4 bg-background max-w-[500px]">
      <InputGroupInput
        aria-label="Search your songs"
        placeholder="Search your songs..."
        className="text-neon"
      />
      <InputGroupAddon>
        <SearchIcon className="text-(--ps-neon-10)" />
      </InputGroupAddon>
    </InputGroup>
  )
}
