# QXTradar — Guia de Deploy na Vercel

## O que é este projeto
Site completo de monitoramento de apostas e afiliados com:
- Promoções em tempo real das 4 casas (ZeroUm, JonBet, BETMGM, KTO)
- Aposta do dia com odd ~100 baseada em jogos reais
- 3 roteiros de criativos para gravar
- Painel de afiliados com calculadora de receita

---

## Passo a Passo — Deploy Gratuito na Vercel

### 1. Criar conta no GitHub (gratuito)
1. Acesse https://github.com e clique em **Sign up**
2. Crie sua conta com email e senha
3. Confirme o email

### 2. Criar repositório no GitHub
1. No GitHub, clique no botão verde **New** (canto superior esquerdo)
2. Nome do repositório: `qxtradar`
3. Deixe como **Public**
4. Clique em **Create repository**

### 3. Fazer upload dos arquivos
1. Na página do repositório criado, clique em **uploading an existing file**
2. Arraste as pastas `api/`, `public/` e o arquivo `vercel.json`
3. Clique em **Commit changes**

### 4. Criar conta na Vercel (gratuito)
1. Acesse https://vercel.com e clique em **Sign Up**
2. Escolha **Continue with GitHub**
3. Autorize a Vercel a acessar seu GitHub

### 5. Fazer o deploy
1. Na Vercel, clique em **New Project**
2. Encontre o repositório `qxtradar` e clique em **Import**
3. Clique em **Deploy** (sem mudar nada)
4. Aguarde ~1 minuto — o site vai estar no ar!

### 6. Configurar a API Key (OBRIGATÓRIO)
1. No painel da Vercel, abra o projeto `qxtradar`
2. Clique em **Settings** → **Environment Variables**
3. Clique em **Add**:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** sua chave que começa com `sk-ant-...`
4. Clique em **Save**
5. Vá em **Deployments** → clique nos 3 pontos → **Redeploy**

### 7. Acessar o site
Seu site estará disponível em: `https://qxtradar-[hash].vercel.app`

---

## Estrutura do Projeto
```
qxtradar/
├── api/
│   └── relatorio.js     ← backend (chama a API da Anthropic)
├── public/
│   └── index.html       ← frontend (o site)
└── vercel.json          ← configuração da Vercel
```

---

## Como usar
1. Acesse a URL do seu site
2. Clique em **Relatório do Dia**
3. Aguarde ~30 segundos (a IA busca tudo na web)
4. Pronto — promoções, aposta e criativos do dia!

---

## Dúvidas comuns

**O site demorou muito para responder?**
Normal — a IA faz buscas reais na web. Pode levar 20-40 segundos.

**Apareceu erro de API?**
Verifique se a `ANTHROPIC_API_KEY` foi configurada corretamente nas variáveis de ambiente.

**Como atualizar o site?**
Faça as alterações nos arquivos, suba de novo no GitHub e a Vercel atualiza automaticamente.

---

+18 | Jogue com responsabilidade | As apostas envolvem risco de perda financeira

## Variáveis de ambiente necessárias

| Variável | Obrigatório | Descrição |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Sim | Chave da API Anthropic |
| `SMARTICO_API_KEY` | Opcional | Chave da API Smartico para Analytics automático |

## Novidades v3
- Bets: qual casa em cada bilhete
- "Criar aposta" — combina mercados do mesmo jogo
- Odd 10 com mercados alternativos e combos
- 7+ seleções na aposta segura
- Super Odds: todas as casas
- Toggle Hoje / Amanhã nas Bets e Criativos
- Afiliados: botão para adicionar novas casas
- Analytics: tabela filtrável + integração Smartico opcional
- Exportar CSV
