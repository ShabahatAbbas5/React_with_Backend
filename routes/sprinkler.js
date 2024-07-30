const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SPRINKLER_FORM_KEY);

// Generate PDF
const createPDF = require("../PDF/Sprinkler/generatePDFSprinkler");
const path = require("path");

// Send Email
const sendEmail = require("../emailsend/sendemail");
router.get("/paymentintent", async (req, res) => {
  const amount = 2000;
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

router.post("/", async (req, res) => {
  const { amount, formData } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });
    const invoiceNumber = Date.now();

    // // Generate PDF
    const pdfPath = invoiceNumber+'.pdf';
    await createPDF(formData, invoiceNumber, pdfPath);

    // Send email
    try {
      const formtitle = "Sprinkler";
      await sendEmail(formData.applicantEmail, pdfPath,formtitle);
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error submitting form");
    }

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
