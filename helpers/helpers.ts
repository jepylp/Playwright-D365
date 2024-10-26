import { Page, expect } from "@playwright/test";

export async function expandVendorHeaders(page: Page) {
  /**
   * Expand all the headers for a vendor card in D365FO
   * 
   * @param page - provide the page that needs to have the headers expanded
   */
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
};

export async function setVendorName(page: Page, vendorName: string) {
  /**
   * Returns an incremented vendor name
   * If this vendor has NOT been created then return the "Vendor name" with a 1
   * 
   * If the vendor has been created then increment the number at the end
   * 
   * @param page - the vendor list page
   * @param vendorName - the vendor name to be used without the increment
   * 
   * @returns incremented vendor name
   */

  // Variables
  var vendNameTest: any;
  var vendSuffix: number = 1;
  var r: string;
  
  // Get the latest test vendor
  await page.getByLabel('Vendors', { exact: true }).getByText('Name').click();
  await page.getByRole('button', { name: 'begins with ' }).click();
  await page.getByRole('menuitem', { name: 'begins with' }).click();
  await page.getByLabel('Filter field: Name, operator').click();
  await page.getByLabel('Filter field: Name, operator').fill(vendorName);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByLabel('Vendors', { exact: true }).getByText('Name').click();
  await page.getByRole('button', { name: ' Sort Z to A' }).click();
  await page.getByLabel('Vendors', { exact: true }).getByText('Vendor account').click();
  await page.getByRole('button', { name: ' Sort Z to A' }).click();
  
  // Currently there is one textbox at the top of the page
  if ((await page.getByRole('textbox').count() !== 1)) {

    // click the textbox at the top of the page to find the most recent match
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('textbox').nth(1).press('Enter');
    await expect(page.getByRole('heading', { name: 'General Group: VENDOR' }).getByLabel('General')).toBeVisible({timeout: 20000});

    vendNameTest = await page.locator('#vendtablelistpage_3_Org_Name_input').innerText();
    vendNameTest = String(vendNameTest).split(' ',);
    vendNameTest = vendNameTest[vendNameTest.length-1]; // get the number at the end
    vendSuffix = +vendNameTest + 1 // + infront of vendNameTest converts it to an integer
  }

  // add leading zeros to the suffix
  r = vendorName + ' ' + vendSuffix.toString().padStart(3,'0');
  console.log(`Vendor name: ${r}`);
  return r;
}