import { IsBoolean } from 'class-validator'

export class CompleteOnboardingRequestDto {
  @IsBoolean()
  completed!: boolean
}
