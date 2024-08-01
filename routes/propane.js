const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const sendEmail = require('../emailsend/sendemail');

// Generate PDF
const createPDF = require("../pdfgenerate/generatepdf");

const stripe = Stripe(process.env.STRIPE_PROPANE_FORM_KEY);

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Set up multer for file handling
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

router.post('/', upload.single('plotPlan'), async (req, res) => {
  const { amount } = req.body;
  const formData = req.body;
  const plotPlanFile = req.file;

  try {
    // Upload file to S3
    let plotPlanUrl = null;
    if (plotPlanFile) {
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${Date.now()}-${plotPlanFile.originalname.replace(/\s+/g, '-')}`,
        Body: plotPlanFile.buffer,
        ContentType: plotPlanFile.mimetype,
      };
      const command = new PutObjectCommand(uploadParams);
      const uploadResult = await s3.send(command);
      plotPlanUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    }
    // Add plotPlanUrl to formData
    formData.plotPlanUrl = plotPlanUrl;

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });
    const formname = 'Propane Permit';
    const invoiceNumber = Date.now();
    const pdfUrl = await createPDF(formData, invoiceNumber,formname);

    // Send email
    try {
      const formtitle = 'Propane Permit';
      await sendEmail(formData.applicantEmail, pdfUrl, formtitle);
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
