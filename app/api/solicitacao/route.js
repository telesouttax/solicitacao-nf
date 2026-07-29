export async function POST(request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return Response.json(
      { erro: "Webhook do n8n não configurado no servidor." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const payload = {
    tipo_nota: "NFS-e",
    enviado_em: new Date().toISOString(),

    solicitante_cnpj: (body.solicitante_cnpj || "").replace(/\D/g, ""),
    solicitante_razao_social: body.solicitante_razao_social || "",
    solicitante_nome: body.solicitante_nome || "",
    solicitante_email: body.solicitante_email || "",
    solicitante_whatsapp: (body.solicitante_whatsapp || "").replace(/\D/g, ""),

    destinatario_cnpj: (body.destinatario_cnpj || "").replace(/\D/g, ""),
    destinatario_razao_social: body.destinatario_razao_social || "",

    valor_servico: body.valor_servico || "",
    valor_desconto: body.valor_desconto || "0",
    descricao: body.descricao || "",
  };

  try {
    const resposta = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      return Response.json(
        { erro: "O sistema de solicitações não respondeu corretamente. Tente novamente em instantes." },
        { status: 502 }
      );
    }

    return Response.json({ sucesso: true });
  } catch (err) {
    return Response.json(
      { erro: "Não foi possível enviar a solicitação. Verifique sua conexão e tente novamente." },
      { status: 502 }
    );
  }
}
