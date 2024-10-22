import { Page } from "@playwright/test";

export async function expandVendorHeaders(page: Page) {
  // Expand all headings
  await page.getByRole('combobox', { name: 'Name' }).press('Alt+Shift+ArrowDown');
  await page.getByRole('combobox', { name: 'Name' }).press('Alt+Shift+ArrowDown');
  await page.getByRole('button', { name: 'Addresses' }).press('Alt+Shift+ArrowDown');
  await page.getByRole('button', { name: 'Contact information', exact: true }).press('Alt+Shift+ArrowDown');
  await page.getByLabel('Credit rating', { exact: true }).press('Alt+Shift+ArrowDown');
  await page.getByRole('checkbox', { name: 'Bid only' }).press('Alt+Shift+ArrowDown');
  await page.getByRole('combobox', { name: 'Currency CAD Click to follow' }).press('Alt+Shift+ArrowDown');
  await page.getByLabel('Invoice account', { exact: true }).press('Alt+Shift+ArrowDown');
  await page.getByLabel('Charges group', { exact: true }).press('Alt+Shift+ArrowDown');
  await page.getByLabel('Terms of payment', { exact: true }).press('Alt+Shift+ArrowDown');
  await page.getByLabel('Terms of payment', { exact: true }).press('Alt+Shift+ArrowDown');
  await page.getByRole('combobox', { name: 'Sales price rounding' }).press('Alt+Shift+ArrowDown');
} 