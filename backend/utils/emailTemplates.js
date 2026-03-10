/**
 * Email HTML Templates for QuickCart
 */

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  table { border-collapse: collapse; }
  img { border: 0; display: block; }
  a { text-decoration: none; }
`;

/**
 * Wraps content in the shared email shell (header + footer)
 * Logo matches the Navbar: dark gray-900 bg, italic white "Quick" + blue-400 "Cart"
 */
const wrapEmail = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QuickCart</title>
  <style>${baseStyles}</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- LOGO — matches Navbar: gray-900 bg, italic bold, blue-400 accent -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="
                    background-color: #111827;
                    border-radius: 14px;
                    padding: 14px 28px;
                    box-shadow: 0 4px 14px rgba(17,24,39,0.25);
                  ">
                    <span style="
                      font-size: 24px;
                      font-weight: 800;
                      font-style: italic;
                      color: #ffffff;
                      letter-spacing: -0.5px;
                    ">Quick<span style="color:#60a5fa;">Cart</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="
              background-color: #ffffff;
              border-radius: 24px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.07);
              overflow: hidden;
            ">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding: 28px 16px 8px;">
              <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.6;">
                &copy; ${new Date().getFullYear()} QuickCart. All rights reserved.<br/>
                You received this email because an action was requested on your account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Password Reset Email Template
 * @param {string} name   - User's name
 * @param {string} resetUrl - Full reset URL with token
 */
const resetPasswordEmail = (name, resetUrl) => wrapEmail(`
  <!-- TOP ACCENT — gray-900 to blue-400 matching Navbar -->
  <div style="height:6px; background: linear-gradient(90deg, #111827, #60a5fa);"></div>

  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 48px 40px;">

    <!-- ICON -->
    <tr>
      <td align="center" style="padding-bottom: 28px;">
        <div style="
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-radius: 50%;
          display: inline-block;
          text-align: center;
          line-height: 72px;
          font-size: 32px;
        ">🔐</div>
      </td>
    </tr>

    <!-- HEADING -->
    <tr>
      <td align="center" style="padding-bottom: 12px;">
        <h1 style="margin:0; font-size:26px; font-weight:800; color:#0f172a; letter-spacing:-0.5px;">
          Reset Your Password
        </h1>
      </td>
    </tr>

    <!-- SUBTEXT -->
    <tr>
      <td align="center" style="padding-bottom: 36px;">
        <p style="margin:0; font-size:15px; color:#64748b; line-height:1.7; max-width:420px; text-align:center;">
          Hi <strong style="color:#1e293b;">${name}</strong>, we received a request to reset the password for your QuickCart account.
          Click the button below to choose a new password.
        </p>
      </td>
    </tr>

    <!-- CTA BUTTON -->
    <tr>
      <td align="center" style="padding-bottom: 36px;">
        <a href="${resetUrl}" style="
          display: inline-block;
          background: linear-gradient(135deg, #111827 0%, #1e3a5f 100%);
          color: #60a5fa;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 16px 40px;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(17,24,39,0.35);
        ">
          Reset My Password
        </a>
      </td>
    </tr>

    <!-- EXPIRY NOTICE -->
    <tr>
      <td align="center" style="padding-bottom: 32px;">
        <table cellpadding="0" cellspacing="0" style="
          background-color: #fef9c3;
          border: 1px solid #fde68a;
          border-radius: 12px;
          padding: 14px 20px;
          max-width: 420px;
        ">
          <tr>
            <td style="font-size:13px; color:#92400e; text-align:center;">
              ⏰ &nbsp;This link will expire in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FALLBACK LINK -->
    <tr>
      <td align="center">
        <p style="margin:0; font-size:12px; color:#94a3b8;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${resetUrl}" style="color:#60a5fa; word-break:break-all;">${resetUrl}</a>
        </p>
      </td>
    </tr>

  </table>
`);

/**
 * Email Verification Template
 * @param {string} name            - User's name
 * @param {string} verificationUrl - Full verification URL with token
 */
const verifyEmailTemplate = (name, verificationUrl) => wrapEmail(`
  <!-- TOP ACCENT — blue-400 to teal, distinct from reset but on-brand -->
  <div style="height:6px; background: linear-gradient(90deg, #60a5fa, #2dd4bf);"></div>

  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 48px 40px;">

    <!-- ICON -->
    <tr>
      <td align="center" style="padding-bottom: 28px;">
        <div style="
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          border-radius: 50%;
          display: inline-block;
          text-align: center;
          line-height: 72px;
          font-size: 32px;
        ">✉️</div>
      </td>
    </tr>

    <!-- HEADING -->
    <tr>
      <td align="center" style="padding-bottom: 12px;">
        <h1 style="margin:0; font-size:26px; font-weight:800; color:#0f172a; letter-spacing:-0.5px;">
          Verify Your Email
        </h1>
      </td>
    </tr>

    <!-- SUBTEXT -->
    <tr>
      <td align="center" style="padding-bottom: 36px;">
        <p style="margin:0; font-size:15px; color:#64748b; line-height:1.7; max-width:420px; text-align:center;">
          Welcome to QuickCart, <strong style="color:#1e293b;">${name}</strong>! 🎉<br/>
          You're almost there. Click the button below to confirm your email address and activate your account.
        </p>
      </td>
    </tr>

    <!-- CTA BUTTON -->
    <tr>
      <td align="center" style="padding-bottom: 36px;">
        <a href="${verificationUrl}" style="
          display: inline-block;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 16px 40px;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(22,163,74,0.35);
        ">
          Verify My Email
        </a>
      </td>
    </tr>

    <!-- INFO NOTICE -->
    <tr>
      <td align="center" style="padding-bottom: 32px;">
        <table cellpadding="0" cellspacing="0" style="
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 14px 20px;
          max-width: 420px;
        ">
          <tr>
            <td style="font-size:13px; color:#166534; text-align:center;">
              🔒 &nbsp;If you didn't create a QuickCart account, you can safely ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FALLBACK LINK -->
    <tr>
      <td align="center">
        <p style="margin:0; font-size:12px; color:#94a3b8;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${verificationUrl}" style="color:#16a34a; word-break:break-all;">${verificationUrl}</a>
        </p>
      </td>
    </tr>

  </table>
`);

/**
 * Abandoned Cart Email Template
 * @param {string} name - User's name
 * @param {string} cartUrl - Full URL to the cart page
 */
const abandonedCartEmail = (name, cartUrl) => wrapEmail(`
  <!-- TOP ACCENT — orange to pink, energetic for reminders -->
  <div style="height:6px; background: linear-gradient(90deg, #f59e0b, #ec4899);"></div>

  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 48px 40px;">

    <!-- ICON -->
    <tr>
      <td align="center" style="padding-bottom: 28px;">
        <div style="
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #ffedd5, #fee2e2);
          border-radius: 50%;
          display: inline-block;
          text-align: center;
          line-height: 72px;
          font-size: 32px;
        ">🛒</div>
      </td>
    </tr>

    <!-- HEADING -->
    <tr>
      <td align="center" style="padding-bottom: 12px;">
        <h1 style="margin:0; font-size:26px; font-weight:800; color:#0f172a; letter-spacing:-0.5px;">
          Items Waiting For You
        </h1>
      </td>
    </tr>

    <!-- SUBTEXT -->
    <tr>
      <td align="center" style="padding-bottom: 36px;">
        <p style="margin:0; font-size:15px; color:#64748b; line-height:1.7; max-width:420px; text-align:center;">
          Hi <strong style="color:#1e293b;">${name}</strong>, you left some great items in your QuickCart! Don't let them get away—they're still waiting for you to bring them home.
        </p>
      </td>
    </tr>

    <!-- CTA BUTTON -->
    <tr>
      <td align="center" style="padding-bottom: 36px;">
        <a href="${cartUrl}" style="
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 16px 40px;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(245,158,11,0.35);
        ">
          Complete My Purchase
        </a>
      </td>
    </tr>

    <!-- INFO NOTICE -->
    <tr>
      <td align="center" style="padding-bottom: 32px;">
        <table cellpadding="0" cellspacing="0" style="
          background-color: #fffaf0;
          border: 1px solid #ffedd5;
          border-radius: 12px;
          padding: 14px 20px;
          max-width: 420px;
        ">
          <tr>
            <td style="font-size:13px; color:#9a3412; text-align:center;">
              ✨ &nbsp;Items in high demand are not reserved until checkout is completed. Grab yours while they're still in stock!
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FALLBACK LINK -->
    <tr>
      <td align="center">
        <p style="margin:0; font-size:12px; color:#94a3b8;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${cartUrl}" style="color:#f59e0b; word-break:break-all;">${cartUrl}</a>
        </p>
      </td>
    </tr>

  </table>
`);

module.exports = { resetPasswordEmail, verifyEmailTemplate, abandonedCartEmail };
