const axios = require("axios");

async function generatePDF(formData, invoiceNumber, formname) {
  try {
    // Construct the query parameters
    const response = await axios.get(
      "https://testing.theleathersjackets.com/Sprinkler/generatePDFSprinkler.php",
      {
        params: {
          ...formData,
          invoiceNumber,
          formname
        }
      }
    );

    console.log('formData', formData);

    if (response.status === 200) {
      const { url } = response.data;
      console.log('PDF URL:', url);
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
