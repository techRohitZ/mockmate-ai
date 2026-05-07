import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure nodemailer (using Gmail or your preferred email service)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// POST /api/contact - Handle contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // If email credentials are not configured, just log and respond with success
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Contact form submission received (email not configured):', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message:
          'Thank you for contacting us! We have received your message and will get back to you soon.',
      });
    }

    // Send email to support team
    const supportMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><strong>Received at:</strong> ${new Date().toISOString()}</p>
      `,
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We received your message - MockMate AI',
      html: `
        <h2>Thank you for contacting MockMate AI!</h2>
        <p>Hi ${name},</p>
        <p>We have received your message and appreciate you reaching out to us. Our team will review your inquiry and get back to you within 24 business hours.</p>
        <p><strong>Your message details:</strong></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>Best regards,<br>MockMate AI Team</p>
      `,
    };

    // Send both emails
    await transporter.sendMail(supportMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
