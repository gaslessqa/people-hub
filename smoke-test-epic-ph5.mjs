/**
 * SMOKE TEST - EPIC-PH-5: User Authentication & Authorization
 * Date: 2026-02-18
 *
 * Runs headed so the user can watch.
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = './smoke-test-screenshots';
const NAV_TIMEOUT = 30000;
const NAV_WAIT = 'domcontentloaded';

if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const results = [];
let screenshotCount = 0;

const log = msg => console.log(`[SMOKE] ${msg}`);

const pass = (section, check, detail = '') => {
  results.push({ section, check, status: 'PASS', detail });
  console.log(`  ✓ PASS | ${check}${detail ? ' — ' + detail : ''}`);
};

const fail = (section, check, detail = '') => {
  results.push({ section, check, status: 'FAIL', detail });
  console.log(`  ✗ FAIL | ${check}${detail ? ' — ' + detail : ''}`);
};

const warn = (section, check, detail = '') => {
  results.push({ section, check, status: 'WARN', detail });
  console.log(`  ⚠ WARN | ${check}${detail ? ' — ' + detail : ''}`);
};

async function screenshot(page, name) {
  screenshotCount++;
  const filename = join(SCREENSHOTS_DIR, `${String(screenshotCount).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: filename, fullPage: false }).catch(() => {});
  log(`Screenshot: ${filename}`);
}

async function goto(page, url) {
  await page.goto(url, { waitUntil: NAV_WAIT, timeout: NAV_TIMEOUT });
  await page.waitForTimeout(1500);
}

async function checkNoServerError(page, section) {
  const body = await page.textContent('body').catch(() => '');
  if (body.includes('Application error') || body.includes('Internal Server Error') || body.includes('digest:')) {
    fail(section, 'No 500/server error on page', 'Server error detected in body');
    return false;
  }
  pass(section, 'No 500/server error on page');
  return true;
}

async function loginAs(page, email, password) {
  const url = page.url();
  if (url.includes('/dashboard') || url.includes('/admin')) {
    return; // already logged in
  }
  await goto(page, `${BASE_URL}/login`);
  const currentUrl = page.url();
  if (currentUrl.includes('/dashboard')) return; // middleware redirected = already logged in

  await page.fill('[data-testid="login-email-input"]', email);
  await page.fill('[data-testid="login-password-input"]', password);
  await page.click('[data-testid="login-submit-btn"]');
  await page.waitForURL(/\/dashboard/, { timeout: NAV_TIMEOUT }).catch(() => {});
  await page.waitForTimeout(2000);
}

async function runSmokeTest() {
  log('Starting EPIC-PH-5 Smoke Test — ' + new Date().toISOString());
  log(`Target: ${BASE_URL}`);
  log('='.repeat(60));

  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  const consoleErrors = [];
  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {

    // =========================================================
    // SECTION 1: Acceso Básico
    // =========================================================
    log('\n--- SECTION 1: Acceso Básico ---');

    await goto(page, BASE_URL);

    const url1 = page.url();
    if (url1.includes('/login')) {
      pass('Section 1', 'Redirect / → /login', `URL: ${url1}`);
    } else {
      fail('Section 1', 'Redirect / → /login', `Got: ${url1}`);
    }

    await checkNoServerError(page, 'Section 1');

    // CSS check: look for styled elements (Tailwind classes)
    const hasStyling = await page.$('[class*="bg-"]').then(Boolean).catch(() => false);
    if (hasStyling) {
      pass('Section 1', 'CSS/Tailwind styles loaded');
    } else {
      fail('Section 1', 'CSS/Tailwind styles loaded', 'No bg-* classes found');
    }

    const errCount1 = consoleErrors.length;
    if (errCount1 === 0) {
      pass('Section 1', 'No console errors');
    } else {
      warn('Section 1', 'Console errors detected', `${errCount1} errors. First: ${consoleErrors[0]}`);
    }

    await screenshot(page, 'section1-login-page');

    // =========================================================
    // SECTION 2: PH-6 Registro de Usuario
    // =========================================================
    log('\n--- SECTION 2: PH-6 Registro de Usuario ---');

    await goto(page, `${BASE_URL}/register`);

    const url2 = page.url();
    if (url2.includes('/register')) {
      pass('Section 2', 'Navigate to /register');
    } else {
      warn('Section 2', 'Navigate to /register', `Got: ${url2} (may be logged in)`);
    }

    const hasFullName = await page.$('[data-testid="register-fullname-input"]').then(Boolean);
    const hasEmail = await page.$('[data-testid="register-email-input"]').then(Boolean);
    const hasPassword = await page.$('[data-testid="register-password-input"]').then(Boolean);
    const hasConfirmPassword = await page.$('[data-testid="register-confirm-password-input"]').then(Boolean);

    hasFullName ? pass('Section 2', 'Full name field present') : fail('Section 2', 'Full name field present', 'register-fullname-input missing');
    hasEmail ? pass('Section 2', 'Email field present') : fail('Section 2', 'Email field present', 'register-email-input missing');
    hasPassword ? pass('Section 2', 'Password field present') : fail('Section 2', 'Password field present', 'register-password-input missing');
    hasConfirmPassword ? pass('Section 2', 'Confirm password field present') : fail('Section 2', 'Confirm password field present', 'register-confirm-password-input missing');

    if (hasFullName && hasEmail && hasPassword && hasConfirmPassword) {
      await page.fill('[data-testid="register-fullname-input"]', 'Smoke Test User');
      await page.fill('[data-testid="register-email-input"]', 'test-smoke@example.com');
      await page.fill('[data-testid="register-password-input"]', 'Admin123!');
      await page.fill('[data-testid="register-confirm-password-input"]', 'Admin123!');

      await screenshot(page, 'section2-register-form-filled');

      await page.click('[data-testid="register-submit-btn"]');
      await page.waitForTimeout(4000);

      const body2 = await page.textContent('body').catch(() => '');
      const hasSuccessScreen = await page.$('[data-testid="register-success-screen"]').then(Boolean);
      const hasEmailConfirmText = body2.includes('Revisa') || body2.includes('email') || body2.includes('confirmación');
      const isDuplicateEmail = body2.includes('ya está registrado') || body2.includes('already registered');

      if (hasSuccessScreen || hasEmailConfirmText) {
        pass('Section 2', '"Check your email" success screen shown');

        if (body2.includes('test-smoke@example.com')) {
          pass('Section 2', 'Registered email shown in success message');
        } else {
          fail('Section 2', 'Registered email shown in success message', 'Email not visible in success content');
        }

        const hasResendBtn = await page.$('[data-testid="register-resend-btn"]').then(Boolean);
        hasResendBtn
          ? pass('Section 2', '"Resend email" button visible')
          : fail('Section 2', '"Resend email" button visible', 'register-resend-btn not found');
      } else if (isDuplicateEmail) {
        warn('Section 2', '"Check your email" success screen shown', 'Email already exists — test user was seeded previously');
        pass('Section 2', 'Form submission returns error for duplicate', 'Expected on repeat runs');
      } else {
        fail('Section 2', '"Check your email" success screen shown', `Unexpected content: ${body2.substring(0, 150)}`);
      }
    }

    await screenshot(page, 'section2-register-result');

    // =========================================================
    // SECTION 3: PH-7 Login con Credenciales
    // =========================================================
    log('\n--- SECTION 3: PH-7 Login con Credenciales ---');

    await goto(page, `${BASE_URL}/login`);

    const url3 = page.url();
    if (!url3.includes('/login')) {
      warn('Section 3', 'On /login page', `Was redirected to ${url3} — may be logged in`);
      // Sign out first
      await goto(page, `${BASE_URL}/login`); // middleware will keep redirecting if logged in
    }

    if (page.url().includes('/login')) {
      // Check demo credentials block
      const hasDemoBlock = await page.$('.bg-blue-50').then(Boolean);
      hasDemoBlock
        ? pass('Section 3', 'Demo credentials block (blue) visible')
        : fail('Section 3', 'Demo credentials block (blue) visible', 'bg-blue-50 not found');

      // Click "Super Admin" quick fill button
      const superAdminEl = await page.getByText('Super Admin:', { exact: false }).first().catch(() => null);
      if (superAdminEl) {
        await superAdminEl.click();
        await page.waitForTimeout(600);
        pass('Section 3', '"Super Admin" quick-fill button clicked');

        const emailVal = await page.inputValue('[data-testid="login-email-input"]').catch(() => '');
        const pwVal = await page.inputValue('[data-testid="login-password-input"]').catch(() => '');

        emailVal === 'admin@peoplehub.dev'
          ? pass('Section 3', 'Email auto-filled correctly', emailVal)
          : fail('Section 3', 'Email auto-filled correctly', `Got: ${emailVal}`);

        pwVal === 'Admin123!'
          ? pass('Section 3', 'Password auto-filled correctly')
          : fail('Section 3', 'Password auto-filled correctly', 'Password value mismatch');
      } else {
        warn('Section 3', '"Super Admin" quick-fill button', 'Text not found — manually filling');
        await page.fill('[data-testid="login-email-input"]', 'admin@peoplehub.dev');
        await page.fill('[data-testid="login-password-input"]', 'Admin123!');
      }

      await screenshot(page, 'section3-login-prefilled');

      await page.click('[data-testid="login-submit-btn"]');
      await page.waitForURL(/\/dashboard/, { timeout: NAV_TIMEOUT }).catch(() => {});
      await page.waitForTimeout(2000);

      const url3post = page.url();
      if (url3post.includes('/dashboard')) {
        pass('Section 3', 'Redirect to /dashboard after login', url3post);
        await checkNoServerError(page, 'Section 3');
      } else {
        fail('Section 3', 'Redirect to /dashboard after login', `At: ${url3post}`);
      }
    }

    await screenshot(page, 'section3-dashboard-after-login');

    // =========================================================
    // SECTION 4: Sesión Persistente (PH-7)
    // =========================================================
    log('\n--- SECTION 4: Sesión Persistente (PH-7) ---');

    if (page.url().includes('/dashboard')) {
      await page.reload({ waitUntil: NAV_WAIT, timeout: NAV_TIMEOUT });
      await page.waitForTimeout(2000);

      const urlAfterRefresh = page.url();
      urlAfterRefresh.includes('/dashboard')
        ? pass('Section 4', 'Session persists after page refresh', urlAfterRefresh)
        : fail('Section 4', 'Session persists after page refresh', `Redirected to: ${urlAfterRefresh}`);

      // Check user identity visible
      const body4 = await page.textContent('body').catch(() => '');
      const hasUserInfo =
        body4.includes('Super Admin') ||
        body4.includes('admin@peoplehub.dev') ||
        body4.includes('SA') ||
        body4.includes('People Hub');

      hasUserInfo
        ? pass('Section 4', 'User identifier/name visible in UI')
        : warn('Section 4', 'User identifier/name visible in UI', 'Could not confirm name/avatar in body text');
    } else {
      fail('Section 4', 'Prerequisite: logged in on dashboard', `At: ${page.url()}`);
    }

    await screenshot(page, 'section4-session-persists');

    // =========================================================
    // SECTION 5: PH-8 Recuperación de Contraseña
    // =========================================================
    log('\n--- SECTION 5: PH-8 Recuperación de Contraseña ---');

    // Use incognito context (unauthenticated)
    const incognito = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const iPage = await incognito.newPage();

    await iPage.goto(`${BASE_URL}/forgot-password`, { waitUntil: NAV_WAIT, timeout: NAV_TIMEOUT });
    await iPage.waitForTimeout(1500);

    const url5 = iPage.url();
    if (url5.includes('/forgot-password')) {
      pass('Section 5', 'Navigate to /forgot-password');

      const fpInput = await iPage.$('[data-testid="forgot-password-email-input"]').then(Boolean);
      fpInput
        ? pass('Section 5', 'Forgot-password form loads with email field')
        : fail('Section 5', 'Forgot-password form loads with email field', 'forgot-password-email-input missing');

      await iPage.fill('[data-testid="forgot-password-email-input"]', 'admin@peoplehub.dev');
      await screenshot(iPage, 'section5-forgot-password-filled');
      await iPage.click('[data-testid="forgot-password-submit-btn"]');
      await iPage.waitForTimeout(4000);

      const body5a = await iPage.textContent('body').catch(() => '');
      const hasSuccessAlert5a = await iPage.$('[data-testid="forgot-password-success-alert"]').then(Boolean);
      const showsSuccess5a = hasSuccessAlert5a || body5a.includes('recibirás') || body5a.includes('Revisa');

      showsSuccess5a
        ? pass('Section 5', 'Success message shown for valid email (admin@peoplehub.dev)')
        : fail('Section 5', 'Success message shown for valid email', `Body: ${body5a.substring(0, 200)}`);

      await screenshot(iPage, 'section5-forgot-password-success-valid');

      // Non-existent email — anti-enumeration
      await iPage.goto(`${BASE_URL}/forgot-password`, { waitUntil: NAV_WAIT, timeout: NAV_TIMEOUT });
      await iPage.waitForTimeout(1000);
      await iPage.fill('[data-testid="forgot-password-email-input"]', 'nonexistent@test.com');
      await iPage.click('[data-testid="forgot-password-submit-btn"]');
      await iPage.waitForTimeout(4000);

      const body5b = await iPage.textContent('body').catch(() => '');
      const hasSuccessAlert5b = await iPage.$('[data-testid="forgot-password-success-alert"]').then(Boolean);
      const showsSuccess5b = hasSuccessAlert5b || body5b.includes('recibirás') || body5b.includes('Revisa');

      showsSuccess5b
        ? pass('Section 5', 'SAME success message for nonexistent email (anti-enumeration)', 'Anti-enumeration pattern confirmed')
        : fail('Section 5', 'SAME success message for nonexistent email', `Body: ${body5b.substring(0, 200)}`);

      await screenshot(iPage, 'section5-forgot-password-success-nonexistent');
    } else {
      fail('Section 5', 'Navigate to /forgot-password', `Got: ${url5}`);
    }

    await incognito.close();

    // =========================================================
    // SECTION 6: PH-9 User Management (Super Admin)
    // =========================================================
    log('\n--- SECTION 6: PH-9 User Management (Super Admin) ---');

    // Ensure Super Admin session on main page
    if (!page.url().includes('/dashboard') && !page.url().includes('/admin')) {
      await loginAs(page, 'admin@peoplehub.dev', 'Admin123!');
    }

    await goto(page, `${BASE_URL}/admin/users`);
    await page.waitForTimeout(1000);

    const url6 = page.url();
    if (url6.includes('/admin/users')) {
      pass('Section 6', 'Super Admin can access /admin/users', url6);
      await checkNoServerError(page, 'Section 6');

      const hasTable = await page.$('[data-testid="usersTable"]').then(Boolean);
      hasTable
        ? pass('Section 6', 'User management table rendered')
        : fail('Section 6', 'User management table rendered', 'usersTable data-testid not found');

      const body6 = await page.textContent('body').catch(() => '');

      // Demo user checks
      body6.includes('admin@peoplehub.dev') || body6.includes('Super Admin')
        ? pass('Section 6', 'Super Admin demo user appears in list')
        : fail('Section 6', 'Super Admin demo user appears in list', 'admin@peoplehub.dev not visible');

      body6.includes('hr@peoplehub.dev') || body6.includes('HR Admin')
        ? pass('Section 6', 'HR Admin demo user appears in list')
        : fail('Section 6', 'HR Admin demo user appears in list', 'hr@peoplehub.dev not visible');

      body6.includes('recruiter@peoplehub.dev') || body6.includes('Recruiter')
        ? pass('Section 6', 'Recruiter demo user appears in list')
        : fail('Section 6', 'Recruiter demo user appears in list', 'recruiter@peoplehub.dev not visible');

      const rows = await page.$$('[data-testid="user-table-row"]');
      pass('Section 6', `User rows count in table`, `${rows.length} rows found`);
    } else {
      fail('Section 6', 'Super Admin can access /admin/users', `Redirected to: ${url6}`);
    }

    await screenshot(page, 'section6-admin-users');

    // =========================================================
    // SECTION 7: Logout
    // =========================================================
    log('\n--- SECTION 7: Logout ---');

    // Navigate to dashboard first to have access to sidebar
    if (!page.url().includes('/dashboard')) {
      await goto(page, `${BASE_URL}/dashboard`);
    }

    await screenshot(page, 'section7-pre-logout-dashboard');

    // The logout is in a dropdown menu — click the user button at sidebar bottom
    // data-sidebar="menu-button" with size="lg" in SidebarFooter
    let loggedOut = false;

    // Strategy 1: Look for the sidebar footer trigger button
    const sidebarMenuBtn = await page.$('[data-sidebar="menu-button"][size="lg"], [data-sidebar="footer"] button').catch(() => null);
    if (sidebarMenuBtn) {
      await sidebarMenuBtn.click();
      await page.waitForTimeout(700);
      const logoutItem = await page.$('[data-testid="logout-btn"]').catch(() => null);
      if (logoutItem) {
        await logoutItem.click();
        loggedOut = true;
      }
    }

    if (!loggedOut) {
      // Strategy 2: Look for dropdown menu trigger by text
      const chvrn = await page.locator('[data-sidebar="footer"]').first().catch(() => null);
      if (chvrn) {
        await chvrn.click();
        await page.waitForTimeout(700);
        const logoutItemB = await page.getByText('Cerrar sesión').first().catch(() => null);
        if (logoutItemB) {
          await logoutItemB.click();
          loggedOut = true;
        }
      }
    }

    if (!loggedOut) {
      // Strategy 3: Direct click on "Cerrar sesión" text anywhere visible
      await page.getByText('Cerrar sesión').first().click().catch(async () => {
        // Strategy 4: Use keyboard
        await page.keyboard.press('Escape');
      });
    }

    await page.waitForTimeout(3000);

    const url7post = page.url();
    if (url7post.includes('/login')) {
      pass('Section 7', 'Redirect to /login after logout', url7post);
    } else {
      fail('Section 7', 'Redirect to /login after logout', `Still at: ${url7post}. Dropdown may not have opened`);
    }

    await screenshot(page, 'section7-after-logout');

    // Protected route test after logout
    await goto(page, `${BASE_URL}/dashboard`);

    const url7protected = page.url();
    url7protected.includes('/login')
      ? pass('Section 7', 'Protected /dashboard → redirects to /login after logout', url7protected)
      : fail('Section 7', 'Protected /dashboard → redirects to /login after logout', `Got: ${url7protected}`);

    await screenshot(page, 'section7-protected-redirect');

    // =========================================================
    // SECTION 8: Control de Acceso por Rol (PH-9/PH-10)
    // =========================================================
    log('\n--- SECTION 8: Control de Acceso por Rol (Recruiter) ---');

    // Login as Recruiter
    await goto(page, `${BASE_URL}/login`);
    const url8pre = page.url();

    if (url8pre.includes('/login')) {
      await page.fill('[data-testid="login-email-input"]', 'recruiter@peoplehub.dev');
      await page.fill('[data-testid="login-password-input"]', 'Recruiter123!');
      await screenshot(page, 'section8-recruiter-login');
      await page.click('[data-testid="login-submit-btn"]');
      await page.waitForURL(/\/dashboard/, { timeout: NAV_TIMEOUT }).catch(() => {});
      await page.waitForTimeout(2000);

      const urlRecruiter = page.url();
      if (urlRecruiter.includes('/dashboard')) {
        pass('Section 8', 'Recruiter can login and access /dashboard', urlRecruiter);
        await checkNoServerError(page, 'Section 8');

        // Check NO admin sidebar item
        const body8 = await page.textContent('body').catch(() => '');
        const hasAdminItem = body8.includes('Gestión de Usuarios');
        !hasAdminItem
          ? pass('Section 8', 'Admin "Gestión de Usuarios" NOT visible for Recruiter role')
          : fail('Section 8', 'Admin "Gestión de Usuarios" NOT visible for Recruiter role', '"Gestión de Usuarios" found in sidebar for Recruiter');

        await screenshot(page, 'section8-recruiter-dashboard');

        // Try to access /admin/users as Recruiter
        await goto(page, `${BASE_URL}/admin/users`);
        await page.waitForTimeout(1000);

        const urlAdminAttempt = page.url();
        if (urlAdminAttempt.includes('/login')) {
          pass('Section 8', 'Recruiter blocked from /admin/users → redirected to /login', urlAdminAttempt);
        } else if (urlAdminAttempt.includes('/dashboard') && !urlAdminAttempt.includes('/admin')) {
          pass('Section 8', 'Recruiter blocked from /admin/users → redirected to /dashboard', urlAdminAttempt);
        } else if (urlAdminAttempt.includes('/admin/users')) {
          fail('Section 8', 'Recruiter blocked from /admin/users', 'SECURITY ISSUE: Recruiter can access admin page!');
        } else {
          warn('Section 8', 'Recruiter /admin/users access result', `URL: ${urlAdminAttempt}`);
        }

        await screenshot(page, 'section8-recruiter-admin-attempt');
      } else {
        fail('Section 8', 'Recruiter login leads to /dashboard', `At: ${urlRecruiter}`);
      }
    } else {
      warn('Section 8', 'Starting Recruiter login test', `Was not on /login: ${url8pre}`);
    }

    // =========================================================
    // FINAL SUMMARY
    // =========================================================
    log('\n' + '='.repeat(60));
    log('SMOKE TEST COMPLETE — EPIC-PH-5');
    log('='.repeat(60));

    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    const warnCount = results.filter(r => r.status === 'WARN').length;

    log(`\nRESULTS: ${passCount} PASS | ${failCount} FAIL | ${warnCount} WARN`);
    log(`Total checks: ${results.length}`);
    log(`Overall Status: ${failCount === 0 ? 'PASS' : 'FAIL'}`);

    if (failCount > 0) {
      log('\nFAILED CHECKS:');
      results.filter(r => r.status === 'FAIL').forEach(r => {
        log(`  [${r.section}] ${r.check}${r.detail ? ' → ' + r.detail : ''}`);
      });
    }

    if (warnCount > 0) {
      log('\nWARNINGS:');
      results.filter(r => r.status === 'WARN').forEach(r => {
        log(`  [${r.section}] ${r.check}${r.detail ? ' → ' + r.detail : ''}`);
      });
    }

    const report = {
      testName: 'EPIC-PH-5 Smoke Test',
      date: new Date().toISOString(),
      totalChecks: results.length,
      pass: passCount,
      fail: failCount,
      warn: warnCount,
      overallStatus: failCount === 0 ? 'PASS' : 'FAIL',
      checks: results,
    };

    writeFileSync('./smoke-test-results.json', JSON.stringify(report, null, 2));
    log(`\nReport saved: smoke-test-results.json`);
    log(`Screenshots: ${SCREENSHOTS_DIR}/`);

  } catch (err) {
    log(`FATAL ERROR: ${err.message}`);
    console.error(err);
    await screenshot(page, 'fatal-error-state').catch(() => {});
  } finally {
    await page.waitForTimeout(4000);
    await browser.close();
  }
}

runSmokeTest().catch(console.error);
