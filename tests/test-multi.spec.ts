import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync'; // <= csv-parse/sync required for fs.readFileSync  

test.use({
    ignoreHTTPSErrors:true,
    video: {
      mode: 'on', 
      size: { width: 1280, height: 720 },
    }
});

test.describe.configure({ mode: 'parallel' }); 

// Import CSV
const records = parse(fs.readFileSync(path.join(__dirname, '..', 'csv', 'multiTest.csv')), {
  columns: true,
  skip_empty_lines: true,
  delimiter: ','
});

for (const record of records) {
  test(`Employee: ${record.Firstname} ${record.Lastname}`, async ({ page }) => {
    console.log(`Running for ${record.Firstname} ${record.Lastname}`);
    // begin the test steps here
    await page.goto('https://usnconeboxax1aos.cloud.onebox.dynamics.com/?cmp=012&mi=HcmWorkerListPage_Employees');
    await page.getByRole('button', { name: ' New' }).click();
    await page.getByLabel('First name').click();
    await page.getByLabel('First name').fill(record.Firstname);
    await page.getByLabel('Last name', { exact: true }).click();
    await page.getByLabel('Last name', { exact: true }).fill(record.Lastname);
    await page.getByRole('combobox', { name: 'Employment start date' }).click();
    await page.getByRole('combobox', { name: 'Employment start date' }).fill('t');
    await page.getByLabel('Last name', { exact: true }).click();
    await page.getByRole('button', { name: 'Hire', exact: true }).click();
  });
}
