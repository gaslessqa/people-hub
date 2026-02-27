/**
 * Email template: Notify Manager when a new candidate is assigned to their vacancy.
 * PH-39
 */

interface CandidateAssignedPayload {
  managerName: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  positionTitle: string;
  recruiterName: string;
  candidateProfileUrl: string;
}

export function buildCandidateAssignedEmail(payload: CandidateAssignedPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    managerName,
    candidateName,
    candidateEmail,
    candidatePhone,
    positionTitle,
    recruiterName,
    candidateProfileUrl,
  } = payload;

  const subject = `Nuevo candidato asignado: ${candidateName} — ${positionTitle}`;

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
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;">Nuevo candidato asignado</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;">
                Hola <strong>${managerName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;">
                Se ha asignado un nuevo candidato a tu vacante <strong>${positionTitle}</strong>.
              </p>

              <!-- Candidate card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <h2 style="margin:0 0 16px;color:#1e293b;font-size:16px;">Datos del candidato</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;width:140px;">Nombre</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;font-weight:600;">${candidateName}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Email</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;">${candidateEmail}</td>
                      </tr>
                      ${
                        candidatePhone
                          ? `<tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Teléfono</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;">${candidatePhone}</td>
                      </tr>`
                          : ''
                      }
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Vacante</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;">${positionTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Asignado por</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;">${recruiterName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1e293b;border-radius:6px;padding:12px 24px;">
                    <a href="${candidateProfileUrl}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                      Ver perfil del candidato →
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
                Recibiste este email porque eres el manager de la vacante <strong>${positionTitle}</strong>.
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

  const text = `Hola ${managerName},

Se ha asignado un nuevo candidato a tu vacante "${positionTitle}".

DATOS DEL CANDIDATO
-------------------
Nombre:      ${candidateName}
Email:       ${candidateEmail}
${candidatePhone ? `Teléfono:    ${candidatePhone}\n` : ''}Vacante:     ${positionTitle}
Asignado por: ${recruiterName}

Ver perfil: ${candidateProfileUrl}

---
People Hub — Gestiona tus preferencias de notificación en Configuración.`;

  return { subject, html, text };
}
