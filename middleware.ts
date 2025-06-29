// middleware.ts
import { updateSession } from './lib/supabaseMiddleware'

export const middleware = updateSession

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // apply to all pages
}
