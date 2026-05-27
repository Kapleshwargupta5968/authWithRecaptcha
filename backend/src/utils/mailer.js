const { google } = require('googleapis');

// Initialize the OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

// We pass the refresh token so googleapis can automatically fetch a fresh access token when needed
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

const send2FAEmail = async (toEmail, correctNumber, randomNumbers, token) => {
    let htmlContent = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Verify Your Login Attempt</h2>
            <p style="font-size: 16px; color: #555;">To protect your account, please verify it's you.</p>
            <p style="font-size: 18px; font-weight: bold; margin-bottom: 30px;">Tap the number below that matches the one shown on your screen:</p>
            <div style="display: flex; justify-content: center; gap: 20px;">
    `;
    
    // Mix the correct number with the fake ones so they appear in a random order
    const allNumbers = [correctNumber, ...randomNumbers].sort(() => Math.random() - 0.5);
    
    allNumbers.forEach(num => {
        const url = `http://localhost:5000/auth/api/verify-2fa?token=${token}&choice=${num}`;
        htmlContent += `
            <a href="${url}" style="display: inline-block; margin: 10px; padding: 15px 30px; background-color: #2563EB; color: white; font-size: 24px; font-weight: bold; text-decoration: none; border-radius: 8px;">
                ${num}
            </a>
        `;
    });

    htmlContent += `
            </div>
            <p style="margin-top: 40px; font-size: 12px; color: #aaa;">If you did not request this sign-in, you can safely ignore this email.</p>
        </div>
    `;

    // Construct the raw MIME email string
    const utf8Subject = `=?utf-8?B?${Buffer.from("Security Alert: Verify it's you").toString('base64')}?=`;
    const messageParts = [
        `To: ${toEmail}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        htmlContent
    ];

    const message = messageParts.join('\n');
    
    // Google API requires base64url format
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    try {
        const response = await gmail.users.messages.send({
            userId: 'me', // 'me' means the authenticated user
            requestBody: {
                raw: encodedMessage
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to send 2FA email via Gmail API:", error);
        throw error;
    }
};

module.exports = { send2FAEmail };
