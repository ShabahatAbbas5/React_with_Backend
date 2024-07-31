const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createPDF(formData, invoiceNumber, filePath) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000); // Set timeout to 60 seconds

    // Load HTML template and replace placeholders
    let html = fs.readFileSync(path.join(__dirname, 'pdfTemplate.html'), 'utf8');
    html = html
      .replace('{{invoiceNumber}}', invoiceNumber)
      .replace('{{date}}', formData.date)
      .replace('{{time}}', formData.time)
      .replace('{{lotNumber}}', formData.lotNumber)
      .replace('{{permitNumber}}', formData.permitNumber)
      .replace('{{fullName}}', formData.fullName)
      .replace('{{address}}', formData.address)
      .replace('{{generalContractor}}', formData.generalContractor)
      .replace('{{fireProtectionOfficer}}', formData.fireProtectionOfficer)
      .replace('{{reasonForInspection}}', formData.reasonForInspection)
      .replace('{{stage}}', formData.stage)
      .replace('{{buildingType}}', formData.buildingType)
      .replace('{{areaCovered}}', formData.areaCovered)
      .replace('{{inspectionType}}', formData.inspectionType)
      .replace('{{resultOfInspection}}', formData.resultOfInspection)
      .replace('{{workMustBeCompletedIn}}', formData.workMustBeCompletedIn)
      .replace('{{typeOfClearance}}', formData.typeOfClearance)
      .replace('{{temporaryClearance}}', formData.temporaryClearance)
      .replace('{{comments}}', formData.comments)
      .replace('{{inspector}}', formData.inspector)
      .replace('{{cost}}', formData.cost.toFixed(2));

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: filePath, format: 'A4' });

    console.log('PDF created successfully.');
  } catch (error) {
    console.error('Error creating PDF:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = createPDF;
