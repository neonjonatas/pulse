/* =================
  HTTP - Services
================== */
export { ErrorService } from '@api/transport/http/services/error-service/error.service'
export { ErrorFactoryService } from '@api/transport/http/services/error-service/error-factory.service'

/* =================
  Auth - Services
================== */
export { LoginService } from '@api/authority/login/services/login-service/login.service'
export { SignupService } from '@api/authority/signup/services/signup-service/signup.service'

/* =================
  Auth - Types
================== */
export type { LoginResponse } from '@api/authority/login/login.types'
export type {
  SignupBody,
  SignupResponse
} from '@api/authority/signup/signup.types'

/* =================
  Auth - Guards
================== */
export { isLoginBodyValid } from '@api/authority/login/guards/is-login-body-valid.guard'
export { isSignupBodyValid } from '@api/authority/signup/guards/is-signup-body-valid.guard'

/* =================
  Axios - Instance
================== */
export { loginInstance } from '@api/authority/login/login.instance'
