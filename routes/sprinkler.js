const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const axios = require("axios");

const stripe = Stripe(process.env.STRIPE_SPRINKLER_FORM_KEY);

// Generate PDF
const createPDF = require("../pdfgenerate/generatepdf");

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
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });

    // Generate PDF
    const formname = 'Sprinkler';
    const invoiceNumber = Date.now();
    const pdfUrl = await createPDF(formData, invoiceNumber,formname);

    // Send email with the PDF URL
    try {
      const formtitle = "Sprinkler";
      await sendEmail(formData.applicantEmail, pdfUrl, formtitle);
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).send("Error sending email");
    }

    // Respond with payment intent secret
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
