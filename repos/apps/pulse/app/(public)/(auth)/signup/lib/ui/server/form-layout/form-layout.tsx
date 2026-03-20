import { cn } from '@lib/template'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@shadcn/components/ui/card'

export interface SignupFormLayoutProps extends React.ComponentProps<'div'> {
  children: React.ReactNode
}

export function SignupFormLayout(props: SignupFormLayoutProps) {
  const { className, children, ...rest } = props
  return (
    <div className={cn('flex flex-col gap-6', className)} {...rest}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-neon font-extrabold">
            Create your account
          </CardTitle>
          <CardDescription>
            Sign up with Google or use your email
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
