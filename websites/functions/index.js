const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const smtpUser =
  process.env.SMTP_USER ||
  process.env.CONTACT_EMAIL_USER ||
  functions.config().mail?.user ||
  '';
const smtpPass =
  process.env.SMTP_PASS ||
  process.env.CONTACT_EMAIL_PASS ||
  functions.config().mail?.pass ||
  '';
const contactRecipient =
  process.env.CONTACT_TO_EMAIL ||
  functions.config().mail?.recipient ||
  smtpUser ||
  'herbsandfruits@gmail.com';

const createTransporter = () => {
  if (!smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

const validateContactPayload = ({ name, email, message }) => {
  if (!name || !email || !message) {
    return 'Name, email, and message are required.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please provide a valid email address.';
  }

  return '';
};

app.post('/send-email', async (req, res) => {
  const { name = '', email = '', message = '' } = req.body;
  const validationError = validateContactPayload({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  });

  if (validationError) {
    return res.status(400).json({ ok: false, message: validationError });
  }

  const transporter = createTransporter();

  if (!transporter) {
    return res.status(500).json({
      ok: false,
      message: 'Email service is not configured yet.',
    });
  }

  try {
    await transporter.sendMail({
      replyTo: email.trim(),
      from: `"Herbs and Fruits Website" <${smtpUser}>`,
      to: contactRecipient,
      subject: `New website enquiry from ${name.trim()}`,
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`,
    });

    return res.json({
      ok: true,
      message: 'Message sent successfully. We will get back to you soon.',
    });
  } catch (error) {
    console.error('Firebase contact send failed:', error);
    return res.status(500).json({
      ok: false,
      message: 'Unable to send your message right now.',
    });
  }
});

exports.api = functions.https.onRequest(app);
