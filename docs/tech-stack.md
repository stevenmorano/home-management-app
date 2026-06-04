# Tech Stack Decision

## Recommendation

Use a TypeScript-first stack:

- Language: TypeScript
- Web app: Next.js with React
- Styling/UI: Tailwind CSS plus a component system such as shadcn/ui
- Database: PostgreSQL
- Backend platform: Supabase for Postgres, Auth, Storage, and optional Edge Functions
- Data access: Supabase client and generated database types first; consider Prisma only if the app needs a heavier custom backend later
- File storage: Supabase Storage with private buckets and signed/authenticated access
- Calendar integration: Google Calendar API through server-side routes/functions
- Future iOS app: Expo React Native with TypeScript, reusing the same Supabase backend and shared domain types
- Testing: Playwright for end-to-end UI flows, Vitest for unit/domain logic, Testing Library for React components
- Deployment: Vercel for Next.js and Supabase managed hosting for backend services

## Why This Stack Fits

The first product needs to move quickly but still handle private homeowner data, file uploads, authentication, relational records, reminders, and calendar sync.

TypeScript across web and future mobile keeps the language surface small. Next.js gives a strong web app foundation for responsive dashboard-first UI. Supabase provides the backend pieces this product needs early: PostgreSQL, authentication, storage, row-level security, and server-side functions.

Expo React Native is the recommended future mobile path because it can share TypeScript knowledge, backend clients, validation schemas, domain models, and product logic with the web app. A native Swift iOS app can be considered later only if the product needs deep iOS-specific behavior.

## Stack Layers

### Frontend Web

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react icons

Primary responsibilities:

- First-run onboarding
- Property switcher
- Guided asset checklist
- Property health dashboard
- Asset/system CRUD
- Work history
- Contractors
- Reminders
- Optional uploads

### Backend And Database

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Row Level Security
- Supabase Edge Functions or Next.js server routes for server-only operations

Primary responsibilities:

- User authentication
- User-owned private data
- Relational records
- Protected upload storage
- Reminder status calculation
- Google Calendar OAuth and event creation

### Future Mobile

- Expo
- React Native
- TypeScript
- Supabase client

Primary responsibilities:

- iOS app experience after web MVP validates the workflow
- Mobile dashboard
- Reminder review
- Work history entry
- Photo/document capture if needed

## Why Not Other Options

### Native Swift First

Swift is excellent for iOS, but it would slow down the web-first MVP and create a second implementation path too early. Use Swift later only for custom native needs.

### Separate Python Backend

Python is strong for AI and data processing, but the MVP does not need a separate backend service yet. Future AI analysis can be added later as a separate service or server function.

### Full Custom Node/Express Backend

Node/Express is flexible, but it adds more infrastructure and auth/storage work than needed for a pilot. Supabase plus Next.js server routes is a better early balance.

### Flutter

Flutter can produce good mobile apps, but it would introduce Dart while the web app still needs TypeScript/React. For this product, React Native keeps the future iOS path closer to the web app.

## Important Implementation Notes

- Keep business/domain logic in shared TypeScript modules where possible.
- Keep Google Calendar OAuth and event writes server-side.
- Use private storage buckets for documents/photos.
- Use database row-level security from the beginning.
- Generate TypeScript types from the database schema.
- Use structured fields for asset dates, age ranges, condition, and reminders.
- Avoid adding AI, billing, and complex admin tooling until the pilot proves value.

## Open Questions

- Exact Supabase vs Next.js server-route split for reminder calculations.
- Whether to use Prisma after the first schema stabilizes.
- Exact component library setup.
- Exact deployment account/provider choices.

