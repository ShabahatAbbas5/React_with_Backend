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

  // Download PDF from S3
  const response = await axios({
    url: pdfUrl,
    responseType: 'stream'
  });

  const tempFilePath = path.join(os.tmpdir(), formtitle + ' Form.pdf');
  const writer = fs.createWriteStream(tempFilePath);

  // response.data.pipe(writer);

  // return new Promise((resolve, reject) => {
  //   writer.on('finish', () => {
  //     const mailOptions = {
  //       from: process.env.GMAIL_USER,
  //       to,
  //       subject: formtitle + ' Form Submission',
  //       text: 'Please find the attached PDF of your ' + formtitle + ' form submission.',
  //       attachments: [
  //         {
  //           filename: formtitle + ' Form.pdf',
  //           path: tempFilePath
  //         }
  //       ]
  //     };

  //     transporter.sendMail(mailOptions, (error, info) => {
  //       if (error) {
  //         return reject(error);
  //       }
  //       console.log('Email sent:', info.response);
  //       fs.unlink(tempFilePath, () => {}); // Clean up temp file
  //       resolve();
  //     });
  //   });

  //   writer.on('error', (error) => {
  //     reject(error);
  //   });
  // });
}

module.exports = sendEmail;
