# User Login with Credentials

**Jira Key:** PH-7
**Epic:** PH-5 (User Authentication & Authorization)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** user
**I want to** login with my credentials
**So that** I can access my account

---

## Description

Implementar el flujo de autenticacion para usuarios registrados. El usuario debe poder ingresar con email y contrasena, obtener una sesion valida, y ser redirigido al dashboard apropiado segun su rol.

El sistema debe validar credenciales, verificar que el email este confirmado, y manejar casos de error como cuenta desactivada o credenciales incorrectas.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful login with valid credentials

- **Given:** I am on the login page
- **When:** I enter my registered email and correct password
- **Then:** I am logged in and redirected to the dashboard

### Scenario 2: Login with incorrect password

- **Given:** I am on the login page
- **When:** I enter my registered email and an incorrect password
- **Then:** I see an error message "Invalid email or password"

### Scenario 3: Login with unverified email

- **Given:** I registered but haven't verified my email
- **When:** I try to login
- **Then:** I see a message "Please verify your email before logging in"

### Scenario 4: Login with disabled account

- **Given:** My account has been deactivated by an admin
- **When:** I try to login
- **Then:** I see an error message "Account is disabled"

---

## Technical Notes

### Frontend

- Page: `/login`
- Components: Form with email and password fields
- Use shadcn/ui form components
- "Remember me" checkbox (optional)
- Link to forgot password
- Link to registration

### Backend

- Supabase Auth `signInWithPassword` method
- Check user status (active/inactive) in `profiles`
- Set session cookies/tokens
- Redirect based on role

### Database

- `auth.users` - Authentication
- `profiles` - Check `is_active` status and `role`

### External Services

- Supabase Auth

---

## Dependencies

### Blocked By

- PH-6 (User Registration) - needs registered users to login

### Blocks

- All authenticated features depend on login

### Related Stories

- PH-6 (Registration)
- PH-8 (Password Recovery)

---

## UI/UX Considerations

- Clean, centered form layout
- Show/hide password toggle
- Clear error messages
- Loading state during authentication
- Redirect to intended page after login (if applicable)
- Link to registration for new users
- Link to forgot password

---

## Definition of Done

- [ ] Codigo implementado y funcionando
- [ ] Tests unitarios (coverage > 80%)
- [ ] Tests de integracion (Supabase Auth)
- [ ] Tests E2E (Playwright)
- [ ] Code review aprobado (2 reviewers)
- [ ] Documentacion actualizada
- [ ] Deployed to staging
- [ ] QA testing passed
- [ ] Acceptance criteria validated
- [ ] No critical/high bugs open

---

## Testing Strategy

See: `test-cases.md` (se crea en Fase 5)

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path login
- Invalid credentials
- Unverified email
- Disabled account
- Session persistence
- Logout flow

---

## Implementation Plan

See: `implementation-plan.md` (se crea en Fase 6)

---

## Notes

- Implement logout functionality as part of this story
- Consider adding "last login" timestamp to profile
- Rate limiting on failed login attempts

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-PH-5-user-authentication-authorization/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md` (US 1.2)
- **SRS:** `.context/SRS/functional-specs.md` (FR-002)
