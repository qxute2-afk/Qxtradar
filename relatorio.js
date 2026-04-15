export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' });

  const { tipo = 'bets', dia = 'hoje' } = req.body || {};
  const hoje = new Date();
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);
  const fmtData = (d) => d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const dataAlvo = dia === 'amanha' ? fmtData(amanha) : fmtData(hoje);
  const mesAno = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const prompts = {

    bets: `Você é especialista em apostas esportivas. A data alvo é ${dataAlvo}.
Use web search para buscar jogos REAIS de futebol dessa data em todas as ligas mundiais.

REGRAS IMPORTANTES:
1. Para cada aposta, especifique QUAL CASA (ZeroUm, JonBet, BETMGM ou KTO) é recomendada para aquele bilhete, baseado em qual tem melhores odds para aquelas seleções.
2. Use "criar aposta" — combine múltiplos mercados do MESMO jogo para aumentar a odd (ex: Bayern vence + mais de 1.5 gols na partida = odd combinada mais alta).
3. Odd ~100: precisa de pelo menos 8-10 seleções combinando criar aposta e múltiplas partidas.
4. Odd ~10: precisa de 4-5 seleções com mercados alternativos (handicap, over/under, cartões, etc).
5. Busque super odds boosted disponíveis hoje em ZeroUm, JonBet, BETMGM e KTO — tente encontrar pelo menos uma por casa.

Responda APENAS JSON puro sem markdown:
{
  "data": "${dataAlvo}",
  "odd100": {
    "casa_recomendada": "string (ZeroUm|JonBet|BETMGM|KTO)",
    "casa_cor": "string hex",
    "odd_total": 0,
    "nivel_confianca": "baixo",
    "motivo_casa": "string (por que essa casa para esse bilhete)",
    "jogos": [
      {
        "hora": "string",
        "time1": "string",
        "time2": "string",
        "competicao": "string",
        "mercados": [
          {"descricao": "string (ex: Bayern vence)", "odd": 0},
          {"descricao": "string (ex: +1.5 gols no jogo)", "odd": 0}
        ],
        "odd_combinada_jogo": 0,
        "criar_aposta": true
      }
    ],
    "aviso": "string"
  },
  "odd10": {
    "casa_recomendada": "string",
    "casa_cor": "string hex",
    "odd_total": 0,
    "nivel_confianca": "medio",
    "motivo_casa": "string",
    "jogos": [
      {
        "hora": "string",
        "time1": "string",
        "time2": "string",
        "competicao": "string",
        "mercados": [
          {"descricao": "string", "odd": 0}
        ],
        "odd_combinada_jogo": 0,
        "criar_aposta": false
      }
    ],
    "aviso": "string"
  },
  "oddSegura": {
    "casa_recomendada": "string",
    "casa_cor": "string hex",
    "odd_total": 0,
    "nivel_confianca": "alto",
    "motivo_casa": "string",
    "selecoes": [
      {"hora": "string", "jogo": "string", "competicao": "string", "mercado": "string", "odd": 0, "analise": "string curta"}
    ],
    "aviso": "string"
  },
  "superOdds": [
    {
      "casa": "string (ZeroUm|JonBet|BETMGM|KTO)",
      "casa_cor": "string hex",
      "odd": 0,
      "jogo": "string",
      "competicao": "string",
      "hora": "string",
      "mercado": "string",
      "odd_normal": 0,
      "descricao": "string (por que está boosted e quanto acima do normal)",
      "aviso": "string"
    }
  ]
}`,

    criativos: `Especialista em marketing de apostas. Data alvo: ${dataAlvo}. Use web search para saber os jogos importantes dessa data.

Crie 4 roteiros (30-60s) para redes sociais, um por casa: ZeroUm, JonBet, BETMGM, KTO. Responda JSON puro:
{
  "data": "${dataAlvo}",
  "criativos": [
    {
      "numero": 1,
      "casa": "string",
      "casa_cor": "string hex",
      "formato": "string",
      "gancho": "string (primeiros 3 segundos impactantes)",
      "desenvolvimento": "string (o que falar e mostrar)",
      "cta": "string (call to action com link na bio)",
      "dica_edicao": "string",
      "duracao_estimada": "string (ex: 45 segundos)"
    }
  ]
}`,

    promocoes: `Busque promoções ativas hoje (${dataAlvo}) de ZeroUm, JonBet, BETMGM e KTO apostas Brasil. JSON puro:
{
  "data": "${dataAlvo}",
  "promocoes": [
    {"casa": "string", "cor": "string", "itens": [{"titulo": "string", "descricao": "string", "tipo": "string", "validade": "string"}]}
  ],
  "financeiro": {
    "melhor_cpa": {"casa": "string", "valor": 0},
    "estimativa_10_conversoes": [{"casa": "string", "cpa_total": 0, "rev_estimado": 0, "total": 0}]
  }
}`,

    calendario: `Especialista em futebol. Hoje é ${dataAlvo}. Busque no sofascore.com e resultados.com os principais jogos do mês ${mesAno}. Inclua TODOS os jogos: Champions, Premier, La Liga, Serie A, Bundesliga, Ligue 1, Brasileirao, Serie B, Serie C, Libertadores, Sul-Americana, Copa do Nordeste, Copa do Brasil, Copa do Mundo de Clubes. Inclua SEMPRE jogos de Sport Recife, Náutico e Santa Cruz. Retorne JSON puro:
{"mes":"string","ano":"string","jogos":[{"data":"DD/MM","dia_semana":"string","competicao":"string","competicao_tipo":"champions|premier|laliga|seriea|bundesliga|ligue1|libertadores|sulamericana|brasileirao|serieb|seriec|nordeste|copabrasil|outros","time1":"string","time2":"string","hora":"string","fase":"string","destaque":true}]}`
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompts[tipo] || prompts.bets }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Erro Anthropic: ${err.slice(0, 200)}` });
    }

    const data = await response.json();
    const textContent = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const start = textContent.indexOf('{');
    const end = textContent.lastIndexOf('}');
    if (start === -1) return res.status(500).json({ error: 'JSON não encontrado', raw: textContent.slice(0, 300) });
    return res.status(200).json(JSON.parse(textContent.slice(start, end + 1)));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
