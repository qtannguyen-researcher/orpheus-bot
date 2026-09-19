# Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the project URL and publishable (anon) key into `.env.local`.
3. Run `migrations/0001_init.sql` in the SQL editor.
4. Confirm Auth → email is enabled (password and/or magic link).
5. Confirm Storage buckets `audio` and `exports` exist and are private.

Local CLI (optional):

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push
```
