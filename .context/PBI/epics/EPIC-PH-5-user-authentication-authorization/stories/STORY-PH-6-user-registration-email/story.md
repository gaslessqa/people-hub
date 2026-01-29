# User Registration with Corporate Email

**Jira Key:** PH-6
**Epic:** PH-5 (User Authentication & Authorization)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** user
**I want to** register with corporate email
**So that** I can access the platform

---

## Description

Implementar el flujo completo de registro de usuarios nuevos en People Hub. El usuario debe poder crear una cuenta proporcionando su email, contrasena y nombre completo. El sistema debe validar los datos, verificar que el email no exista, y enviar un email de verificacion.

El registro usa Supabase Auth como backend y debe cumplir con las politicas de seguridad definidas (password strength, email verification obligatorio).

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful registration with valid email

- **Given:** I am on the registration page
- **When:** I enter a valid email, password (min 8 chars, 1 uppercase, 1 lowercase, 1 number), and full name
- **Then:** My account is created and I receive a verification email

### Scenario 2: Registration with existing email

- **Given:** I am on the registration page
- **When:** I enter an email that already exists in the system
- **Then:** I see an error message "Email already registered"

### Scenario 3: Registration with weak password

- **Given:** I am on the registration page
- **When:** I enter a password that doesn't meet the policy requirements
- **Then:** I see an error message explaining the password requirements

### Scenario 4: Registration with invalid email format

- **Given:** I am on the registration page
- **When:** I enter an invalid email format
- **Then:** I see an error message "Please enter a valid email address"

---

## Technical Notes

### Frontend

- Page: `/register` or `/signup`
- Components: Form with email, password, confirm password, full name fields
- Use shadcn/ui form components with react-hook-form
- Real-time validation feedback
- Password strength indicator
- Loading state during submission

### Backend

- Supabase Auth `signUp` method
- Create profile record in `profiles` table with default role `recruiter`
- Trigger email verification via Supabase

### Database

- `auth.users` - Supabase managed
- `profiles` - Extended user profile with role

**IMPORTANTE:** Usar Supabase MCP para schema actualizado.

### External Services

- Supabase Auth
- Supabase Email (verification)

---

## Dependencies

### Blocked By

- None (first story of the epic)

### Blocks

- PH-7 (User Login) - needs registered users
- All other stories require users

### Related Stories

- PH-7 (Login)
- PH-8 (Password Recovery)

---

## UI/UX Considerations

- Clean, centered form layout
- Show password requirements inline
- Toggle to show/hide password
- Link to login page for existing users
- Success state: "Check your email for verification link"
- Error states clearly visible

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

- Happy path registration
- Email validation errors
- Password policy errors
- Duplicate email handling
- Email verification flow
- Security validations

---

## Implementation Plan

See: `implementation-plan.md` (se crea en Fase 6)

**Implementation Steps Expected:**

- Create registration page component
- Implement form with validation
- Connect to Supabase Auth
- Create profile on successful registration
- Handle errors gracefully
- Add loading and success states

---

## Notes

- Default role for new users: `recruiter`
- Email verification is mandatory before first login
- Consider rate limiting registration attempts

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-PH-5-user-authentication-authorization/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md` (US 1.1)
- **SRS:** `.context/SRS/functional-specs.md` (FR-001)
