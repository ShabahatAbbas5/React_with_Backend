const nodemailer = require('nodemailer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const os = require('os');

async function sendEmail(to, pdfUrl, formtitle) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  try {
    // Download PDF from S3
    const response = await axios({
      url: pdfUrl,
      responseType: 'stream'
    });

    const tempFilePath = path.join(os.tmpdir(), formtitle + ' Form.pdf');
    const writer = fs.createWriteStream(tempFilePath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // const mailOptions = {
    //   from: process.env.GMAIL_USER,
    //   to,
    //   subject: formtitle + ' Form Submission',
    //   text: 'Please find the attached PDF of your ' + formtitle + ' form submission.',
    //   attachments: [
    //     {
    //       filename: formtitle + ' Form.pdf',
    //       path: tempFilePath
    //     }
    //   ]
    // };

    // await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully.');

    fs.unlink(tempFilePath, (err) => {
      if (err) {
        console.error('Error deleting temp file:', err);
      }
    });
  } catch (error) {
    console.error('Error in sendEmail function:', error);
    throw error; // Rethrow the error to be handled by caller
  }
}

module.exports = sendEmail;
