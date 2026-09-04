import express from "express";

const router = express.Router();

router.post("/send", async (req, res) => {
    try {
        const { to, subject, html, text } = req.body;

        if (!to || !subject || (!html && !text)) {
            return res.status(400).json({
                success: false,
                message: "Recipient, subject, and email content are required."
            });
        }

        const resendApiKey = process.env.RESEND_API_KEY;

        if (!resendApiKey) {
            return res.status(500).json({
                success: false,
                message: "RESEND_API_KEY is not configured."
            });
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from:
                    process.env.RESEND_FROM_EMAIL ||
                    "EAGLE WRITES <onboarding@resend.dev>",
                to: [to],
                subject,
                html,
                text
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: "Resend failed to send the email.",
                error: data
            });
        }

        return res.json({
            success: true,
            message: "Email sent successfully.",
            data
        });
    } catch (error) {
        console.error("Resend email error:", error);

        return res.status(500).json({
            success: false,
            message: "Email sending failed."
        });
    }
});

export default router;