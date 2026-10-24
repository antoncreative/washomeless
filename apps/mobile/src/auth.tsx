import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type Role = 'donor' | 'sponsored' | 'admin'

export type MyPerson = {
  id: string
  name: string
  city: string
  status: 'pending' | 'active' | 'completed' | 'rejected'
  current_supporters: number
  max_supporters: number
}

type Auth = {
  session: Session | null
  loading: boolean
  role: Role | null
  person: MyPerson | null
  canPost: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  reload: () => Promise<void>
}

const AuthContext = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<Role | null>(null)
  const [person, setPerson] = useState<MyPerson | null>(null)

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s) {
      setRole(null)
      setPerson(null)
      return
    }
    const [{ data: profile }, { data: me }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', s.user.id).maybeSingle(),
      supabase
        .from('sponsored_people')
        .select('id, name, city, status, current_supporters, max_supporters')
        .eq('user_id', s.user.id)
        .maybeSingle(),
    ])
    setRole((profile?.role as Role) ?? null)
    setPerson((me as MyPerson) ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await loadProfile(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      // Defer: calling Supabase inside this callback can deadlock the auth client.
      setTimeout(() => loadProfile(s), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return error ? error.message : null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const reload = useCallback(() => loadProfile(session), [loadProfile, session])

  const value = useMemo(
    () => ({
      session,
      loading,
      role,
      person,
      canPost: person?.status === 'active',
      signIn,
      signOut,
      reload,
    }),
    [session, loading, role, person, signIn, signOut, reload]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
