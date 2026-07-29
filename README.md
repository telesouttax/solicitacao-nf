# Site de Solicitação de NF

## O que este projeto faz

1. O cliente digita o CNPJ da empresa dele → o site consulta a Receita Federal automaticamente e preenche a razão social.
2. O cliente preenche os dados do serviço prestado e do destinatário da nota.
3. Ao enviar, o site dispara os dados direto para o webhook do n8n (mesmo fluxo que já existe: Chat, Sheets, Acessórias).

## Como publicar (sem usar terminal)

### 1. Subir os arquivos no GitHub

1. Acesse github.com e crie um novo repositório (New repository), ex: `site-solicitacao-nf`. Deixe como **privado**.
2. Dentro do repositório vazio, clique em **"uploading an existing file"** (ou "Add file" → "Upload files").
3. Abra a pasta deste projeto no seu computador e **arraste todos os arquivos e pastas para dentro da janela do navegador** (o Chrome/Edge mantêm a estrutura de pastas ao arrastar).
4. Clique em **"Commit changes"**.

### 2. Conectar na Vercel

1. Acesse vercel.com e faça login.
2. Clique em **"Add New" → "Project"**.
3. Selecione o repositório que você acabou de criar no GitHub.
4. Antes de clicar em Deploy, abra a seção **"Environment Variables"** e adicione:
   - Nome: `N8N_WEBHOOK_URL`
   - Valor: a URL de produção do seu webhook do n8n (ex: `https://telesouttax.app.n8n.cloud/webhook/solicitacao-nf`)
5. Clique em **"Deploy"**.

Depois de alguns minutos, a Vercel te dá uma URL pública (tipo `site-solicitacao-nf.vercel.app`) — é o link que você vai enviar aos clientes.

## Importante: ajuste necessário no n8n

Este site envia os dados com nomes de campo diferentes dos que vinham do Google Forms. Será preciso ajustar o node **"Edit Fields"** no n8n para ler os novos nomes:

- `solicitante_cnpj`, `solicitante_razao_social`, `solicitante_nome`, `solicitante_email`, `solicitante_whatsapp`
- `destinatario_cnpj`, `destinatario_razao_social`
- `valor_servico`, `valor_desconto`, `descricao`
- `tipo_nota` (sempre virá `"NFS-e"` por enquanto)
