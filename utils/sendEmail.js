const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(to, subject, html) {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail", // or use "hotmail", "yahoo", or a custom SMTP provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email options
        const mailOptions = {
            from: `"MyApp Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent to:", to);
    } catch (err) {
        console.error("❌ Email sending failed:", err.message);
        throw new Error("Failed to send email");
    }
}

module.exports = { sendEmail };
