# Supabase Security & Architecture Checklist

## 1. Environment Setup
- [ ] Install dependencies: `npm install @supabase/supabase-js`
- [ ] Create `.env.local` in `frontend` root:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

## 2. Database Migration (Run in Supabase SQL Editor)
- [ ] Run the content of `supabase/migrations/20240101_initial_schema.sql`.
- [ ] Verify `companies`, `profiles`, and `storage.buckets` are created.
- [ ] **Critical**: Ensure `daily_reports` and other existing tables also have `company_id` column and RLS policies if you intend to access them from frontend or secure them properly.
- [ ] Verify RLS is enabled on ALL tables.

## 3. Auth Configuration
- [ ] Enable Email/Password provider in Supabase Auth settings.
- [ ] Disable "Enable Email Confirmations" for faster dev testing (optional).
- [ ] Set `SITE_URL` and Redirect URLs in Authentication -> URL Configuration.

## 4. Frontend Integration
- [ ] `src/lib/supabase.ts` is created and configured.
- [ ] `src/context/AuthContext.tsx` wraps the application in `layout.tsx`.
- [ ] Use `useAuth()` hook to access `user`, `role`, and `companyId`.
- [ ] Protect pages using `ProtectedRoute` component or middleware.

## 5. Security Validation
- [ ] **RLS Verification**: Try `supabase.from('companies').select('*')` as an authenticated user. You should ONLY see your own company.
- [ ] **Cross-Tenant Test**: Create two users in different companies. Ensure User A cannot see User B's profile or files.
- [ ] **Storage Security**: Try uploading a file to a different company's folder path. It should fail.

## 6. Registration Flow
- [ ] Ensure your Registration Form passes metadata:
  ```javascript
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'John Doe',
        company_name: 'Acme Corp' // For new company
        // OR
        // invite_code: 'xyz' // To join existing
      }
    }
  })
  ```

## 7. Role-Based Routing
- [ ] Verify automatic redirection after login loops:
  - SUPER_ADMIN -> `/admin`
  - MANAGER -> `/manager`
  - EMPLOYEE -> `/employee`
  - CLIENT -> `/client`

## 8. Backend Considerations
- [ ] If keeping Express backend, install `@supabase/supabase-js` there.
- [ ] Use `getUser(token)` to validate instructions on the server side.
- [ ] Ensure backend also respects `company_id` isolation (already handled in Prisma extension).
