import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Washomeless — Help Rebuild Lives',
  description: 'Support people experiencing homelessness with $30/month. 100 donors fund one person\'s 12-month journey to stability.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Washomeless" width={42} height={42} className="rounded-full" />
              <span className="text-xl sm:text-2xl font-bold text-emerald-700">Washomeless</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/people" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900">
                Meet people
              </Link>
              {profile?.role !== 'admin' && profile?.role !== 'sponsored' && (
                <Link href="/apply" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900">
                  Apply for help
                </Link>
              )}
              {user ? (
                <>
                  {profile?.role === 'sponsored' && (
                    <Link href="/my-profile" className="text-sm text-gray-600 hover:text-gray-900">
                      My Profile
                    </Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                      Admin
                    </Link>
                  )}
                  {profile?.role === 'donor' && (
                    <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                      Dashboard
                    </Link>
                  )}
                  <form action="/auth/signout" method="post">
                    <Button variant="outline" size="sm" type="submit" className="rounded-full text-xs px-3 sm:px-5">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
                    Log in
                  </Link>
                  <Link href="/people">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-full text-xs sm:text-sm px-3 sm:px-5">
                      Support someone
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t mt-20 py-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Washomeless. Making homelessness a temporary chapter.</p>
        </footer>
      </body>
    </html>
  )
}
