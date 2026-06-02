const axios = require("axios");

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "no-reply@placemate.ai";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "PlaceMate AI";

/**
 * Sends a templated email using the Brevo API
 * @param {string} toEmail - The recipient's email address
 * @param {string} templateType - 'launch', 'early_access', or 'welcome'
 */
const sendWaitlistEmail = async (toEmail, templateType = "early_access") => {
  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY is not set. Email will not be sent to " + toEmail);
    return;
  }

  const templates = {
    early_access: {
      subject: "You're In! Early Access to PlaceMate AI + 100 Free Credits 🎉",
      heading: "Welcome aboard! 🚀",
      body: `
        <p>We are thrilled to announce that you've been moved off the waitlist and your early access to <strong>PlaceMate AI</strong> has been officially granted.</p>
        <p>You can now log in using this email address to explore our cutting-edge AI-driven mock interviews, resume optimization, and career coaching tools.</p>
      `,
      buttonText: "Claim Access & Credits",
      buttonLink: "https://placemateai.com/signin"
    },
    launch: {
      subject: "PlaceMate AI is now live - Platform Access Available",
      heading: "Platform Launch Complete",
      body: `
        <p>We are writing to inform you that <strong>PlaceMate AI</strong> has officially launched and is now available for public access.</p>
        <p>Our platform includes tools for AI-driven mock interviews and resume ATS scanning. You can now visit the site to create your account and access these features.</p>
      `,
      buttonText: "Access Platform",
      buttonLink: "https://placemateai.com"
    },
    welcome: {
      subject: "Welcome to the PlaceMate AI Waitlist! 👋",
      heading: "You're on the list! 📝",
      body: `
        <p>Thanks for joining the <strong>PlaceMate AI</strong> waitlist! We are working hard behind the scenes to bring you the best AI career platform.</p>
        <p>We'll notify you right here at this email address as soon as we open up more spots. Hang tight, big things are coming soon!</p>
      `,
      buttonText: "Visit Our Website",
      buttonLink: "https://placemateai.com"
    }
  };

  const selectedTemplate = templates[templateType] || templates.early_access;

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL,
    },
    to: [{ email: toEmail }],
    subject: selectedTemplate.subject,
  
htmlContent: `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <title>${selectedTemplate.subject}</title>

  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Inter:wght@100..900&display=swap" rel="stylesheet">

  <style>

    *{
      margin:0;
      padding:0;
      box-sizing:border-box;
    }

    body{
      background:#f5f5f5;
      padding:32px 16px;
      font-family:"Inter",sans-serif;
      color:#18181b;
    }

    .container{
      max-width:560px;
      margin:auto;
      background:#ffffff;
      border:1px solid #ececec;
      border-radius:24px;
      overflow:hidden;
    }

    .header{
      padding:36px 32px 22px;
      text-align:center;
    }

    .logo{
      width:58px;
      margin-bottom:14px;
    }

    .brand{
      font-family:"Space Grotesk",sans-serif;
      font-size:32px;
      font-weight:700;
      letter-spacing:-1.5px;
      color:#09090b;
    }

    .content{
      padding:10px 32px 36px;
    }

    .badge{
      display:inline-block;
      background:rgba(190,242,100,0.18);
      color:#65a30d;
      padding:7px 14px;
      border-radius:999px;
      font-size:12px;
      font-weight:600;
      margin-bottom:22px;
    }

    .title{
      font-size:30px;
      line-height:1.1;
      font-weight:700;
      letter-spacing:-1px;
      margin-bottom:18px;
      color:#09090b;
      font-family:"Space Grotesk",sans-serif;
    }

    .content p{
      font-size:15px;
      line-height:1.8;
      color:#52525b;
      margin-bottom:18px;
    }

    .content strong{
      color:#18181b;
    }

    .bonus-box{
      margin-top:28px;
      background:#fefce8;
      border:1px solid #fde68a;
      border-radius:18px;
      padding:18px;
    }

    .bonus-icon{
      font-size:24px;
      margin-bottom:10px;
    }

    .bonus-text{
      font-size:14px;
      line-height:1.7;
      color:#854d0e;
    }

    .button-wrapper{
      text-align:center;
      margin-top:34px;
    }

    .cta-button{
      display:inline-block;
      background:#bef264;
      color:#111827 !important;
      text-decoration:none;
      padding:14px 26px;
      border-radius:14px;
      font-size:14px;
      font-weight:700;
    }

    .footer{
      border-top:1px solid #f4f4f5;
      background:#fafafa;
      padding:22px;
      text-align:center;
    }

    .footer p{
      font-size:12px;
      line-height:1.7;
      color:#a1a1aa;
      margin:0;
    }

    @media(max-width:600px){

      .header,
      .content{
        padding-left:22px;
        padding-right:22px;
      }

      .brand{
        font-size:28px;
      }

      .title{
        font-size:26px;
      }

    }

  </style>
</head>

<body>

  <div class="container">

    <!-- HEADER -->
    <div class="header">

      <img
        src="https://placemateai.com/wp-content/uploads/2025/02/Logo-5-1.png"
        alt="PlaceMateAI Logo"
        class="logo"
      />

      <div class="brand">
        PlaceMateAI
      </div>

    </div>

    <!-- CONTENT -->
    <div class="content">

      ${
        templateType === "early_access"
        ? `
      <div class="badge">
        EARLY ACCESS ✨
      </div>
        `
        : ``
      }

      <h1 class="title">
        ${selectedTemplate.heading}
      </h1>

      ${selectedTemplate.body}

      <!-- BONUS -->
      ${
        templateType === "early_access"
        ? `
        <div class="bonus-box">

          <div class="bonus-icon">
            🎁
          </div>

          <div class="bonus-text">
            <strong>100 Free Credits Included</strong><br/>
            Your account has been loaded with free credits to explore premium features.
          </div>

        </div>
        `
        : ``
      }

      <!-- BUTTON -->
      <div class="button-wrapper">

        <a
          href="${selectedTemplate.buttonLink}"
          class="cta-button"
        >
          ${selectedTemplate.buttonText}
        </a>

      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">

      <p>
        Need help? Reply to this email anytime.
      </p>

      <p>
        © ${new Date().getFullYear()} PlaceMateAI. All rights reserved.
      </p>

    </div>

  </div>

</body>

</html>
`,


  };

  try {
    const response = await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });
    console.log(`Email (${templateType}) successfully sent to ${toEmail}. Message ID: ${response.data.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email (${templateType}) to ${toEmail}:`, error?.response?.data || error.message);
    return false;
  }
};

const sendAdminPromotionEmail = async (toEmail, secretCode) => {
  if (!BREVO_API_KEY) return;
  const emailData = {
    sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: "Admin Account Activation - Action Required",
    htmlContent: `
      <h2>You have been promoted to Admin</h2>
      <p>Your account at PlaceMate AI has been granted administrative privileges.</p>
      <p>For security reasons, your admin access requires a permanent Secret Code in addition to an OTP.</p>
      <p>Your Permanent Secret Code is: <strong>${secretCode}</strong></p>
      <p>Keep this code safe. You will need it every time you log into the admin panel.</p>
    `,
  };
  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to send Admin Promotion Email", err.message);
  }
};

const sendAdminOtpEmail = async (toEmail, otp) => {
  if (!BREVO_API_KEY) return;
  const emailData = {
    sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: "Admin Login OTP",
    htmlContent: `
      <h2>Admin Login Request</h2>
      <p>Your OTP for admin login is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };
  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to send Admin OTP Email", err.message);
  }
};

module.exports = {
  sendWaitlistEmail,
  sendAdminPromotionEmail,
  sendAdminOtpEmail,
};
