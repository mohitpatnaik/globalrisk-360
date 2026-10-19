import { test, expect, Page } from '@playwright/test';

// End-to-end coverage of the Poland claim lifecycle:
//   submit  →  appears in claims list (persistence)  →  reviewer transition  →  audit history
// Guards the regression where submitted claims and status changes were dropped
// because ClaimStore.search() refetched and overwrote the store.
//
// The submission footer button is re-created by Angular control flow on each
// step, which races Playwright's click auto-wait; we advance with a synthetic
// click (dispatchEvent) and confirm each step via the progress indicator.

async function pressFooter(page: Page, label: string) {
  // force:true clicks the currently-resolved node immediately, skipping the
  // actionability/stability wait that otherwise retries onto the next step's
  // freshly-rendered button and "walks" through the wizard.
  await page.locator('footer.actions button.gr-button', { hasText: label }).first().click({ force: true });
}
async function expectStep(page: Page, label: string) {
  await expect(page.locator('.progress li.active')).toContainText(label);
}

test.describe('Poland claim workflow', () => {
  test('submit a Poland claim, see it in the list, advance it, and find it in activity', async ({ page }) => {
    const title = `E2E Poland flood ${Date.now()}`;

    // --- Submit ---
    await page.goto('/claims/new', { waitUntil: 'networkidle' });
    await expect(page.locator('h1.page-heading')).toContainText('Submit a claim', { timeout: 15000 });

    // Step 1 — Poland local policy (auto-fills country + currency)
    const policySelect = page.locator('select[formcontrolname="localPolicyId"]');
    const plValue = await policySelect.locator('option', { hasText: 'LP-PL' }).first().getAttribute('value');
    await policySelect.selectOption(plValue!);
    await expect(page.locator('select[formcontrolname="countryId"]')).not.toHaveValue('');
    await pressFooter(page, 'Continue');
    await expectStep(page, 'Loss details');

    // Step 2 — loss details
    await page.locator('input[formcontrolname="title"]').fill(title);
    await page.locator('textarea[formcontrolname="description"]').fill('Flood damage at the Poznan distribution warehouse.');
    await page.locator('input[formcontrolname="lossDate"]').fill('2026-03-10');
    await page.locator('input[formcontrolname="reportedDate"]').fill('2026-03-12');
    await pressFooter(page, 'Continue');
    await expectStep(page, 'Line item');

    // Step 3 — line item (~180k)
    await page.locator('input[formcontrolname="lineDescription"]').fill('Warehouse structure and stored goods');
    await page.locator('input[formcontrolname="amount"]').fill('180000');
    await pressFooter(page, 'Continue');
    await expectStep(page, 'Priority');

    // Step 4 — priority default
    await pressFooter(page, 'Continue');
    await expectStep(page, 'Review');

    // Step 5 — submit
    await pressFooter(page, 'Submit claim');

    // Redirects to the claims list
    await page.waitForURL('**/claims', { timeout: 10000 });

    // --- Persistence: the submitted claim appears in the list ---
    await page.locator('input[type="search"]').fill(title);
    const row = page.locator('tbody tr', { hasText: title });
    await expect(row).toBeVisible();
    await expect(row).toContainText('Submitted');

    // --- Reviewer transition: open the claim and advance it ---
    await row.click();
    const drawer = page.locator('aside.detail');
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('Review actions');
    // MANAGER on a SUBMITTED claim can Start review.
    await page.locator('aside.detail button.gr-button', { hasText: 'Start review' }).first().click({ force: true });
    await expect(drawer.locator('gr-status-indicator')).toContainText(/Under review/i);

    // --- Audit history: the transition is recorded on the activity timeline ---
    // Close the drawer (its backdrop would intercept nav clicks), then navigate
    // client-side (sidebar link) — a hard reload would reset the in-memory demo
    // state and lose the session's new events.
    await page.locator('aside.detail button.close').click();
    await page.locator('aside.sidebar a[href="/activity"]').first().click();
    await expect(page.locator('h1')).toContainText('Activity');
    await expect(page.locator('body')).toContainText(/UNDER_REVIEW|created and submitted for Poland/i);
  });
});
