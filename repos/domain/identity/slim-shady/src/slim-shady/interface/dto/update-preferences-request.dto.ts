import { IsBoolean, IsIn, IsOptional } from 'class-validator'

export class UpdatePreferencesRequestDto {
  @IsOptional()
  @IsIn(['dark', 'light', 'system'])
  theme?: 'dark' | 'light' | 'system'

  @IsOptional()
  @IsBoolean()
  explicitContentFilter?: boolean

  @IsOptional()
  @IsIn(['low', 'normal', 'high', 'very_high'])
  audioQuality?: 'low' | 'normal' | 'high' | 'very_high'

  @IsOptional()
  @IsBoolean()
  privateSession?: boolean
}
