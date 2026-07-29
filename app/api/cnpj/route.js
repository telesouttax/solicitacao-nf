export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cnpjRaw = searchParams.get("cnpj") || "";
  const cnpj = cnpjRaw.replace(/\D/g, "");

  if (cnpj.length !== 14) {
    return Response.json(
      { erro: "CNPJ deve ter 14 dígitos." },
      { status: 400 }
    );
  }

  try {
    const resposta = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, {
      cache: "no-store",
    });
    const dados = await resposta.json();

    if (dados.status === "ERROR") {
      return Response.json(
        { erro: dados.message || "CNPJ não encontrado." },
        { status: 404 }
      );
    }

    return Response.json({
      cnpj,
      razao_social: dados.nome || "",
      fantasia: dados.fantasia || "",
      situacao_cadastral: dados.situacao || "",
      logradouro: dados.logradouro || "",
      numero: dados.numero || "",
      bairro: dados.bairro || "",
      municipio: dados.municipio || "",
      uf: dados.uf || "",
      cep: dados.cep || "",
      telefone: dados.telefone || "",
      email: dados.email || "",
    });
  } catch (err) {
    return Response.json(
      { erro: "Falha ao consultar a Receita Federal. Tente novamente." },
      { status: 502 }
    );
  }
}
