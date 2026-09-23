
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  try {
    const payload = req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({
        error: "Dados inválidos.",
      });
    }

    const company = String(
      payload.business?.company || ""
    ).trim();

    const name = String(
      payload.contact?.name || ""
    ).trim();

    const email = String(
      payload.contact?.email || ""
    ).trim();

    const phone = String(
      payload.contact?.phone || ""
    ).trim();

    const projectType = String(
      payload.project?.type || ""
    ).trim();

    const consent = Boolean(
      payload.consent?.contact
    );

    if (!company || !name || !email || !phone) {
      return res.status(400).json({
        error: "Preencha os campos obrigatórios.",
      });
    }

    if (!projectType) {
      return res.status(400).json({
        error: "Informe o tipo de projeto.",
      });
    }

    if (!consent) {
      return res.status(400).json({
        error: "Consentimento não informado.",
      });
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        error: "E-mail inválido.",
      });
    }

    const apiKey =
      process.env.RESEND_API_KEY;

    const fromEmail =
      process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      console.error(
        "Resend não configurado."
      );

      return res.status(500).json({
        error:
          "O envio ainda não está configurado no servidor.",
      });
    }

    const goals = Array.isArray(
      payload.project?.goals
    )
      ? payload.project.goals
      : [];

    const materials = Array.isArray(
      payload.context?.materials
    )
      ? payload.context.materials
      : [];

    const submittedAt = payload.submittedAt
      ? new Date(payload.submittedAt)
      : new Date();

    const validSubmittedAt =
      Number.isNaN(submittedAt.getTime())
        ? new Date()
        : submittedAt;

    const formattedDate =
      new Intl.DateTimeFormat(
        "pt-BR",
        {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "America/Sao_Paulo",
        }
      ).format(validSubmittedAt);

    const escapeHtml = (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const listHtml = (items) =>
      items.length
        ? `<ul>${items
            .map(
              (item) =>
                `<li>${escapeHtml(item)}</li>`
            )
            .join("")}</ul>`
        : "<p>Não informado.</p>";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:760px;margin:0 auto;color:#111;">
        <div style="padding:24px 0;border-bottom:2px solid #b8ff00;">
          <p style="margin:0;color:#777;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
            PEREDA DEV
          </p>

          <h1 style="margin:10px 0 0;font-size:32px;">
            Novo briefing recebido
          </h1>
        </div>

        <div style="padding:28px 0;">
          <h2>Contato</h2>

          <p>
            <strong>Nome:</strong>
            ${escapeHtml(name)}
          </p>

          <p>
            <strong>E-mail:</strong>
            ${escapeHtml(email)}
          </p>

          <p>
            <strong>WhatsApp:</strong>
            ${escapeHtml(phone)}
          </p>

          <h2>Negócio</h2>

          <p>
            <strong>Empresa:</strong>
            ${escapeHtml(company)}
          </p>

          <p>
            <strong>Segmento:</strong>
            ${escapeHtml(
              payload.business?.segment ||
                "Não informado"
            )}
          </p>

          <p>
            <strong>Localização:</strong>
            ${escapeHtml(
              payload.business?.location ||
                "Não informado"
            )}
          </p>

          <p>
            <strong>Descrição:</strong><br>
            ${escapeHtml(
              payload.business?.description ||
                "Não informado"
            )}
          </p>

          <h2>Projeto</h2>

          <p>
            <strong>Tipo:</strong>
            ${escapeHtml(projectType)}
          </p>

          ${
            payload.project?.other
              ? `
                <p>
                  <strong>Outro tipo:</strong>
                  ${escapeHtml(
                    payload.project.other
                  )}
                </p>
              `
              : ""
          }

          <p>
            <strong>Objetivos:</strong>
          </p>

          ${listHtml(goals)}

          <h2>Presença digital</h2>

          <p>
            <strong>Status:</strong>
            ${escapeHtml(
              payload.digitalPresence?.status ||
                "Não informado"
            )}
          </p>

          <p>
            <strong>Site:</strong>
            ${escapeHtml(
              payload.digitalPresence?.website ||
                "Não informado"
            )}
          </p>

          <p>
            <strong>Instagram:</strong>
            ${escapeHtml(
              payload.digitalPresence?.instagram ||
                "Não informado"
            )}
          </p>

          <p>
            <strong>Público:</strong><br>
            ${escapeHtml(
              payload.digitalPresence?.audience ||
                "Não informado"
            )}
          </p>

          <h2>Momento</h2>

          <p>
            <strong>Prazo:</strong>
            ${escapeHtml(
              payload.context?.timeline ||
                "Não informado"
            )}
          </p>

          <p>
            <strong>Investimento:</strong>
            ${escapeHtml(
              payload.context?.budget ||
                "Não informado"
            )}
          </p>

          <p>
            <strong>Materiais:</strong>
          </p>

          ${listHtml(materials)}

          <h2>Mensagem</h2>

          <p style="white-space:pre-line;">
            ${escapeHtml(
              payload.message ||
                "Nenhuma mensagem adicional."
            )}
          </p>

          <div style="margin-top:32px;padding:16px;background:#f3f3f3;">
            <p style="margin:0;font-size:12px;color:#666;">
              Recebido em ${escapeHtml(
                formattedDate
              )}
            </p>
          </div>
        </div>
      </div>
    `;

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          from: fromEmail,
          to: ["peredadev@gmail.com"],
          reply_to: email,
          subject: `Novo briefing — ${company}`,
          html,
        }),
      }
    );

    const resendData =
      await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Erro Resend:",
        resendData
      );

      return res.status(502).json({
        error:
          "Não foi possível concluir o envio do briefing.",
      });
    }

    /*
     * FUTURO PEREDA OS
     *
     * Aqui entra a persistência no PostgreSQL/Neon.
     *
     * Exemplo:
     *
     * await createLead({
     *   company,
     *   name,
     *   email,
     *   phone,
     *   projectType,
     *   ...
     * });
     *
     * O payload já está estruturado para isso.
     */

    return res.status(200).json({
      success: true,
      id: resendData.id || null,
    });
  } catch (error) {
    console.error(
      "Erro inesperado no briefing:",
      error
    );

    return res.status(500).json({
      error:
        "Ocorreu um erro ao processar o briefing.",
    });
  }
}
