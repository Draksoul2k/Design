import Link from 'next/link'
import { SignUpForm } from '@/modules/auth/presentation/sign-up-form'

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <SignUpForm />
      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}

