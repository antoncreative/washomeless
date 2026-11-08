// Supabase is optional while the project is paused. Without its env vars the site
// runs offline: public pages show example profiles and account features are closed.
export const supabaseEnabled = !!process.env.NEXT_PUBLIC_SUPABASE_URL

// Routes that need a database or a signed-in user.
export const accountPaths = ['/dashboard', '/my-profile', '/admin', '/auth', '/apply', '/success']
