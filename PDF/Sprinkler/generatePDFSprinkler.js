const puppeteer = require("puppeteer");
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
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath: process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    // Convert amount to a number and format it
    const amount = Number(formData.cost) || 0;

    // Load HTML template and replace placeholders
    let html = fs.readFileSync(path.join(__dirname, 'pdfTemplate.html'), 'utf8');
    html = html
      .replace('{{invoiceNumber}}', invoiceNumber)
      .replace('{{applicantName}}', formData.applicantName || 'N/A')
      .replace('{{applicantEmail}}', formData.applicantEmail || 'N/A')
      .replace('{{applicationDate}}', formData.applicationDate || 'N/A')
      .replace('{{serviceAddress}}', formData.serviceAddress || 'N/A')
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

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Construct the URL
    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const objectKey = params.Key;
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;

    console.log('PDF uploaded to S3 successfully.');
    console.log('File URL:', fileUrl);

    return fileUrl;

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = createPDF;
