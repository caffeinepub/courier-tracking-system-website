# Specification

## Summary
**Goal:** Make the Admin panel discoverable from the main UI while keeping the /admin route protected by the existing AdminGuard.

**Planned changes:**
- Update the global header navigation to include an always-visible "Admin" link on all pages, including when the user is logged out.
- Ensure the "Admin" link routes to `/admin` and relies on the existing AdminGuard behaviors (login prompt when not authenticated; access denied when authenticated but not an admin).
- Add a header login/logout control using the existing Internet Identity `LoginButton`, reflecting auth state changes immediately in the UI.

**User-visible outcome:** Users can see and click an "Admin" item in the header from any page, are prompted to log in if needed, and can log in/out from the header without manually navigating to `/admin`.
