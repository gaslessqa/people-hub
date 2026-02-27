/**
 * SMOKE TEST — EPIC-PH-26: Dashboard & Reporting
 * Stories: PH-36 (KPI Dashboard), PH-37 (Time to Hire), PH-38 (Recruiter Workload)
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

const USERS = {
  superAdmin: { email: 'admin@peoplehub.dev',     password: 'Admin123!',     role: 'super_admin' },
  hrAdmin:    { email: 'hr@peoplehub.dev',         password: 'Admin123!',     role: 'hr_admin' },
  recruiter:  { email: 'recruiter@peoplehub.dev',  password: 'Recruiter123!', role: 'recruiter' },
  manager:    { email: 'manager@peoplehub.dev',    password: 'Manager123!',   role: 'manager' },
};

const results = [];
const pass = (s, c, d = '') => { results.push({ s, c, status: 'PASS', d }); console.log(`  ✅ PASS | ${c}${d ? ' — ' + d : ''}`); };
const fail = (s, c, d = '') => { results.push({ s, c, status: 'FAIL', d }); console.log(`  ❌ FAIL | ${c}${d ? ' — ' + d : ''}`); };
const warn = (s, c, d = '') => { results.push({ s, c, status: 'WARN', d }); console.log(`  ⚠️  WARN | ${c}${d ? ' — ' + d : ''}`); };

// Open a fresh browser context (clean session)
async function freshPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  return ctx.newPage();
}

// Login and land on dashboard
async function loginAndGotoDashboard(browser, user, path = '/dashboard') {
  const page = await freshPage(browser);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('[data-testid="login-email-input"]', { timeout: 10000 });
  await page.fill('[data-testid="login-email-input"]', user.email);
  await page.fill('[data-testid="login-password-input"]', user.password);
  await page.click('[data-testid="login-submit-btn"]');
  // Poll until we leave /login (up to 25s)
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    const current = new URL(page.url()).pathname;
    if (!current.startsWith('/login')) break;
    await page.waitForTimeout(300);
  }
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  // Navigate to target path if not already there
  if (!page.url().includes(path)) {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }
  return page;
}

// ─── SECTION 1: PH-36 — HR Admin KPI Dashboard ───────────────────────────────

async function testHrAdminDashboard(browser) {
  console.log('\n📋 SECTION 1: PH-36 — HR Admin KPI Dashboard (super_admin)');
  const page = await loginAndGotoDashboard(browser, USERS.superAdmin, '/dashboard');

  // 1.1 Page loaded correctly
  const url = page.url();
  url.includes('/dashboard') ? pass('PH-36', 'Dashboard page loaded') : fail('PH-36', 'Dashboard page loaded', `URL: ${url}`);

  // 1.2 Five KPI cards
  for (const id of [
    'dashboard-kpi-open-vacancies',
    'dashboard-kpi-active-candidates',
    'dashboard-kpi-interviews-week',
    'dashboard-kpi-offers-pending',
    'dashboard-kpi-hires-month',
  ]) {
    const visible = await page.locator(`[data-testid="${id}"]`).isVisible();
    visible ? pass('PH-36', `KPI card: ${id}`) : fail('PH-36', `KPI card: ${id}`, 'NOT FOUND');
  }

  // 1.3 KPI value is a number
  const openVacText = await page.locator('[data-testid="dashboard-kpi-open-vacancies"]').innerText().catch(() => '');
  /\d/.test(openVacText) ? pass('PH-36', 'KPI open-vacancies has numeric value') : fail('PH-36', 'KPI open-vacancies has numeric value', `Got: "${openVacText.substring(0,40)}"`);

  // 1.4 Pipeline funnel chart
  const funnelVisible = await page.locator('[data-testid="dashboard-funnel"]').isVisible();
  funnelVisible ? pass('PH-36', 'Pipeline funnel chart visible') : fail('PH-36', 'Pipeline funnel chart visible', 'NOT FOUND');

  // 1.5 Period filter
  const datePickerVisible = await page.locator('[data-testid="dashboard-date-picker"]').isVisible();
  datePickerVisible ? pass('PH-36', 'Period filter visible') : fail('PH-36', 'Period filter visible', 'NOT FOUND');

  // 1.6 Period filter button 7d changes URL
  if (datePickerVisible) {
    const btn7 = page.locator('[data-testid="dashboard-date-picker"] button').filter({ hasText: '7' }).first();
    const btn7Visible = await btn7.isVisible({ timeout: 3000 }).catch(() => false);
    if (btn7Visible) {
      await Promise.all([
        page.waitForURL(u => u.searchParams.get('period') === '7', { timeout: 8000 }),
        btn7.click(),
      ]).catch(() => {});
      const urlAfter = new URL(page.url());
      urlAfter.searchParams.get('period') === '7'
        ? pass('PH-36', 'Period filter 7d updates URL param')
        : fail('PH-36', 'Period filter 7d updates URL param', `URL: ${page.url()}`);
      await page.goto(`${BASE_URL}/dashboard?period=30`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } else {
      warn('PH-36', 'Period filter 7d button', 'Button text "7" not found inside date-picker');
    }
  }

  // 1.7 Refresh button
  const refreshVisible = await page.locator('[data-testid="dashboard-refresh-button"]').isVisible();
  refreshVisible ? pass('PH-36', 'Refresh button visible') : fail('PH-36', 'Refresh button visible', 'NOT FOUND');

  // 1.8 Manual refresh (no crash)
  if (refreshVisible) {
    await page.locator('[data-testid="dashboard-refresh-button"]').click();
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    const pageOk = !page.url().includes('error');
    pageOk ? pass('PH-36', 'Manual refresh — page stays on dashboard') : fail('PH-36', 'Manual refresh — page stays on dashboard');
  }

  // 1.9 No error boundary
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasError = bodyText.includes('Application error') || bodyText.includes('Internal server error');
  !hasError ? pass('PH-36', 'No error boundary on page') : fail('PH-36', 'No error boundary on page');

  await page.context().close();
}

// ─── SECTION 2: PH-37 — Time to Hire ─────────────────────────────────────────

async function testTimeToHire(browser) {
  console.log('\n📋 SECTION 2: PH-37 — Time to Hire');
  const page = await loginAndGotoDashboard(browser, USERS.superAdmin, '/dashboard');

  // 2.1 TTH card visible
  const tthVisible = await page.locator('[data-testid="metric-time-to-hire"]').isVisible();
  tthVisible ? pass('PH-37', 'Time-to-hire card visible') : fail('PH-37', 'Time-to-hire card visible', 'NOT FOUND');

  // 2.2 TTH content valid
  if (tthVisible) {
    const text = await page.locator('[data-testid="metric-time-to-hire"]').innerText();
    const validContent = /\d+\s*d[íi]as|< 1 día|Sin datos suficientes/i.test(text);
    validContent
      ? pass('PH-37', 'TTH card shows valid content', text.substring(0, 50).replace(/\n/g, ' '))
      : warn('PH-37', 'TTH card content', `Got: "${text.substring(0, 50).replace(/\n/g, ' ')}"`);
  }

  // 2.3 Stage breakdown section
  const breakdownVisible = await page.locator('[data-testid="metric-stage-breakdown"]').isVisible();
  breakdownVisible ? pass('PH-37', 'Stage breakdown section visible') : fail('PH-37', 'Stage breakdown section visible', 'NOT FOUND');

  // 2.4 Vacancy filter
  const vacancyFilterVisible = await page.locator('[data-testid="filter-metric-vacancy"]').isVisible();
  vacancyFilterVisible ? pass('PH-37', 'Vacancy filter (filter-metric-vacancy) visible') : fail('PH-37', 'Vacancy filter visible', 'NOT FOUND');

  if (vacancyFilterVisible) {
    const optionCount = await page.locator('[data-testid="filter-metric-vacancy"] option').count();
    optionCount > 1
      ? pass('PH-37', `Vacancy filter has ${optionCount} options`)
      : warn('PH-37', 'Vacancy filter options', 'Only default option present (expected if no hires in seed)');
  }

  // 2.5 Chart (only if there are hires)
  const chartVisible = await page.locator('[data-testid="chart-time-trend"]').isVisible({ timeout: 2000 }).catch(() => false);
  chartVisible
    ? pass('PH-37', 'TTH stage breakdown chart rendered')
    : warn('PH-37', 'TTH stage breakdown chart', 'Not visible — expected if no hired candidates in period');

  await page.context().close();
}

// ─── SECTION 3: PH-38 — Recruiter Workload ───────────────────────────────────

async function testRecruiterWorkload(browser) {
  console.log('\n📋 SECTION 3: PH-38 — Recruiter Workload');
  const page = await loginAndGotoDashboard(browser, USERS.recruiter, '/dashboard');

  // 3.1 Workload card visible
  const workloadVisible = await page.locator('[data-testid="workload-summary"]').isVisible();
  workloadVisible ? pass('PH-38', 'Workload summary card visible') : fail('PH-38', 'Workload summary card visible', 'NOT FOUND');

  // 3.2 HR-admin sections NOT visible
  const hrKpiVisible = await page.locator('[data-testid="dashboard-kpi-interviews-week"]').isVisible({ timeout: 2000 }).catch(() => false);
  !hrKpiVisible ? pass('PH-38', 'HR-only KPI cards hidden from recruiter') : fail('PH-38', 'HR-only KPI cards hidden', 'interviews-week visible');

  const funnelVisible = await page.locator('[data-testid="dashboard-funnel"]').isVisible({ timeout: 2000 }).catch(() => false);
  !funnelVisible ? pass('PH-38', 'Pipeline funnel hidden from recruiter') : fail('PH-38', 'Pipeline funnel hidden', 'Funnel visible');

  // 3.3 Workload content
  if (workloadVisible) {
    const text = await page.locator('[data-testid="workload-summary"]').innerText();
    const noAssigned = /No tienes candidatos asignados/i.test(text);

    if (noAssigned) {
      warn('PH-38', 'Workload metrics', 'Recruiter has 0 candidates — empty state shown (expected for seed)');
    } else {
      for (const id of [
        'workload-metric-active-candidates',
        'workload-metric-interviews-to-schedule',
        'workload-metric-pending-reviews',
        'workload-metric-offers-in-progress',
      ]) {
        const visible = await page.locator(`[data-testid="${id}"]`).isVisible();
        visible ? pass('PH-38', `Metric visible: ${id}`) : fail('PH-38', `Metric visible: ${id}`, 'NOT FOUND');
      }
      const tasksVisible = await page.locator('[data-testid="workload-tasks-list"]').isVisible();
      tasksVisible ? pass('PH-38', 'Workload tasks list visible') : fail('PH-38', 'Workload tasks list visible', 'NOT FOUND');
    }
  }

  await page.context().close();
}

// ─── SECTION 4: Manager view ──────────────────────────────────────────────────

async function testManagerView(browser) {
  console.log('\n📋 SECTION 4: Manager view — base KPIs only');
  const page = await loginAndGotoDashboard(browser, USERS.manager, '/dashboard');

  // 4.1 HR sections hidden
  const hrKpi = await page.locator('[data-testid="dashboard-kpi-interviews-week"]').isVisible({ timeout: 2000 }).catch(() => false);
  !hrKpi ? pass('Manager', 'HR KPI cards hidden from manager') : fail('Manager', 'HR KPI cards hidden', 'interviews-week visible');

  const workload = await page.locator('[data-testid="workload-summary"]').isVisible({ timeout: 2000 }).catch(() => false);
  !workload ? pass('Manager', 'Recruiter workload card hidden from manager') : fail('Manager', 'Recruiter workload card hidden', 'workload-summary visible');

  // 4.2 Page loads without crash
  const bodyText = await page.locator('body').innerText().catch(() => '');
  !bodyText.includes('Application error') ? pass('Manager', 'Dashboard loads without error') : fail('Manager', 'Dashboard loads without error');

  await page.context().close();
}

// ─── SECTION 5: Backend / Period params ──────────────────────────────────────

async function testBackendIntegration(browser) {
  console.log('\n📋 SECTION 5: Backend Integration — period params & no errors');
  const page = await loginAndGotoDashboard(browser, USERS.superAdmin, '/dashboard');

  const apiErrors = [];
  page.on('response', res => {
    if (res.url().includes('/api/') && res.status() >= 400) {
      apiErrors.push(`${res.status()} ${res.url()}`);
    }
  });

  // 5.1 period=90
  await page.goto(`${BASE_URL}/dashboard?period=90`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  const kpi90 = await page.locator('[data-testid="dashboard-kpi-hires-month"]').isVisible();
  kpi90 ? pass('Backend', 'Dashboard loads with period=90') : fail('Backend', 'Dashboard loads with period=90');

  // 5.2 period=0 (all time)
  await page.goto(`${BASE_URL}/dashboard?period=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  const kpi0 = await page.locator('[data-testid="dashboard-kpi-hires-month"]').isVisible();
  kpi0 ? pass('Backend', 'Dashboard loads with period=0 (all time)') : fail('Backend', 'Dashboard loads with period=0 (all time)');

  // 5.3 No API errors
  apiErrors.length === 0
    ? pass('Backend', 'No API errors during dashboard loads')
    : fail('Backend', 'No API errors during dashboard loads', apiErrors.join(', '));

  await page.context().close();
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 SMOKE TEST — EPIC-PH-26: Dashboard & Reporting');
  console.log(`   URL: ${BASE_URL}`);
  console.log(`   Date: ${new Date().toISOString()}\n`);

  const browser = await chromium.launch({ headless: true });

  try {
    await testHrAdminDashboard(browser);
    await testTimeToHire(browser);
    await testRecruiterWorkload(browser);
    await testManagerView(browser);
    await testBackendIntegration(browser);
  } finally {
    await browser.close();
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  console.log('\n══════════════════════════════════════════');
  console.log('📊 SMOKE TEST RESULTS — EPIC-PH-26');
  console.log('══════════════════════════════════════════');
  console.log(`  ✅ PASS: ${passed}`);
  console.log(`  ❌ FAIL: ${failed}`);
  console.log(`  ⚠️  WARN: ${warned}`);
  console.log('──────────────────────────────────────────');

  if (failed > 0) {
    console.log('\n❌ FAILED CHECKS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   [${r.s}] ${r.c}${r.d ? ' → ' + r.d : ''}`);
    });
  }
  if (warned > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   [${r.s}] ${r.c}${r.d ? ' → ' + r.d : ''}`);
    });
  }

  console.log('\n══════════════════════════════════════════');
  if (failed === 0) {
    console.log('✅ SMOKE TEST PASSED — Deployment functional');
  } else {
    console.log('❌ SMOKE TEST FAILED — Fix issues before proceeding');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
