# Password Recovery

**Jira Key:** PH-8
**Epic:** PH-5 (User Authentication & Authorization)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** user
**I want to** recover my password if I forget it
**So that** I don't get locked out of my account

---

## Description

Implementar el flujo de recuperacion de contrasena via email. El usuario debe poder solicitar un reset de contrasena, recibir un email con un link seguro, y establecer una nueva contrasena.

Por seguridad, el sistema no debe revelar si un email existe o no en la base de datos.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Request password reset with valid email

- **Given:** I am on the forgot password page
- **When:** I enter my registered email
- **Then:** I see a message "If this email exists, a reset link has been sent"

### Scenario 2: Request password reset with unregistered email

- **Given:** I am on the forgot password page
- **When:** I enter an email that doesn't exist in the system
- **Then:** I see the same message "If this email exists, a reset link has been sent" (security)

### Scenario 3: Reset password with valid token

- **Given:** I clicked the reset link in my email
- **When:** I enter a new password that meets the policy
- **Then:** My password is updated and I can login with the new password

### Scenario 4: Reset password with expired token

- **Given:** I clicked a reset link that has expired (>1 hour)
- **When:** I try to reset my password
- **Then:** I see an error "Reset link has expired, please request a new one"

---

## Technical Notes

### Frontend

- Page: `/forgot-password` - Request reset
- Page: `/reset-password` - Set new password (with token)
- Components: Email input form, new password form
- Use shadcn/ui form components

### Backend

- Supabase Auth `resetPasswordForEmail` method
- Supabase Auth `updateUser` for password change
- Token expiration: 1 hour

### Database

- No direct database changes (handled by Supabase Auth)

### External Services

- Supabase Auth
- Supabase Email (reset link)

---

## Dependencies

### Blocked By

- PH-6 (User Registration) - needs registered users

### Blocks

- None directly

### Related Stories

- PH-6 (Registration)
- PH-7 (Login)

---

## UI/UX Considerations

- Simple, single-field form for email
- Clear success message (same for existing/non-existing emails)
- Password requirements shown on reset page
- Confirm password field
- Link back to login

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

- Request reset with valid email
- Request reset with invalid email
- Reset with valid token
- Reset with expired token
- Password policy validation
- Security (no email enumeration)

---

## Implementation Plan

See: `implementation-plan.md` (se crea en Fase 6)

---

## Notes

- Never reveal if email exists in the system
- Consider invalidating all sessions after password reset
- Log password reset events for security audit

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-PH-5-user-authentication-authorization/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md` (US 1.3)
- **SRS:** `.context/SRS/functional-specs.md` (FR-003)
