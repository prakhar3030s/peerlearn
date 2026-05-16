import nodemailer from "nodemailer";

const {
  MAILTRAP_HOST,
  MAILTRAP_PORT,
  MAILTRAP_USER,
  MAILTRAP_PASS,
  EMAIL_FROM = "noreply@peerlearn.edu",
  APP_NAME = "PeerLearn",
  APP_URL = "http://localhost:5173",
} = process.env;

let transporter = null;

if (MAILTRAP_HOST && MAILTRAP_PORT && MAILTRAP_USER && MAILTRAP_PASS) {
  transporter = nodemailer.createTransport({
    host: MAILTRAP_HOST,
    port: Number(MAILTRAP_PORT),
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS,
    },
  });
} else {
  console.warn(
    "[Email] Mailtrap credentials missing. Emails will be logged to console instead of being sent."
  );
}

async function sendEmail(to, subject, html) {
  if (!to) return;

  if (!transporter) {
    console.log("[Email LOG]", { to, subject, html });
    return;
  }

  await transporter.sendMail({
    from: `"${APP_NAME}" <${EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

function baseTemplate(heading, body) {
  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
        <h1 style="margin: 0 0 16px; font-size: 20px; color: #111827;">${APP_NAME}</h1>
        <h2 style="margin: 0 0 12px; font-size: 18px; color: #111827;">${heading}</h2>
        <div style="font-size: 14px; color: #374151; line-height: 1.6;">
          ${body}
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
          You are receiving this email because you are using ${APP_NAME}.<br />
          <a href="${APP_URL}" style="color: #2563eb; text-decoration: none;">Open ${APP_NAME}</a>
        </p>
      </div>
    </div>
  `;
}

export async function sendSubmissionReceived(contributor, submission) {
  const subject = "We received your PeerLearn submission";
  const html = baseTemplate(
    "Submission received",
    `
      <p>Hi ${contributor.name || "there"},</p>
      <p>Thanks for contributing to <strong>${APP_NAME}</strong>! Your video submission is now <strong>under review</strong> by our moderators.</p>
      <p style="margin-top: 8px;">
        <strong>Topic:</strong> ${submission.topic_name || "Syllabus Topic"}<br />
        <strong>Description:</strong> ${submission.description}
      </p>
      <p style="margin-top: 12px;">You'll get another email as soon as your submission is approved or rejected with feedback.</p>
    `
  );

  await sendEmail(contributor.email, subject, html);
}

export async function sendSubmissionApproved(contributor, submission) {
  const subject = "Your PeerLearn video is live!";
  const html = baseTemplate(
    "Submission approved",
    `
      <p>Hi ${contributor.name || "there"},</p>
      <p>Great news — your video submission has been <strong>approved</strong> and is now live for students on <strong>${APP_NAME}</strong>.</p>
      <p style="margin-top: 8px;">
        <strong>Topic:</strong> ${submission.topic_name || "Syllabus Topic"}<br />
        <strong>Title:</strong> ${submission.youtube_title || "Video Explanation"}
      </p>
      <p style="margin-top: 12px;">Thank you for helping your peers learn better. Keep sharing your knowledge!</p>
    `
  );

  await sendEmail(contributor.email, subject, html);
}

export async function sendSubmissionRejected(contributor, submission, reason) {
  const subject = "Your PeerLearn submission was rejected";
  const html = baseTemplate(
    "Submission rejected",
    `
      <p>Hi ${contributor.name || "there"},</p>
      <p>Your recent video submission on <strong>${submission.topic_name ||
        "a syllabus topic"}</strong> was <strong>rejected</strong> by a moderator.</p>
      <p style="margin-top: 8px;">
        <strong>Reason:</strong><br />
        <span style="white-space: pre-wrap;">${reason}</span>
      </p>
      <p style="margin-top: 12px;">
        You are welcome to fix the issues and submit an improved version. Clear, accurate explanations help the entire campus community.
      </p>
    `
  );

  await sendEmail(contributor.email, subject, html);
}

export async function sendSubmissionFlagged(contributor, submission) {
  const subject = "Your PeerLearn video has been flagged";
  const html = baseTemplate(
    "Submission flagged for review",
    `
      <p>Hi ${contributor.name || "there"},</p>
      <p>Your approved video on <strong>${submission.topic_name ||
        "a syllabus topic"}</strong> has been <strong>flagged</strong> by students and is queued for moderator re-review.</p>
      <p style="margin-top: 8px;">
        The video will remain hidden until a moderator reviews it again.
      </p>
      <p style="margin-top: 12px;">
        If you believe this is a mistake, you can prepare an improved version or reach out to the academic coordinator.
      </p>
    `
  );

  await sendEmail(contributor.email, subject, html);
}

