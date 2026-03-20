import { Type } from 'class-transformer'
import {
  IsDate,
  IsEmail,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'

export class UserProfileResponseDto {
  @IsString()
  id!: string

  @IsString()
  authId!: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  username!: string | null

  @IsObject()
  profile!: {
    displayName: string
    avatarUrl: string | null
    bio: string | null
  }

  @IsObject()
  preferences!: {
    theme: 'dark' | 'light' | 'system'
    explicitContentFilter: boolean
    audioQuality: 'low' | 'normal' | 'high' | 'very_high'
    privateSession: boolean
  }

  @IsOptional()
  @IsString()
  country!: string | null

  @IsObject()
  account!: {
    status: 'active' | 'suspended' | 'deactivated'
  }

  @IsObject()
  onboarding!: {
    completed: boolean
    completedAt: Date | null
  }

  @IsInt()
  @Min(0)
  @Max(100)
  profileCompleteness!: number

  @Type(() => Date)
  @IsDate()
  createdAt!: Date

  @Type(() => Date)
  @IsDate()
  updatedAt!: Date
}
