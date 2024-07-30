const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createPDF(formData, invoiceNumber, filePath,plotPlanUrl) {
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

    // Convert amount to a number and format it
    const amount = Number(formData.cost) || 0;

    html = html
      .replace('{{invoiceNumber}}', invoiceNumber || 'N/A')
      .replace('{{applicantName}}', formData.applicantName || 'N/A')
      .replace('{{applicantEmail}}', formData.applicantEmail || 'N/A')
      .replace('{{applicationDate}}', formData.applicationDate || 'N/A')
      .replace('{{serviceAddress}}', formData.serviceAddress || 'N/A')
      .replace('{{isMailingSame}}', formData.isMailingSame ? 'Yes' : 'No')
      .replace('{{mailingAddress}}', formData.mailingAddress || 'N/A')
      .replace('{{telephoneNumber}}', formData.telephoneNumber || 'N/A')
      .replace('{{faxNumber}}', formData.faxNumber || 'N/A')
      .replace('{{propaneSupplier}}', formData.propaneSupplier || 'N/A')
      .replace('{{propaneSupplierPhoneNumber}}', formData.propaneSupplierPhoneNumber || 'N/A')
      .replace('{{tankSize}}', formData.tankSize || 'N/A')
      .replace('{{tankLocation}}', formData.tankLocation || 'N/A')
      .replace('{{plotPlanPath}}', plotPlanUrl)
      .replace('{{cost}}', amount.toFixed(2));

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
