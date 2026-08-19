/**
 * Mock email service for development/testing
 * In a real production app, this would use SendGrid, Postmark, AWS SES, or Nodemailer.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.NODE_ENV === 'test') {
    return; // Don't log during tests
  }
  
  const logData = { to, subject, text: typeof text === 'string' ? text.substring(0, 100) + '...' : text };
  console.log('📧 MOCK EMAIL SENT:', JSON.stringify(logData));
  
  return;
};

module.exports = sendEmail;
