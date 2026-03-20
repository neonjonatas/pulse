import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@shadcn/components/ui/card'
import { FieldDescription } from '@infra/shadcn/components/ui/field'

export interface LoginFormLayoutProps {
  children: React.ReactNode
}

export function LoginFormLayout(props: LoginFormLayoutProps) {
  const { children } = props
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-neon font-extrabold">
            Welcome back
          </CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <Link href="/terms">Terms of Service</Link> and{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
