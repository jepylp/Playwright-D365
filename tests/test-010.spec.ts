import { test, expect } from '@playwright/test';
import { expandVendorHeaders } from '../helpers/helpers.ts';

test.use({
    ignoreHTTPSErrors:true,
    video: {
      mode: 'on', 
      size: { width: 1280, height: 720 },
    }
});

test.describe.configure({ mode: 'parallel' });

test('Change to Company 010', async ({ page }) => {
  await page.goto('https://usnconeboxax1aos.cloud.onebox.dynamics.com/');
  await page.click('[id="CompanyButton_button"]');
  await page.getByLabel('Current company', { exact: true }).click();
  await page.getByLabel('Current company', { exact: true }).fill('010');
  await page.getByLabel('Current company', { exact: true }).press('Enter');
  await expect(page.getByRole('heading', { name: 'CESLP Corporate' })).toHaveText('CESLP Corporate');
});

test('new vendor', async ({ page }) => {
  test.setTimeout(3 * 60 * 1000) // 3 minutes
  var company = '010';
  var vendSuffix = 1; // starting number

  var vendPrefix = 'Test Vend ' + company;
  var vendNameTest; // used for testing if the vendor name has been used
  var vendorName;
  
  await page.goto('https://usnconeboxax1aos.cloud.onebox.dynamics.com/?cmp=' + company);
  await page.getByLabel('Expand the navigation pane').click();
  await page.getByLabel('Modules').click();
  await page.getByRole('treeitem', { name: 'Accounts payable' }).click();
  await page.getByRole('button', { name: 'Expand all' }).click();
  await page.getByText('All vendors').click();

  // Get the latest test vendor
  await page.getByLabel('Vendors', { exact: true }).getByText('Name').click();
  await page.getByRole('button', { name: 'begins with ' }).click();
  await page.getByRole('menuitem', { name: 'begins with' }).click();
  await page.getByLabel('Filter field: Name, operator').click();
  await page.getByLabel('Filter field: Name, operator').fill(vendPrefix);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByLabel('Vendors', { exact: true }).getByText('Name').click();
  await page.getByRole('button', { name: ' Sort Z to A' }).click();
  await page.getByLabel('Vendors', { exact: true }).getByText('Vendor account').click();
  await page.getByRole('button', { name: ' Sort Z to A' }).click();
  
  // This seciton allows for incremental naming
  console.log(await page.getByRole('textbox').count())
  // Could change the 1 to a variable if we think this might change
  if ((await page.getByRole('textbox').count() !== 1)) {
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('textbox').nth(1).press('Enter');
    await expect(page.getByRole('heading', { name: 'General Group: VENDOR' }).getByLabel('General')).toBeVisible({timeout: 20000});

    vendNameTest = await page.locator('#vendtablelistpage_3_Org_Name_input').innerText();
    vendNameTest = String(vendNameTest).split(' ',);
    vendNameTest = vendNameTest[vendNameTest.length-1];
    vendSuffix = +vendNameTest + 1 // + infront of vendNameTest converts it to an integer
    console.log(vendSuffix);
  } 

  vendorName = vendPrefix + ' ' + vendSuffix;
  
  console.log(vendorName);

  // Create a new vendor
  await page.getByRole('button', { name: ' New' }).click();

  await expect(page.getByLabel('Identification').getByText('Vendor account')).toBeVisible({timeout: 10000});
  
  // Too many values returned with default selector
  var vendorAccount = await page.getByRole('textbox', { name: 'Vendor account' }).inputValue();
  
  // expand the vendor headers using a reusable function
  await expandVendorHeaders(page);
  
  /*
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
  */

  // return to the top of the form ( should be able to change this to a click)
  await page.getByLabel('Department value').press('Alt+Shift+ArrowUp');
  await page.getByRole('combobox', { name: 'Sales price rounding' }).press('Alt+Shift+ArrowUp');
  await page.getByLabel('Terms of payment', { exact: true }).press('Alt+Shift+ArrowUp');
  await page.getByLabel('Invoice account', { exact: true }).press('Alt+Shift+ArrowUp');
  await page.getByRole('combobox', { name: 'Currency CAD Click to follow' }).press('Alt+Shift+ArrowUp');
  await page.getByRole('button', { name: 'Vendor profile' }).press('Alt+Shift+ArrowUp');
  await page.getByLabel('Credit rating', { exact: true }).press('Alt+Shift+ArrowUp');
  await page.getByRole('button', { name: 'Contact information', exact: true }).press('Alt+Shift+ArrowUp');

  // Start filling in information
  await page.getByRole('combobox', { name: 'Name' }).click();
  await page.getByRole('combobox', { name: 'Name' }).fill(vendorName);
  await page.getByRole('combobox', { name: 'Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Search name' }).press('Tab');
  await page.getByRole('combobox', { name: 'Group', exact: true }).fill('vend');
  await page.getByRole('combobox', { name: 'Group', exact: true }).press('Tab');
  await page.getByLabel('Number of employees').press('Tab');
  await page.getByLabel('Organization number').click();
  await page.getByLabel('Organization number').fill('111222333');
  await page.getByLabel('Organization number').press('Tab');
  await page.getByRole('combobox', { name: 'ABC code' }).press('Tab');
  await page.getByLabel('DUNS number').press('Tab');
  await page.getByLabel('Address books').press('Tab');
  await page.getByLabel('Known as').press('Tab');
  await page.getByLabel('Phonetic name').press('Tab');

  // Create the address
  await page.getByLabel('LogisticsPostalAddressGrid').getByRole('button', { name: ' Add' }).click();

  // This window can take a while to pop up, gave it a 30 second to pop up
  await expect(page.getByRole('button', { name: 'Standard view', exact: true })).toBeVisible({timeout: 30000});
  await page.getByRole('heading', { name: 'New address' }).click();
  await expect(page.getByRole('heading', { name: 'New address' })).toBeVisible();
  await page.getByLabel('Name or description').click();
  await page.getByLabel('Name or description').fill(vendorName);
  await page.getByLabel('Name or description').press('Tab');
  await page.getByLabel('Purpose', { exact: true }).click();
  await page.getByText('Role', { exact: true }).click();
  await page.getByRole('button', { name: 'is one of ' }).click();
  await page.getByRole('menuitem', { name: 'is one of' }).click();
  await page.getByLabel('Filter field: Role, operator').click();
  await page.getByLabel('Filter field: Role, operator').fill('business');
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByLabel('Filter field: Role, operator').click();
  await page.getByLabel('Filter field: Role, operator').fill('remit to');
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByRole('row', { name: 'Business Business' }).getByRole('checkbox').click();
  await page.getByRole('row', { name: 'Remit to Remit-to' }).getByRole('checkbox').click();
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByLabel('Country/region', { exact: true }).fill('CAN');
  await page.getByLabel('Country/region', { exact: true }).press('Tab');
  await page.getByLabel('ZIP/postal code').fill('A1B2C3');
  await page.getByLabel('Street', { exact: true }).click();
  await page.getByLabel('Street', { exact: true }).fill('1122 33 AVE NW');
  await page.getByLabel('Street', { exact: true }).press('Tab');
  await page.getByLabel('City').fill('Calgary');
  await page.getByLabel('State').click();
  await page.getByLabel('State').fill('AB');
  await page.getByRole('button', { name: 'OK' }).click();

  // New contact information section
  await page.locator('#vendtablelistpage_3_NewContactInfo').click();
  await page.getByLabel('Description', { exact: true }).click();
  await page.getByLabel('Description', { exact: true }).fill('Phone Number');
  await page.getByLabel('Communication details').getByLabel('Type', { exact: true }).click();
  await page.getByLabel('Communication details').getByLabel('Type', { exact: true }).press('Shift+Home');
  await page.getByLabel('Communication details').getByLabel('Type', { exact: true }).fill('Phone');
  await page.getByLabel('Contact number/address').click();
  await page.getByLabel('Contact number/address').fill('111 222 3333');
  await page.getByRole('checkbox', { name: 'Primary' }).click();
  await page.locator('#vendtablelistpage_3_NewContactInfo').click();
  await page.getByRole('row', { name: 'The row is up to date. Phone Primary Type Phone' }).getByLabel('Description').click();
  await page.getByRole('row', { name: 'The row is up to date. Phone Primary Type Phone' }).getByLabel('Description').fill('Email Address');
  await page.getByLabel('Communication details').getByRole('combobox', { name: 'Type' }).fill('Email address');
  await page.getByRole('row', { name: 'The row is up to date. Email' }).getByLabel('Contact number/address').click();
  await page.getByRole('row', { name: 'The row is up to date. Email' }).getByLabel('Contact number/address').fill('test1@test1.com');
  await page.getByRole('row', { name: 'The row is up to date. Email' }).getByLabel('Primary').click();
  
  // Sales Tax
  await page.getByLabel('Sales tax group', { exact: true }).click();
  await page.getByLabel('Sales tax group', { exact: true }).fill('T.....S01');

  // Method of Payment
  await page.getByLabel('Method of payment', { exact: true }).click();
  await page.getByLabel('Method of payment', { exact: true }).fill('check');
  await page.getByLabel('Method of payment', { exact: true }).press('Tab');

  // Save the vendor and refresh by going back to the main list and back into the vendor page
  await page.getByRole('button', { name: ' Save' }).click();
  await page.getByRole('link', { name: 'All vendors' }).click();
  await expect(page.getByRole('button', { name: 'Standard view' })).toBeVisible();
  await page.goto('https://usnconeboxax1aos.cloud.onebox.dynamics.com/?cmp=' + company + '&mi=VendTableListPage');
  await expect(page.getByRole('button', { name: 'Standard view' })).toBeVisible();
  await page.getByLabel('Vendors', { exact: true }).getByText('Vendor account').click();
  await page.getByRole('button', { name: ' Sort Z to A' }).click();
  await page.locator('#VendTable_AccountNum_3_0_0_input').click();
  await page.locator('#VendTable_AccountNum_3_0_0_input').press('Enter');
  await expect(page.getByRole('heading', { name: 'General Group: VENDOR' }).getByLabel('General')).toBeVisible({timeout: 10000});

  // Asserts for the invoice testing
  await expect(page.getByLabel('Identification').getByText('Vendor account')).toBeVisible({timeout: 10000});
  await expect(page.getByLabel(company + '-')).toContainText(vendorAccount);
  await expect(page.locator('#vendtablelistpage_1_Org_Name_input')).toContainText(vendorName);
  await expect(page.getByLabel('Search name')).toHaveValue(vendorName);

  await expect(page.locator('#vendtablelistpage_1_Posting_VendGroup_input')).toContainText('VENDOR');
  await expect(page.getByLabel('Organization number')).toHaveValue('111222333');
  await expect(page.getByLabel('Name or description')).toHaveValue(vendorName);

  // Look into how to verify a multi line textbox
  //await expect(page.getByLabel('Address', { exact: true })).toHaveValue('1122 33 AVE NW\nCalgary, AB A1B2C3\nCAN');
  await expect(page.getByLabel('Purpose', { exact: true })).toHaveValue('Business;Remit-to');
  await expect(page.getByRole('textbox', { name: 'Primary' })).toHaveValue('Yes');
  await expect(page.getByLabel('Terms of payment', { exact: true })).toContainText('N30');
  await expect(page.locator('#vendtablelistpage_1_Payment_PaymMode_input')).toContainText('CHECK');

  await page.screenshot({path: 'vendortest.png' });
  console.log(await page.video()?.path);

});