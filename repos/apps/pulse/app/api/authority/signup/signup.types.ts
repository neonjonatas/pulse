export interface SignupBody {
  name?: string
  email: string
  password: string
}

export interface SignupResponse {
  accessToken: string
  refreshToken: string
}
