const axios = require("axios");

async function generatePDF(formData, invoiceNumber) {
  try {
    const response = await axios.get(
      "https://testing.theleathersjackets.com/Sprinkler/generatePDFSprinkler.php",
      {
        formData,
        invoiceNumber,
      }
    );

    if (response.status === 200) {
      const { url } = response.data;
      return url;
    } else {
      throw new Error("Failed to generate PDF");
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

module.exports = generatePDF;