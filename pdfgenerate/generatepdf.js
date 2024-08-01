const axios = require("axios");

async function generatePDF(formData, invoiceNumber, formname) {
  try {
    // Ensure the environment variable is defined
    const baseURL = process.env.PDF_GENERATE_URL;
    if (!baseURL) {
      throw new Error("PDF_GENERATE_URL environment variable is not defined");
    }

    // Determine URL based on formname
    let urlFile;
    switch (formname) {
      case 'Sprinkler':
        urlFile = `${baseURL}/Sprinkler/generatePDFSprinkler.php`;
        break;
      case 'Clearance':
        urlFile = `${baseURL}/Clearance/generatePDFClearance.php`;
        break;
      case 'Propane Permit':
        urlFile = `${baseURL}/Propane/generatePDFPropane.php`;
        break;
      default:
        throw new Error("Invalid formname");
    }

    // Construct the query parameters
    const response = await axios.get(urlFile, {
      params: {
        ...formData,
        invoiceNumber
      }
    });

    console.log('formData:', formData);

    if (response.status === 200) {
      const { url } = response.data;
      console.log('PDF URL:', url);
      return url;
    } else {
      throw new Error("Failed to generate PDF: " + response.statusText);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

module.exports = generatePDF;
