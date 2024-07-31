const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

// Generate PDF
const createPDF = require("../PDF/Clerance/generatePDFClearance");
const path = require("path");

// Send Email
const sendEmail = require("../emailsend/sendemail");
// router.get("/", async (req, res) => {
// res.status(200).send({ success: "Connected Successfully" });
router.post("/", async (req, res) => {


  const { amount, formData, buildingType } = req.body;

  let stripe;

  if (buildingType === "Commercial") {
    stripe = Stripe(process.env.STRIPE_CLEARANCE_COMMERCIAL_FORM_KEY);
  } else {
    stripe = Stripe(process.env.STRIPE_CLEARANCE_RESIDENTIAL_FORM_KEY);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });
    const invoiceNumber = Date.now();

    // Generate PDF
    const pdfPath = path.join(
      __dirname,
      "../invoices/" + invoiceNumber + ".pdf"
    );
    // await createPDF(formData, invoiceNumber, pdfPath);

    // Send email
    try {
      const formtitle = "Clearance";
      await sendEmail(formData.email, pdfPath, formtitle);
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
