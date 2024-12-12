import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your password",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" lang="en">
      <head>
        <meta content="width=device-width" name="viewport"/>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
        <meta name="x-apple-disable-message-reformatting"/>
        <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
        <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection"/>
        <meta content="light" name="color-scheme"/>
        <meta content="light" name="supported-color-schemes"/>
        <style>
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 400;
            mso-font-alt: 'sans-serif';
            src: url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19) format('woff2');
          }

          * {
            font-family: 'Inter', sans-serif;
          }
        </style>
        <style>
          blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}
          @media only screen and (max-width:425px){
            .tab-row-full{width:100%!important}
            .tab-col-full{display:block!important;width:100%!important}
            .tab-pad{padding:0!important}
          }
        </style>
      </head>
      <body style="margin:0">
        <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;min-width:300px;width:100%;margin-left:auto;margin-right:auto;padding:0.5rem">
          <tbody>
            <tr style="width:100%">
              <td>
                <h2 style="text-align:left;color:#111827;margin-bottom:12px;margin-top:0;font-size:30px;line-height:36px;font-weight:700">
                  <strong>Reset Your Password</strong>
                </h2>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:#374151;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  You requested to reset your password. Click the button below to create a new password:
                </p>
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:100%;text-align:left;margin-bottom:0px">
                  <tbody>
                    <tr style="width:100%">
                      <td>
                        <a href="${resetUrl}" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px;color:#ffffff;background-color:#000000;border-color:#000000;padding:12px 34px 12px 34px;border-width:2px;border-style:solid;font-size:14px;font-weight:500;border-radius:9999px" target="_blank">
                          <span><!--[if mso]><i style="mso-font-width:425%;mso-text-raise:18" hidden>&#8202;&#8202;&#8202;&#8202;</i><![endif]--></span>
                          <span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Reset Password →</span>
                          <span><!--[if mso]><i style="mso-font-width:425%" hidden>&#8202;&#8202;&#8202;&#8202;&#8203;</i><![endif]--></span>
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;height:32px">
                  <tbody>
                    <tr style="width:100%">
                      <td></td>
                    </tr>
                  </tbody>
                </table>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:#374151;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  If the button doesn't work, you can also click this link: <a href="${resetUrl}" rel="noopener noreferrer nofollow" style="color:#111827;text-decoration:underline;font-weight:500" target="_blank">${resetUrl}</a>
                </p>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:#374151;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  If you didn't request a password reset, you can safely ignore this email.
                </p>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:center;margin-bottom:20px;margin-top:0px;color:#6B7280;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  This link will expire in 1 hour.
                </p>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:#374151;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  Regards,<br/>PromptGen
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>`,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your verification link",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" lang="en">
      <head>
        <meta content="width=device-width" name="viewport"/>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
        <meta name="x-apple-disable-message-reformatting"/>
        <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
        <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection"/>
        <meta content="light" name="color-scheme"/>
        <meta content="light" name="supported-color-schemes"/>
        <style>
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 400;
            mso-font-alt: 'sans-serif';
            src: url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19) format('woff2');
          }

          * {
            font-family: 'Inter', sans-serif;
          }
        </style>
        <style>
          blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}
          @media only screen and (max-width:425px){
            .tab-row-full{width:100%!important}
            .tab-col-full{display:block!important;width:100%!important}
            .tab-pad{padding:0!important}
          }
        </style>
      </head>
      <body style="margin:0">
        <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;min-width:300px;width:100%;margin-left:auto;margin-right:auto;padding:0.5rem">
          <tbody>
            <tr style="width:100%">
              <td>
                <h2 style="text-align:left;color:#111827;margin-bottom:12px;margin-top:0;font-size:30px;line-height:36px;font-weight:700">
                  <strong>Welcome to Prompt Generator</strong>
                </h2>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:#374151;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  Thank you for registering. Please verify your email address by clicking the button below:
                </p>
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:100%;text-align:left;margin-bottom:0px">
                  <tbody>
                    <tr style="width:100%">
                      <td>
                        <a href="${verifyUrl}" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px;color:#ffffff;background-color:#000000;border-color:#000000;padding:12px 34px 12px 34px;border-width:2px;border-style:solid;font-size:14px;font-weight:500;border-radius:9999px" target="_blank">
                          <span><!--[if mso]><i style="mso-font-width:425%;mso-text-raise:18" hidden>&#8202;&#8202;&#8202;&#8202;</i><![endif]--></span>
                          <span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Verify Email Address →</span>
                          <span><!--[if mso]><i style="mso-font-width:425%" hidden>&#8202;&#8202;&#8202;&#8202;&#8203;</i><![endif]--></span>
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;height:32px">
                  <tbody>
                    <tr style="width:100%">
                      <td></td>
                    </tr>
                  </tbody>
                </table>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:#374151;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  If the button doesn't work, you can also click this link: <a href="${verifyUrl}" rel="noopener noreferrer nofollow" style="color:#111827;text-decoration:underline;font-weight:500" target="_blank">${verifyUrl}</a>
                </p>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:#374151;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  If you didn't create an account, you can safely ignore this email.
                </p>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:center;margin-bottom:20px;margin-top:0px;color:#6B7280;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  This link will expire in 24 hours.
                </p>
                <p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:#374151;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                  Regards,<br/>PromptGen
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>`,
  });
}
