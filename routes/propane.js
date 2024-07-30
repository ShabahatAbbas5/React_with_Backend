const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const multer = require('multer');
const stripe = Stripe(process.env.STRIPE_PROPANE_FORM_KEY);

// Generate PDF
const createPDF = require('../PDF/Propane/generatePDFPropane');
const path = require('path');

// Send Email
const sendEmail = require('../emailsend/sendemail');

// Set up multer for file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploadsplan/'); // Folder to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`); // Unique filename
  },
});
const upload = multer({ storage });

router.post('/', upload.single('plotPlan'), async (req, res) => {
  const { amount } = req.body;
  const formData = req.body;
  const plotPlanPath = req.file ? req.file.path : null;
  const plotPlanUrl  = path.join(__dirname,'../', plotPlanPath);
  try {
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    // Save form data and file path to the database
    const invoiceNumber = Date.now();

    // // Generate PDF
    const pdfPath = path.join(__dirname, '../invoices/' + invoiceNumber + '.pdf');
    // await createPDF(formData, invoiceNumber, pdfPath,plotPlanUrl);

    // Send email
    try {
      const formtitle = 'Propane Permit';
      await sendEmail(formData.applicantEmail, pdfPath, formtitle);
      // Optionally, delete the PDF after sending
      // fs.unlinkSync(pdfPath);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).send('Error sending email');
    }

    // Respond with the client secret
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
