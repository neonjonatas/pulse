import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator'

export class UpdateProfileRequestDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]{3,30}$/)
  username?: string | null

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  displayName?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string | null

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  country?: string | null
}
