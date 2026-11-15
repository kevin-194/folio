# Folio build log

## Day 1
- [x] Next.js + Supabase setup, GitHub repo
- [x] Auth: sign up, login, logout (Server Actions)
- [x] Proxy: session refresh and route protection
- [x] Organizations + memberships with RLS
- [x] Create-organization flow (atomic Postgres function)
- Learned: RLS filters rows per user, so security lives in the database

## Day 2
- [x] Clients, client_users and projects tables with RLS
- [x] Shared layout with header and logout (route group)
- [x] Clients list and new-client form
- Learned: change the SQL, regenerate types, then write code
- Moved to Day 3: projects UI
## Day 3
- [x] Projects list and new-project form (client dropdown)
- [x] Milestones table with RLS and composite foreign key
- [x] Project page with milestones (add, mark done, reopen)
- [x] Fixed serif font (broken --font-sans variable) and added a brand color
- Learned: dynamic routes with two params, composite foreign keys for tenant safety
- Moved to later: visual polish (Day 23)