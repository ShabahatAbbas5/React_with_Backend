const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configure AWS SDK with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function createPDF(formData, invoiceNumber) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    // Convert amount to a number and format it
    const amount = Number(formData.cost) || 0;
    // Load HTML template and replace placeholders
    let html = fs.readFileSync(path.join(__dirname, 'pdfTemplate.html'), 'utf8');
    html = html
      .replace('{{invoiceNumber}}', invoiceNumber)
      .replace('{{applicantName}}', formData.applicantName)
      .replace('{{applicantEmail}}', formData.applicantEmail)
      .replace('{{applicationDate}}', formData.applicationDate)
      .replace('{{serviceAddress}}', formData.serviceAddress)
      .replace('{{cost}}', amount.toFixed(2));

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF as a Buffer
    const pdfBuffer = await page.pdf({ format: 'A4' });

    console.log('PDF created successfully.');

    // Upload PDF to S3
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${invoiceNumber}.pdf`,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    };

    console.log('Uploading PDF to S3 with params:', params);

    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);

    console.log('S3 upload response:', response);

    // Construct the URL
    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const objectKey = params.Key;
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;

    console.log('PDF uploaded to S3 successfully.');
    console.log('File URL:', fileUrl);

    return fileUrl;

  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

module.exports = createPDF;
