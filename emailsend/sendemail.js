const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const sendEmail = async (to, formData, subject) => {
  let template;
  let html;

  // Convert amount to a number and format it
  const amount = Number(formData.cost) || 0;
  const formattedCost = amount.toFixed(2);

  // Prepare the data for the template
  let data;

  if (subject === 'Sprinkler') {
    const templatePath = path.join(__dirname, '../PDF/Sprinkler/pdfTemplate.html');
    // Read and compile the HTML template
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    template = Handlebars.compile(templateHtml);

    data = {
      invoiceNumber: Date.now(),
      applicantName: formData.applicantName,
      applicantEmail: formData.applicantEmail,
      applicationDate: new Date().toLocaleDateString(),
      serviceAddress: formData.serviceAddress,
      cost: formattedCost,
    };
  } else if (subject === 'Clearance') {
    const templatePath = path.join(__dirname, '../PDF/Clearance/pdfTemplate.html');
    // Read and compile the HTML template
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    template = Handlebars.compile(templateHtml);

    data = {
      invoiceNumber: Date.now(),
      date: formData.date,
      time: formData.time,
      lotNumber: formData.lotNumber,
      permitNumber: formData.permitNumber,
      fullName: formData.fullName,
      address: formData.address,
      generalContractor: formData.generalContractor,
      fireProtectionOfficer: formData.fireProtectionOfficer,
      reasonForInspection: formData.reasonForInspection,
      stage: formData.stage,
      buildingType: formData.buildingType,
      areaCovered: formData.areaCovered,
      inspectionType: formData.inspectionType,
      resultOfInspection: formData.resultOfInspection,
      workMustBeCompletedIn: formData.workMustBeCompletedIn,
      typeOfClearance: formData.typeOfClearance,
      temporaryClearance: formData.temporaryClearance,
      comments: formData.comments,
      inspector: formData.inspector,
      cost: formattedCost,
    };
  } else if (subject === 'Propane Permit') {
    const templatePath = path.join(__dirname, '../PDF/Propane/pdfTemplate.html');
    // Read and compile the HTML template
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    template = Handlebars.compile(templateHtml);

    data = {
      invoiceNumber: Date.now(),
      applicantName: formData.applicantName || 'N/A',
      applicantEmail: formData.applicantEmail || 'N/A',
      applicationDate: formData.applicationDate || 'N/A',
      serviceAddress: formData.serviceAddress || 'N/A',
      isMailingSame: formData.isMailingSame ? 'Yes' : 'No',
      mailingAddress: formData.mailingAddress || 'N/A',
      telephoneNumber: formData.telephoneNumber || 'N/A',
      faxNumber: formData.faxNumber || 'N/A',
      propaneSupplier: formData.propaneSupplier || 'N/A',
      propaneSupplierPhoneNumber: formData.propaneSupplierPhoneNumber || 'N/A',
      tankSize: formData.tankSize || 'N/A',
      tankLocation: formData.tankLocation || 'N/A',
      plotPlanUrl: formData.plotPlanUrl || 'N/A', // Use plotPlanUrl from formData
      cost: formattedCost,
    };
  } else {
    throw new Error('Unknown subject type');
  }

  // Generate the HTML with the data
  html = template(data);

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    html,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
