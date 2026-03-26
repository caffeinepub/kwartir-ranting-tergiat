# Kwartir Ranting Tergiat

## Current State
- Dashboard app with admin login via Internet Identity
- Kwarran CRUD with scoring (Section A/B/C, total 100 pts)
- Leaderboard in dashboard (only visible after login)
- Authorization mixin for role-based access (admin/user/guest)
- No public-facing page
- No user registration flow

## Requested Changes (Diff)

### Add
- **Public Landing Page (Halaman Pembuka)**: Visible to everyone WITHOUT login. Shows:
  - Full-width rotating image banner/slider (advertisement style, auto-play)
  - Public leaderboard/rankings table with kwarran names, scores (A/B/C/total), ranking number, and status badge
  - KPI summary cards (total kwarran, average score, top kwarran)
  - Navigation buttons: Login (for admins) and Daftar Akun (register)
- **User Registration Page**: Public form where users can submit their name + Principal to request access. Status shows "pending admin approval".
- **Admin Approval Panel**: Inside the authenticated dashboard, admin can see pending registration requests and approve/reject them.
- **user-approval component**: Adds backend support for registration requests with admin approval workflow

### Modify
- App.tsx: Default page is now the public LandingPage (no login required to view rankings). Login redirects to admin dashboard.
- `listKwarran` backend call made accessible publicly (already public query)

### Remove
- Nothing removed

## Implementation Plan
1. Select `user-approval` Caffeine component
2. Regenerate Motoko backend with user-approval mixin
3. Create `LandingPage.tsx`: full-screen banner slider + public rankings table + header with Login/Register buttons
4. Create `RegisterPage.tsx`: registration form (name input, connect Internet Identity, submit for approval)
5. Create `ApprovalPage.tsx`: admin panel to approve/reject pending users
6. Update `App.tsx`: show LandingPage as default, add routing for register and approval pages
7. Add banner images (generate placeholder banners for slider)
