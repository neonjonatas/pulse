import { Type } from 'class-transformer'
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator'

export class MeResponseDto {
  @IsString()
  id!: string

  @IsString()
  @IsOptional()
  profileId?: string | null

  @IsEmail()
  email!: string

  @IsString()
  @IsOptional()
  name?: string | null

  @IsString()
  provider!: string

  @IsDate()
  @Type(() => Date)
  createdAt!: Date
}
