const nodemailer = require('nodemailer');
const axios = require('axios');

async function sendEmail(to, pdfUrl, formtitle) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  // Fetch the PDF from S3
  const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: `${formtitle} Form Submission`,
    text: `Please find the attached PDF of your ${formtitle} form submission.`,
    attachments: [
      {
        filename: `${formtitle} Form.pdf`,
        content: response.data,
        encoding: 'base64'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
