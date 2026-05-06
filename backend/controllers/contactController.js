const nodemailer = require('nodemailer');

// @desc    Send contact form email
// @route   POST /api/contact
// @access  Public
const sendContactEmail = async (req, res) => {
    const { fullName, phone, email, category, subject, city, message } = req.body;

    if (!fullName || !phone || !email || !category || !subject) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to self/admin
            subject: `New Contact Request: ${category} - ${subject}`,
            html: `
                <h3>New Contact Request</h3>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>City:</strong> ${city || 'Not provided'}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    ${message ? message.replace(/\n/g, '<br/>') : 'No message provided'}
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
};

module.exports = {
    sendContactEmail,
};
