// sendEmail.js
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

async function sendEmail(to, pdfPath,formtitle) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: formtitle+' Form Submission',
    text: 'Please find the attached PDF of your '+formtitle+' form submission.',
    attachments: [
      {
        filename: formtitle+' Form.pdf',
        path: pdfPath
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
