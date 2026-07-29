"use client";

import { useState } from "react";
import styles from "./page.module.css";

const initialForm = {
  solicitante_cnpj: "",
  solicitante_razao_social: "",
  solicitante_nome: "",
  solicitante_email: "",
  solicitante_whatsapp: "",
  destinatario_cnpj: "",
  destinatario_razao_social: "",
  valor_servico: "",
  valor_desconto: "0",
  descricao: "",
};

function formatDocumento(value) {
  return value.replace(/\D/g, "").slice(0, 14);
}

export default function Home() {
  const [step, setStep] = useState(1); // 1 identificação, 2 pergunta destinatário, 3 dados do serviço
  const [paraSiMesmo, setParaSiMesmo] = useState(null); // true | false | null
  const [form, setForm] = useState(initialForm);
  const [buscando, setBuscando] = useState(null); // "solicitante" | "destinatario" | null
  const [erroBusca, setErroBusca] = useState("");
  const [avisoBusca, setAvisoBusca] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null); // "sucesso" | "erro" | null
  const [erroEnvio, setErroEnvio] = useState("");

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function buscarCNPJ(alvo) {
    const campoDocumento = alvo === "solicitante" ? "solicitante_cnpj" : "destinatario_cnpj";
    const documento = formatDocumento(form[campoDocumento]);

    setErroBusca("");
    setAvisoBusca("");

    if (documento.length !== 11 && documento.length !== 14) {
      setErroBusca("Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }

    if (documento.length === 11) {
      setAvisoBusca("CPF não pode ser consultado automaticamente. Preencha o nome manualmente abaixo.");
      return;
    }

    setBuscando(alvo);

    try {
      const resp = await fetch(`/api/cnpj?cnpj=${documento}`);
      const dados = await resp.json();

      if (!resp.ok) {
        setErroBusca(dados.erro || "CNPJ não encontrado.");
        setBuscando(null);
        return;
      }

      if (alvo === "solicitante") {
        atualizarCampo("solicitante_razao_social", dados.razao_social);
      } else {
        atualizarCampo("destinatario_razao_social", dados.razao_social);
      }
    } catch {
      setErroBusca("Falha ao consultar o CNPJ. Tente novamente.");
    } finally {
      setBuscando(null);
    }
  }

  function avancarParaPergunta() {
    if (
      !form.solicitante_cnpj ||
      !form.solicitante_razao_social ||
      !form.solicitante_nome ||
      !form.solicitante_email ||
      !form.solicitante_whatsapp
    ) {
      setErroBusca("Preencha todos os campos de identificação antes de continuar.");
      return;
    }
    setErroBusca("");
    setStep(2);
  }

  function escolherDestino(paraSi) {
    setParaSiMesmo(paraSi);
    if (paraSi) {
      setForm((prev) => ({
        ...prev,
        destinatario_cnpj: prev.solicitante_cnpj,
        destinatario_razao_social: prev.solicitante_razao_social,
      }));
    } else {
      setForm((prev) => ({ ...prev, destinatario_cnpj: "", destinatario_razao_social: "" }));
    }
    setErroBusca("");
    setStep(3);
  }

  async function enviarSolicitacao(e) {
    e.preventDefault();

    if (!form.destinatario_cnpj || !form.valor_servico || !form.descricao) {
      setErroEnvio("Preencha os campos obrigatórios do serviço.");
      return;
    }

    setEnviando(true);
    setErroEnvio("");

    try {
      const resp = await fetch("/api/solicitacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const dados = await resp.json();

      if (!resp.ok) {
        setErroEnvio(dados.erro || "Não foi possível enviar a solicitação.");
        setResultado("erro");
      } else {
        setResultado("sucesso");
      }
    } catch {
      setErroEnvio("Falha de conexão. Tente novamente.");
      setResultado("erro");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado === "sucesso") {
    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <h1>Solicitação enviada</h1>
          <p className={styles.successText}>
            Recebemos sua solicitação de emissão de nota fiscal. Nossa equipe vai processá-la em breve.
          </p>
          <button
            className={styles.buttonSecondary}
            onClick={() => {
              setForm(initialForm);
              setParaSiMesmo(null);
              setStep(1);
              setResultado(null);
            }}
          >
            Fazer nova solicitação
          </button>
        </div>
      </main>
    );
  }

  const titulos = {
    1: "Identifique sua empresa",
    2: "Para quem é esta nota?",
    3: "Dados do serviço prestado",
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.eyebrow}>Solicitação de nota fiscal · NFS-e</div>
        <h1>{titulos[step]}</h1>

        <div className={styles.steps}>
          <span className={step === 1 ? styles.stepActive : styles.stepDone}>1. Identificação</span>
          <span className={styles.stepDivider}>—</span>
          <span className={step === 2 ? styles.stepActive : step > 2 ? styles.stepDone : styles.stepPending}>
            2. Destinatário
          </span>
          <span className={styles.stepDivider}>—</span>
          <span className={step === 3 ? styles.stepActive : styles.stepPending}>3. Serviço</span>
        </div>

        {step === 1 && (
          <div className={styles.form}>
            <label className={styles.label}>
              CNPJ ou CPF da sua empresa
              <div className={styles.inlineGroup}>
                <input
                  className={styles.input}
                  value={form.solicitante_cnpj}
                  onChange={(e) => atualizarCampo("solicitante_cnpj", formatDocumento(e.target.value))}
                  placeholder="Somente números"
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className={styles.buttonSecondary}
                  onClick={() => buscarCNPJ("solicitante")}
                  disabled={buscando === "solicitante"}
                >
                  {buscando === "solicitante" ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </label>

            <label className={styles.label}>
              Razão social
              <input
                className={styles.input}
                value={form.solicitante_razao_social}
                onChange={(e) => atualizarCampo("solicitante_razao_social", e.target.value)}
                placeholder="Preenchido automaticamente após a busca"
              />
            </label>

            <label className={styles.label}>
              Seu nome
              <input
                className={styles.input}
                value={form.solicitante_nome}
                onChange={(e) => atualizarCampo("solicitante_nome", e.target.value)}
              />
            </label>

            <label className={styles.label}>
              E-mail
              <input
                type="email"
                className={styles.input}
                value={form.solicitante_email}
                onChange={(e) => atualizarCampo("solicitante_email", e.target.value)}
              />
            </label>

            <label className={styles.label}>
              WhatsApp
              <input
                className={styles.input}
                value={form.solicitante_whatsapp}
                onChange={(e) => atualizarCampo("solicitante_whatsapp", e.target.value.replace(/\D/g, ""))}
                placeholder="Com DDD, somente números"
                inputMode="numeric"
              />
            </label>

            {erroBusca && <p className={styles.errorText}>{erroBusca}</p>}
            {avisoBusca && <p className={styles.helperText}>{avisoBusca}</p>}

            <button type="button" className={styles.buttonPrimary} onClick={avancarParaPergunta}>
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.form}>
            <p className={styles.helperText}>
              Esta nota fiscal é para a sua própria empresa, ou para um cliente seu?
            </p>
            <div className={styles.inlineGroup}>
              <button type="button" className={styles.buttonPrimary} onClick={() => escolherDestino(true)}>
                É para mim mesmo
              </button>
              <button type="button" className={styles.buttonSecondary} onClick={() => escolherDestino(false)}>
                É para outro cliente
              </button>
            </div>
            <button type="button" className={styles.linkButton} onClick={() => setStep(1)}>
              Voltar
            </button>
          </div>
        )}

        {step === 3 && (
          <form className={styles.form} onSubmit={enviarSolicitacao}>
            {paraSiMesmo === false && (
              <>
                <label className={styles.label}>
                  CNPJ ou CPF do cliente que receberá a nota
                  <div className={styles.inlineGroup}>
                    <input
                      className={styles.input}
                      value={form.destinatario_cnpj}
                      onChange={(e) => atualizarCampo("destinatario_cnpj", formatDocumento(e.target.value))}
                      placeholder="Somente números"
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      className={styles.buttonSecondary}
                      onClick={() => buscarCNPJ("destinatario")}
                      disabled={buscando === "destinatario"}
                    >
                      {buscando === "destinatario" ? "Buscando..." : "Buscar"}
                    </button>
                  </div>
                </label>

                <label className={styles.label}>
                  Razão social do cliente
                  <input
                    className={styles.input}
                    value={form.destinatario_razao_social}
                    onChange={(e) => atualizarCampo("destinatario_razao_social", e.target.value)}
                    placeholder="Preenchido automaticamente após a busca"
                  />
                </label>
              </>
            )}

            {paraSiMesmo === true && (
              <p className={styles.helperText}>
                Nota destinada à sua própria empresa: {form.destinatario_razao_social || form.destinatario_cnpj}
              </p>
            )}

            <label className={styles.label}>
              Valor do serviço (R$)
              <input
                className={styles.input}
                value={form.valor_servico}
                onChange={(e) => atualizarCampo("valor_servico", e.target.value)}
                placeholder="Ex: 1500.00"
                inputMode="decimal"
              />
            </label>

            <label className={styles.label}>
              Valor de desconto/dedução (R$)
              <input
                className={styles.input}
                value={form.valor_desconto}
                onChange={(e) => atualizarCampo("valor_desconto", e.target.value)}
                placeholder="0.00 se não houver"
                inputMode="decimal"
              />
            </label>

            <label className={styles.label}>
              Descrição do serviço
              <textarea
                className={styles.textarea}
                rows={4}
                value={form.descricao}
                onChange={(e) => atualizarCampo("descricao", e.target.value)}
              />
            </label>

            {erroBusca && <p className={styles.errorText}>{erroBusca}</p>}
            {avisoBusca && <p className={styles.helperText}>{avisoBusca}</p>}
            {erroEnvio && <p className={styles.errorText}>{erroEnvio}</p>}

            <div className={styles.inlineGroup}>
              <button type="button" className={styles.buttonSecondary} onClick={() => setStep(2)}>
                Voltar
              </button>
              <button type="submit" className={styles.buttonPrimary} disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar solicitação"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
