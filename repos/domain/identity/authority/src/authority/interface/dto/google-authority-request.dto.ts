import { IsNotEmpty, IsString } from 'class-validator'

export class GoogleAuthorityRequestDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string
}
