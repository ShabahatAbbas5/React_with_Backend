// const puppeteer = require('puppeteer');
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

async function createPDF(formData, invoiceNumber, filePath) {
  let browser;
  try {
    // browser = await puppeteer.launch({
    //   headless: true,
    //   args: ['--no-sandbox', '--disable-setuid-sandbox']
    // });
    // const page = await browser.newPage();
    // await page.setDefaultNavigationTimeout(60000); // Set timeout to 60 seconds

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
    await page.pdf({ path: filePath, format: 'A4' });

    console.log('PDF created successfully.');

    // Upload PDF to S3
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: path.basename(filePath),
      Body: fileContent,
      ContentType: 'application/pdf'
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);


    // Construct the URL
    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION; // Replace with your S3 region
    const objectKey = params.Key;
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;

    console.log(fileUrl);

    console.log('PDF uploaded to S3 successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // if (browser) {
    //   await browser.close();
    // }
    // Optionally delete the local file after upload
    // fs.unlinkSync(filePath);
  }
}

module.exports = createPDF;
