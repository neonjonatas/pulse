'use client'

import { useImmerAtom } from 'jotai-immer'
import { AudioLinesIcon, UploadIcon, LogOutIcon } from 'lucide-react'

import { profileAtom } from '@atoms'
import { TrackMetadata } from '@track-metadata/ui'
import { VolumeBar } from '@volume-bar/ui'
import { Avatar } from '@user-menu/ui'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@shadcn/components/ui/dropdown-menu'
import { Button } from '@shadcn/components/ui/button'
import { Badge } from '@shadcn/components/ui/badge'

export function UserDropdown() {
  const [profile] = useImmerAtom(profileAtom)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="User menu"
        >
          <Avatar name={profile.name} src={profile.avatar.imageUrl} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full sm:w-auto">
        <DropdownMenuGroup>
          <DropdownMenuItem inert className="text-md">
            {`Welcome, ${profile.name}`}
          </DropdownMenuItem>
          <DropdownMenuItem inert>
            <Badge variant="secondary" className="text-sm">
              {profile.email}
            </Badge>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <AudioLinesIcon />
            Library
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UploadIcon />
            Upload
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOutIcon />
          Sign Out
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mobile-visible" />
        <DropdownMenuItem className="mobile-visible">
          <VolumeBar />
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mobile-visible" />
        <DropdownMenuItem inert className="mobile-visible">
          <TrackMetadata />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
