/**
 * Email template: Notify Recruiter when feedback is submitted for their candidate.
 * PH-40
 */

interface FeedbackReceivedPayload {
  recruiterName: string;
  candidateName: string;
  positionTitle: string | null;
  managerName: string;
  rating: number;
  recommendation: string;
  commentsPreview: string;
  feedbackUrl: string;
}

const STAR = '★';
const EMPTY_STAR = '☆';

function buildStars(rating: number): string {
  return STAR.repeat(rating) + EMPTY_STAR.repeat(5 - rating);
}

const RECOMMENDATION_LABELS: Record<string, string> = {
  strong_yes: 'Sí, definitivamente',
  yes: 'Sí',
  maybe: 'Tal vez',
  no: 'No',
  strong_no: 'No, definitivamente',
};

export function buildFeedbackReceivedEmail(payload: FeedbackReceivedPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    recruiterName,
    candidateName,
    positionTitle,
    managerName,
    rating,
    recommendation,
    commentsPreview,
    feedbackUrl,
  } = payload;

  const stars = buildStars(rating);
  const recommendationLabel = RECOMMENDATION_LABELS[recommendation] ?? recommendation;
  const truncatedPreview =
    commentsPreview.length > 200 ? `${commentsPreview.slice(0, 200)}…` : commentsPreview;

  const positionDisplay = positionTitle ?? 'posición general';
  const subject = `Nuevo feedback para ${candidateName}${positionTitle ? ` — ${positionTitle}` : ''}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#1e293b;padding:24px 32px;">
              <p style="margin:0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">People Hub</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;">Nuevo feedback registrado</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;">
                Hola <strong>${recruiterName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;">
                <strong>${managerName}</strong> ha registrado feedback para el candidato
                <strong>${candidateName}</strong>${positionTitle ? ` en la vacante <strong>${positionDisplay}</strong>` : ''}.
              </p>

              <!-- Feedback card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <h2 style="margin:0 0 16px;color:#1e293b;font-size:16px;">Resumen del feedback</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;width:140px;">Candidato</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;font-weight:600;">${candidateName}</td>
                      </tr>
                      ${
                        positionTitle
                          ? `<tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Vacante</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;">${positionDisplay}</td>
                      </tr>`
                          : ''
                      }
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Evaluado por</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;">${managerName}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Calificación</td>
                        <td style="padding:4px 0;color:#f59e0b;font-size:16px;">${stars} (${rating}/5)</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Recomendación</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;">${recommendationLabel}</td>
                      </tr>
                    </table>
                    ${
                      truncatedPreview
                        ? `<div style="margin-top:16px;padding:12px;background:#ffffff;border-left:3px solid #e2e8f0;border-radius:0 4px 4px 0;">
                      <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.6;font-style:italic;">"${truncatedPreview}"</p>
                    </div>`
                        : ''
                    }
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1e293b;border-radius:6px;padding:12px 24px;">
                    <a href="${feedbackUrl}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                      Ver feedback completo →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Recibiste este email porque eres el recruiter asignado al candidato <strong>${candidateName}</strong>.
                Puedes gestionar tus preferencias de notificación en la configuración de tu cuenta.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hola ${recruiterName},

${managerName} ha registrado feedback para ${candidateName}${positionTitle ? ` en la vacante "${positionDisplay}"` : ''}.

RESUMEN DEL FEEDBACK
---------------------
Candidato:     ${candidateName}
${positionTitle ? `Vacante:       ${positionDisplay}\n` : ''}Evaluado por:  ${managerName}
Calificación:  ${stars} (${rating}/5)
Recomendación: ${recommendationLabel}

${truncatedPreview ? `Comentarios:\n"${truncatedPreview}"\n` : ''}
Ver feedback completo: ${feedbackUrl}

---
People Hub — Gestiona tus preferencias de notificación en Configuración.`;

  return { subject, html, text };
}
