import { expect, test } from '@playwright/test';
import { expectNoAccessibilityViolations } from '../support/accessibility.ts';
import { openTopicPage, topicPageTests } from '../support/topic-page.ts';

test('shows a topic', async ({ page }) => {
  await page.goto('/topics/health-behaviours');

  await expect(page.getByRole('heading', { level: 1, name: 'Health behaviours' })).toBeVisible();
  await expect(
    page.locator('#topic-overview').getByText('Everyday behaviours that affect health'),
  ).toBeVisible();
});

test('answers a topic that does not exist with the not-found page', async ({ page }) => {
  const response = await page.goto('/topics/no-such-topic');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
});

test('has no WCAG 2.2 AA violations', async ({ page }, testInfo) => {
  await page.goto('/topics/health-behaviours');

  await expectNoAccessibilityViolations(page, testInfo);
});

topicPageTests();

test('compares a chosen area with England and shows minimum and maximum values', async ({
  page,
}, testInfo) => {
  await openTopicPage(page, '/topics/diabetes?tab-topic=data');
  const panel = page.getByRole('tabpanel', { name: 'Data', exact: true });
  await panel
    .getByRole('searchbox', { name: 'Search for a geography', exact: true })
    .fill('West Sussex');
  await panel.getByRole('checkbox', { name: 'West Sussex', exact: true }).check();
  await expect(page).toHaveURL(/ga=E10000032/);
  const table = panel.getByRole('table');
  await expect(
    table.getByRole('columnheader', { name: 'Compared with England', exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole('columnheader', { name: 'Comparison summary', exact: true }),
  ).toBeVisible();
  await expectNoAccessibilityViolations(page, testInfo);
  await panel.getByRole('button', { name: 'Table columns', exact: true }).click();
  await panel.getByRole('checkbox', { name: 'Minimum/Maximum values', exact: true }).check();
  await expect(
    table.getByRole('columnheader', { name: 'England lowest', exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole('columnheader', { name: 'England highest', exact: true }),
  ).toBeVisible();
  await expectNoAccessibilityViolations(page, testInfo);
});
