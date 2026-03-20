import { IsString } from 'class-validator'

export class AuthorityResponseDto {
  @IsString()
  accessToken!: string

  @IsString()
  refreshToken!: string
}
