# Security And Privacy

## Privacy Context

The app may store sensitive homeowner data, including:

- Addresses or property locations.
- Home systems and conditions.
- Contractor contact information.
- Maintenance costs.
- Invoices, receipts, warranties, manuals, permits, and photos.
- Calendar-linked maintenance appointments.

## MVP Security Requirements

- Users must authenticate before accessing data.
- User data must be private by default.
- Properties, assets, work records, reminders, contractors, and documents must be scoped to the owning user or household.
- Uploaded documents/photos must not be public by default.
- Google Calendar access should request only the permissions needed.
- Secrets and API keys must not be committed to the repository.

## Current Implementation Notes

- `.env.example` documents planned Supabase and Google Calendar variables.
- Real `.env` and `.env.local` files are ignored by git.
- Supabase helper modules intentionally fail fast when auth-only code paths require missing public Supabase values.
- `/login` shows a setup warning when Supabase is not configured.
- `/dashboard` is protected and redirects unauthenticated users to `/login`.
- Middleware refreshes Supabase auth cookies for server-rendered routes.
- Initial RLS policies are included for profiles, properties, rooms, and asset systems.
- Initial RLS-protected property creation has been verified with a test user.
- Initial RLS-protected asset-system creation has been verified with a test user.
- Initial RLS-protected asset-system detail updates have been verified with a test user.
- Duplicate asset rows are prevented by ownership-scoped application checks and a property-scoped unique index migration.
- No storage buckets, uploads, or Google OAuth token handling have been implemented yet.

## Row-Level Security Preparation

Before real homeowner data beyond the initial property flow is stored:

- Enable RLS on every user-owned table.
- Use `auth.uid()` ownership checks for `profiles`, `properties`, and any table with a direct `user_id`.
- For child records such as rooms, assets, work records, reminders, and documents, enforce access through the owning property or store a redundant `user_id` if that simplifies safe policies.
- Never rely on client-side filtering as the privacy boundary.

## Upload Privacy

Document and photo upload is optional. When implemented:

- Store files in private storage.
- Store metadata in the database.
- Use signed URLs or authenticated download routes.
- Avoid exposing direct public file URLs.

## Data Ownership

Users should be able to trust that their home records belong to them. Basic export/backup should be considered early, especially for pilot users.

## Deferred Security Features

The following can wait until public SaaS launch or later:

- Full audit logging.
- Advanced role-based contractor/guest access.
- Admin impersonation controls.
- Enterprise compliance workflows.
- Detailed support tooling.

## Security Risks To Track

- Uploaded documents may contain sensitive personal or financial information.
- Address and system data can reveal home vulnerabilities.
- Calendar OAuth tokens must be stored carefully.
- Multi-property and future household sharing must not leak records between users.
