
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

    // Limite defensivo de tamanho para evitar abuso do endpoint.
    const cap = (value, max) =>
      String(value ?? "")
        .trim()
        .slice(0, max);

    // ------------------------------------------------------------
    // HONEYPOT ANTI-SPAM
    // ------------------------------------------------------------
    // O campo hp deve existir no frontend, mas permanecer invisível
    // para usuários reais.
    //
    // Se vier preenchido, consideramos o envio suspeito.
    // Respondemos como sucesso sem enviar o e-mail para não revelar
    // a existência da armadilha ao bot.
    const honeypot = cap(payload.hp, 200);

    if (honeypot) {
      console.warn("Honeypot preenchido — envio ignorado.");

      return res.status(200).json({
        success: true,
        id: null,
      });
    }

    // ------------------------------------------------------------
    // DADOS PRINCIPAIS
    // ------------------------------------------------------------

    const company = cap(payload.business?.company, 200);
    const name = cap(payload.contact?.name, 150);
    const email = cap(payload.contact?.email, 200);
    const phone = cap(payload.contact?.phone, 40);

    const projectType = cap(payload.project?.type, 80);

    const goals = (
      Array.isArray(payload.project?.goals)
        ? payload.project.goals
        : []
    )
      .slice(0, 10)
      .map((item) => cap(item, 120))
      .filter(Boolean);

    const presenceStatus = cap(
      payload.digitalPresence?.status,
      60
    );

    const consent = Boolean(
      payload.consent?.contact
    );

    // ------------------------------------------------------------
    // VALIDAÇÕES
    // ------------------------------------------------------------

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

    if (!goals.length) {
      return res.status(400).json({
        error: "Selecione pelo menos um objetivo.",
      });
    }

    if (!presenceStatus) {
      return res.status(400).json({
        error: "Informe como está a presença digital.",
      });
    }

    if (!consent) {
      return res.status(400).json({
        error: "Consentimento não informado.",
      });
    }

    // Validação básica de e-mail.
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        error: "E-mail inválido.",
      });
    }

    // ------------------------------------------------------------
    // CONFIGURAÇÃO DO RESEND
    // ------------------------------------------------------------

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      console.error("Resend não configurado.");

      return res.status(500).json({
        error:
          "O envio ainda não está configurado no servidor.",
      });
    }

    // ------------------------------------------------------------
    // DADOS COMPLEMENTARES
    // ------------------------------------------------------------

    const segment = cap(
      payload.business?.segment,
      150
    );

    const location = cap(
      payload.business?.location,
      150
    );

    const description = cap(
      payload.business?.description,
      3000
    );

    const otherProjectType = cap(
      payload.project?.other,
      200
    );

    const website = cap(
      payload.digitalPresence?.website,
      300
    );

    const instagram = cap(
      payload.digitalPresence?.instagram,
      150
    );

    const audience = cap(
      payload.digitalPresence?.audience,
      3000
    );

    const timeline = cap(
      payload.context?.timeline,
      60
    );

    const budget = cap(
      payload.context?.budget,
      60
    );

    // IMPORTANTÍSSIMO:
    // materials é uma string/textarea, não um array.
    const materials = cap(
      payload.context?.materials,
      3000
    );

    const message = cap(
      payload.message,
      4000
    );

    // ------------------------------------------------------------
    // DATA DO ENVIO
    // ------------------------------------------------------------

    const submittedAt = payload.submittedAt
      ? new Date(payload.submittedAt)
      : new Date();

    const validSubmittedAt = Number.isNaN(
      submittedAt.getTime()
    )
      ? new Date()
      : submittedAt;

    const formattedDate =
      new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      }).format(validSubmittedAt);

    // ------------------------------------------------------------
    // SEGURANÇA — ESCAPE HTML
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // E-MAIL
    // ------------------------------------------------------------

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
            ${escapeHtml(segment || "Não informado")}
          </p>

          <p>
            <strong>Localização:</strong>
            ${escapeHtml(location || "Não informado")}
          </p>

          <p>
            <strong>Descrição:</strong><br>
            ${escapeHtml(description || "Não informado")}
          </p>

          <h2>Projeto</h2>

          <p>
            <strong>Tipo:</strong>
            ${escapeHtml(projectType)}
          </p>

          ${
            otherProjectType
              ? `
                <p>
                  <strong>Outro tipo:</strong>
                  ${escapeHtml(otherProjectType)}
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
              presenceStatus || "Não informado"
            )}
          </p>

          <p>
            <strong>Site:</strong>
            ${escapeHtml(website || "Não informado")}
          </p>

          <p>
            <strong>Instagram:</strong>
            ${escapeHtml(
              instagram || "Não informado"
            )}
          </p>

          <p>
            <strong>Público:</strong><br>
            ${escapeHtml(
              audience || "Não informado"
            )}
          </p>

          <h2>Momento</h2>

          <p>
            <strong>Prazo:</strong>
            ${escapeHtml(
              timeline || "Não informado"
            )}
          </p>

          <p>
            <strong>Investimento:</strong>
            ${escapeHtml(
              budget || "Não informado"
            )}
          </p>

          <p>
            <strong>Materiais:</strong><br>
            ${
              materials
                ? escapeHtml(materials)
                : "Não informado."
            }
          </p>

          <h2>Mensagem</h2>

          <p style="white-space:pre-line;">
            ${escapeHtml(
              message || "Nenhuma mensagem adicional."
            )}
          </p>

          <div style="margin-top:32px;padding:16px;background:#f3f3f3;">
            <p style="margin:0;font-size:12px;color:#666;">
              Recebido em ${escapeHtml(formattedDate)}
            </p>
          </div>

        </div>
      </div>
    `;

    // ------------------------------------------------------------
    // ENVIO RESEND
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // FUTURO PEREDA OS
    // ------------------------------------------------------------
    //
    // Aqui poderá entrar posteriormente a persistência
    // no PostgreSQL/Neon.
    //
    // Exemplo:
    //
    // await createLead({
    //   company,
    //   name,
    //   email,
    //   phone,
    //   projectType,
    //   ...
    // });
    //
    // O payload já está estruturado para essa evolução.
    // ------------------------------------------------------------

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
