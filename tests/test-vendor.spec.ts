import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync'; // <= csv-parse/sync required for fs.readFileSync

import { expandVendorHeaders, 
  setVendorName} from '../helpers/helpers.ts'

test.use({
    ignoreHTTPSErrors:true,
    video: {
      mode: 'on', // use 'retain-on-failure' when running regularly
      size: { width: 1280, height: 720 },
    }
});

test.describe.configure({ mode: 'parallel' }); 

// Import CSV
const records = parse(fs.readFileSync(path.join(__dirname, '..', 'csv', 'vendors.tsv')), {
  columns: true,
  skip_empty_lines: true,
  delimiter: '\t'
});

for (const record of records) {
  const testName = `${record.company_code} ${record.country_code} ${record.state_province} ${record.method_of_payment}`
  console.log(`Creating vendor: ${testName}`)
  test(`New Vendor: ${testName}`, async({ page }) => {
    test.setTimeout(3 * 60 * 1000) // 3 minutes
    var vendorName: string;
    var vendorAccount: string;
    var vendNameTest: any;
    var vendSuffix: number = 1;
    var url = `https://usnconeboxax1aos.cloud.onebox.dynamics.com/?cmp=${record.company_code}`;
   
    // Navigate to the company in D365
    
    console.log(url);
    await page.goto(url);
    
    // Go to the all vendors page
    await page.getByLabel('Expand the navigation pane').click();
    await page.getByLabel('Modules').click();
    await page.getByRole('treeitem', { name: 'Accounts payable' }).click();
    await page.getByRole('button', { name: 'Expand all' }).click();
    await page.getByText('All vendors').click();

    // Set the name and increment if required
    vendorName = await setVendorName(page, testName);

    console.log(`Company Name: ${vendorName}`);

    // Create a new vendor
    await page.getByRole('button', { name: ' New' }).click();
    await expect(page.getByLabel('Identification').getByText('Vendor account')).toBeVisible({timeout: 10000});
    
    // Too many values returned with default selector
    vendorAccount = await page.getByRole('textbox', { name: 'Vendor account' }).inputValue();
    
    // expand the vendor headers using a reusable function
    await expandVendorHeaders(page);
    
    // Start entry of information
    await page.getByRole('combobox', { name: 'Name' }).click();
    await page.getByRole('combobox', { name: 'Name' }).fill(vendorName);
    await page.getByRole('combobox', { name: 'Group', exact: true }).click();
    await page.getByRole('combobox', { name: 'Group', exact: true }).fill(record.vendor_group);
    await page.getByLabel('Organization number').click();
    await page.getByLabel('Organization number').fill(record.organization_number);

    // Create the address
    await page.getByLabel('LogisticsPostalAddressGrid').getByRole('button', { name: ' Add' }).click();
    // This window can take a while to pop up, gave it a 30 second to pop up
    await expect(page.getByRole('button', { name: 'Standard view', exact: true })).toBeVisible({timeout: 30000});
    await page.getByRole('heading', { name: 'New address' }).click();
    await expect(page.getByRole('heading', { name: 'New address' })).toBeVisible();
    await page.getByLabel('Name or description').click();
    await page.getByLabel('Name or description').fill(vendorName);
    await page.getByLabel('Purpose', { exact: true }).click();
    await page.getByLabel('Purpose', { exact: true }).click();
    await page.getByText('Role', { exact: true }).click();
    await page.getByRole('button', { name: 'is one of ' }).click();
    await page.getByRole('menuitem', { name: 'is one of' }).click();

    // TODO seperate the Remit address
    // If remit address is blank on the input file then use the below code
    // if included then run split code
    // Set to run with CAN and USA, if more added it might be helpful to split into a helper
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
    await page.getByLabel('Country/region', { exact: true }).click();
    await page.getByLabel('Country/region', { exact: true }).click();
    await page.getByLabel('Country/region', { exact: true }).fill(record.country_code);
    await page.getByLabel('Country/region', { exact: true }).press('Tab');
    
    // CAN is the default creation so if using anything else then an update will be require
    if (record.country_code !== 'CAN') {
      await page.getByRole('button', { name: 'Yes' }).click();
    }
    await page.getByLabel('ZIP/postal code').fill(record.postal_code);
    await page.getByLabel('Street', { exact: true }).fill(record.street);
    await page.getByLabel('City').fill(record.city);
    await page.getByLabel('State').fill(record.state_province);
    await page.getByRole('button', { name: 'OK' }).click();
    
    // New contact information section
    await page.locator('#vendtablelistpage_3_NewContactInfo').click();
    await page.getByLabel('Description', { exact: true }).click();
    await page.getByLabel('Description', { exact: true }).fill('Phone Number');
    await page.getByLabel('Communication details').getByLabel('Type', { exact: true }).click();
    await page.getByLabel('Communication details').getByLabel('Type', { exact: true }).press('Shift+Home');
    await page.getByLabel('Communication details').getByLabel('Type', { exact: true }).fill('Phone');
    await page.getByLabel('Contact number/address').click();
    await page.getByLabel('Contact number/address').fill(record.phone_number);
    await page.getByRole('checkbox', { name: 'Primary' }).click();
    await page.locator('#vendtablelistpage_3_NewContactInfo').click();
    await page.getByRole('row', { name: 'The row is up to date. Phone Primary Type Phone' }).getByLabel('Description').click();
    await page.getByRole('row', { name: 'The row is up to date. Phone Primary Type Phone' }).getByLabel('Description').fill('Email Address');
    await page.getByLabel('Communication details').getByRole('combobox', { name: 'Type' }).fill('Email address');
    await page.getByRole('row', { name: 'The row is up to date. Email' }).getByLabel('Contact number/address').click();
    await page.getByRole('row', { name: 'The row is up to date. Email' }).getByLabel('Contact number/address').fill(record.email);
    await page.getByRole('row', { name: 'The row is up to date. Email' }).getByLabel('Primary').click();

    // Sales Tax
    await page.getByLabel('Sales tax group', { exact: true }).click();
    await page.getByLabel('Sales tax group', { exact: true }).fill('T.....S01');

    // Method of Payment
    await page.getByLabel('Method of payment', { exact: true }).click();
    await page.getByLabel('Method of payment', { exact: true }).fill(record.method_of_payment);

    // Save the vendor and refresh by going back to the main list and back into the vendor page
    await page.getByRole('button', { name: ' Save' }).click();
    await page.getByRole('link', { name: 'All vendors' }).click();
    await expect(page.getByRole('button', { name: 'Standard view' })).toBeVisible();
    await page.goto(`${url}&mi=VendTableListPage`);
    await expect(page.getByRole('button', { name: 'Standard view' })).toBeVisible();
    await page.getByLabel('Vendors', { exact: true }).getByText('Vendor account').click();
    await page.getByRole('button', { name: ' Sort Z to A' }).click();
    await page.locator('#VendTable_AccountNum_3_0_0_input').click();
    await page.locator('#VendTable_AccountNum_3_0_0_input').press('Enter');
    await expect(page.getByRole('heading', { name: 'General Group: VENDOR' }).getByLabel('General')).toBeVisible({timeout: 10000});

    // Asserts for the invoice testing
    await expect(page.getByLabel('Identification').getByText('Vendor account')).toBeVisible({timeout: 10000});
    await expect(page.getByLabel(record.company_code + '-')).toContainText(vendorAccount);
    await expect(page.locator('#vendtablelistpage_1_Org_Name_input')).toContainText(vendorName);
    await expect(page.getByLabel('Search name')).toHaveValue(vendorName);
    await expect(page.locator('#vendtablelistpage_1_Posting_VendGroup_input')).toContainText(record.vendor_group);
    await expect(page.getByLabel('Organization number')).toHaveValue(record.organization_number);
    await expect(page.getByLabel('Name or description')).toHaveValue(vendorName);

  });
}


