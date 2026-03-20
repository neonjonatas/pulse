import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import type { Request } from 'express'

import {
  GoogleLoginUseCase,
  GoogleSignupUseCase,
  LoginUseCase,
  LogoutUseCase,
  MeUseCase,
  RefreshTokenUseCase,
  SignupUseCase
} from '@application/use-cases'
import {
  AuthorityResponseDto,
  GoogleAuthorityRequestDto,
  LoginRequestDto,
  MeResponseDto,
  RefreshTokenRequestDto,
  SignupRequestDto
} from '@interface/dto'
import { AccessTokenGuard } from './guards/access-token.guard'
import { GoogleAuthorityBodyPipe } from './pipes/google-authority-body.pipe'
import { LoginBodyPipe } from './pipes/login-body.pipe'
import { RefreshTokenBodyPipe } from './pipes/refresh-token-body.pipe'
import { SignupBodyPipe } from './pipes/signup-body.pipe'
import { getRequestContext } from '@interface/http/request-metadata.util'

@Controller('authority')
export class AuthorityController {
  constructor(
    private readonly signup: SignupUseCase,
    private readonly login: LoginUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly logout: LogoutUseCase,
    private readonly me: MeUseCase,
    private readonly googleSignup: GoogleSignupUseCase,
    private readonly googleLogin: GoogleLoginUseCase
  ) {}

  @Post('signup')
  async signupHandler(
    @Req() request: Request,
    @Body(SignupBodyPipe) body: SignupRequestDto
  ): Promise<AuthorityResponseDto> {
    return this.signup.execute({
      input: body,
      context: getRequestContext(request)
    })
  }

  @Post('login')
  @HttpCode(200)
  async loginHandler(
    @Req() request: Request,
    @Body(LoginBodyPipe) body: LoginRequestDto
  ): Promise<AuthorityResponseDto> {
    return this.login.execute({
      email: body.email,
      password: body.password,
      context: getRequestContext(request)
    })
  }

  @Post('google/signup')
  @HttpCode(200)
  async googleSignupHandler(
    @Req() request: Request,
    @Body(GoogleAuthorityBodyPipe) body: GoogleAuthorityRequestDto
  ): Promise<AuthorityResponseDto> {
    return this.googleSignup.execute({
      idToken: body.idToken,
      context: getRequestContext(request)
    })
  }

  @Post('google/login')
  @HttpCode(200)
  async googleLoginHandler(
    @Req() request: Request,
    @Body(GoogleAuthorityBodyPipe) body: GoogleAuthorityRequestDto
  ): Promise<AuthorityResponseDto> {
    return this.googleLogin.execute({
      idToken: body.idToken,
      context: getRequestContext(request)
    })
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshTokenHandler(
    @Body(RefreshTokenBodyPipe) body: RefreshTokenRequestDto
  ): Promise<AuthorityResponseDto> {
    return this.refreshToken.execute({ refreshToken: body.refreshToken })
  }

  @Post('logout')
  @HttpCode(200)
  async logoutHandler(
    @Body(RefreshTokenBodyPipe) body: RefreshTokenRequestDto
  ): Promise<{ success: boolean }> {
    return this.logout.execute({ refreshToken: body.refreshToken })
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async meHandler(
    @Req() request: { user: { sub: string } }
  ): Promise<MeResponseDto> {
    return this.me.execute({ userId: request.user.sub })
  }
}
