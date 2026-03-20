import { Body, Controller, Get, Param, Patch } from '@nestjs/common'

import {
  CompleteOnboardingUseCase,
  GetUserProfileByAuthIdUseCase,
  GetUserProfileUseCase,
  UpdateUserPreferencesUseCase,
  UpdateUserProfileUseCase
} from '@application/use-cases'
import type {
  CompleteOnboardingRequestDto,
  UpdatePreferencesRequestDto,
  UpdateProfileRequestDto,
  UserProfileResponseDto
} from '@interface/dto'
import { CompleteOnboardingBodyPipe } from '@interface/http/pipes/complete-onboarding-body.pipe'
import { UpdatePreferencesBodyPipe } from '@interface/http/pipes/update-preferences-body.pipe'
import { UpdateProfileBodyPipe } from '@interface/http/pipes/update-profile-body.pipe'

@Controller('slim-shady/profile')
export class UserProfileController {
  constructor(
    private readonly getUserProfile: GetUserProfileUseCase,
    private readonly getByAuthId: GetUserProfileByAuthIdUseCase,
    private readonly updateProfile: UpdateUserProfileUseCase,
    private readonly updatePreferences: UpdateUserPreferencesUseCase,
    private readonly completeOnboarding: CompleteOnboardingUseCase
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserProfileResponseDto> {
    return this.getUserProfile.execute(id)
  }

  @Get('auth/:authId')
  async getByAuth(
    @Param('authId') authId: string
  ): Promise<UserProfileResponseDto> {
    return this.getByAuthId.execute(authId)
  }

  @Patch(':id')
  async patchProfile(
    @Param('id') id: string,
    @Body(UpdateProfileBodyPipe) body: UpdateProfileRequestDto
  ): Promise<UserProfileResponseDto> {
    await this.updateProfile.execute({ profileId: id, ...body })
    return this.getUserProfile.execute(id)
  }

  @Patch(':id/preferences')
  async patchPreferences(
    @Param('id') id: string,
    @Body(UpdatePreferencesBodyPipe) body: UpdatePreferencesRequestDto
  ): Promise<UserProfileResponseDto> {
    await this.updatePreferences.execute({ profileId: id, ...body })
    return this.getUserProfile.execute(id)
  }

  @Patch(':id/onboarding')
  async patchOnboarding(
    @Param('id') id: string,
    @Body(CompleteOnboardingBodyPipe) body: CompleteOnboardingRequestDto
  ): Promise<UserProfileResponseDto> {
    await this.completeOnboarding.execute({
      profileId: id,
      completed: body.completed
    })
    return this.getUserProfile.execute(id)
  }
}
