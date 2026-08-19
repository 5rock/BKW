/**
 * Mock email service for development/testing
 * In a real production app, this would use SendGrid, Postmark, AWS SES, or Nodemailer.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.NODE_ENV === 'test') {
    return; // Don't log during tests
  }
  
  console.log('\n======================================================');
  console.log('📧 MOCK EMAIL SENT');
  console.log('------------------------------------------------------');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('------------------------------------------------------');
  console.log(`Text:\n${text}`);
  console.log('======================================================\n');
  
  return;
};

module.exports = sendEmail;
