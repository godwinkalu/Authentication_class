const nodemailer = require('nodemailer')

const emailSender = async (option) => {

  // Create a test account or replace with real credentials.
  const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    host: process.env.EMAIL_HOST,
    port: 587,
    tls:{
      rejectUnauthorized: false

    },
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.APP_USER,
      pass: process.env.APP_PASSWORD,
    },
  });

  // Wrap in an async IIFE so we can use await.
  (async () => {
    console.log('start');
    
    const info = await transporter.sendMail({
      from: `"J Koncept" <${process.env.APP_USER}>`,
      to: option.email,
      subject: option.subject,
      // plain‑text body
      html: option.html, // HTML body
    })
console.log('end')
    console.log('Message sent:', info.messageId)
  })()
}

module.exports = emailSender
