import Link from 'next/link'
import { SignInForm } from '@/modules/auth/presentation/sign-in-form'

type SignInPageProps = {
  searchParams?: Promise<{ registered?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = searchParams ? await searchParams : undefined

  return (
    <div className="space-y-6">
      <SignInForm registered={params?.registered === '1'} />
      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Tạo tài khoản
        </Link>
      </p>
    </div>
  )
}

