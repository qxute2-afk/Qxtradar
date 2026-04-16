export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY nao configurada.' });

  const { tipo = 'bets', dia = 'hoje' } = req.body || {};
  const hoje = new Date();
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);
  const fmt = (d) => d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const dataAlvo = dia === 'amanha' ? fmt(amanha) : fmt(hoje);
  const mesAno = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const prompts = {
    bets: `Especialista em apostas. Data: ${dataAlvo}. Busque jogos reais de futebol. Informe qual casa (ZeroUm, JonBet, BETMGM ou KTO) tem melhor odd para cada bilhete. Use criar_aposta:true para combinar mercados do mesmo jogo. Odd100: 6-8 jogos. Odd10: 3-4 jogos com handicap. OddSegura: 7 selecoes odds 1.5-2.0. SuperOdds: uma boosted por casa. RETORNE APENAS JSON VALIDO SEM NENHUM TEXTO ANTES OU DEPOIS: {"data":"${dataAlvo}","odd100":{"casa_recomendada":"JonBet","casa_cor":"#7b5cff","odd_total":95.0,"nivel_confianca":"baixo","motivo_casa":"melhores odds hoje","jogos":[{"hora":"16:00","time1":"Time A","time2":"Time B","competicao":"Liga","mercados":[{"descricao":"Time A vence","odd":1.44},{"descricao":"Mais de 1.5 gols","odd":1.55}],"odd_combinada_jogo":2.23,"criar_aposta":true}],"aviso":"Aposte com responsabilidade. +18."},"odd10":{"casa_recomendada":"BETMGM","casa_cor":"#ff5c8a","odd_total":10.0,"nivel_confianca":"medio","motivo_casa":"Lucro Turbinado disponivel","jogos":[{"hora":"19:00","time1":"Time C","time2":"Time D","competicao":"Liga","mercados":[{"descricao":"Time C vence","odd":2.10}],"odd_combinada_jogo":2.10,"criar_aposta":false}],"aviso":"Verifique odds antes. +18."},"oddSegura":{"casa_recomendada":"ZeroUm","casa_cor":"#00e5a0","odd_total":15.0,"nivel_confianca":"alto","motivo_casa":"cashback 10% se perder","selecoes":[{"hora":"16:00","jogo":"Time A x Time B","competicao":"Liga","mercado":"Time A vence","odd":1.44,"analise":"Favorito em casa"}],"aviso":"Aposte com responsabilidade. +18."},"superOdds":[{"casa":"JonBet","casa_cor":"#7b5cff","odd":4.20,"jogo":"Time A x Time B","competicao":"Liga","hora":"16:00","mercado":"Mercado boosted","odd_normal":3.80,"descricao":"Odd promocional","aviso":"Pode ser retirada. +18."}]}`,
    criativos: `Marketing de apostas. Data: ${dataAlvo}. Busque jogos importantes. Crie 4 roteiros para redes sociais, um por casa: ZeroUm, JonBet, BETMGM, KTO. RETORNE APENAS JSON VALIDO SEM TEXTO ANTES OU DEPOIS: {"data":"${dataAlvo}","criativos":[{"numero":1,"casa":"ZeroUm","casa_cor":"#00e5a0","formato":"Reels","gancho":"string","desenvolvimento":"string","cta":"string","dica_edicao":"string","duracao_estimada":"45 segundos"},{"numero":2,"casa":"JonBet","casa_cor":"#7b5cff","formato":"Stories","gancho":"string","desenvolvimento":"string","cta":"string","dica_edicao":"string","duracao_estimada":"30 segundos"},{"numero":3,"casa":"BETMGM","casa_cor":"#ff5c8a","formato":"TikTok","gancho":"string","desenvolvimento":"string","cta":"string","dica_edicao":"string","duracao_estimada":"40 segundos"},{"numero":4,"casa":"KTO","casa_cor":"#f0a500","formato":"YouTube Shorts","gancho":"string","desenvolvimento":"string","cta":"string","dica_edicao":"string","duracao_estimada":"55 segundos"}]}`,
    promocoes: `Busque promocoes ativas hoje de ZeroUm, JonBet, BETMGM e KTO apostas Brasil. RETORNE APENAS JSON VALIDO SEM TEXTO ANTES OU DEPOIS: {"data":"${dataAlvo}","promocoes":[{"casa":"ZeroUm","cor":"#00e5a0","itens":[{"titulo":"string","descricao":"string","tipo":"Cashback","validade":"string"}]},{"casa":"JonBet","cor":"#7b5cff","itens":[{"titulo":"string","descricao":"string","tipo":"Bonus","validade":"string"}]},{"casa":"BETMGM","cor":"#ff5c8a","itens":[{"titulo":"string","descricao":"string","tipo":"Sorteio","validade":"string"}]},{"casa":"KTO","cor":"#f0a500","itens":[{"titulo":"string","descricao":"string","tipo":"Cashback","validade":"string"}]}],"financeiro":{"melhor_cpa":{"casa":"JonBet","valor":170},"estimativa_10_conversoes":[{"casa":"ZeroUm","cpa_total":400,"rev_estimado":150,"total":550}]}}`,
    calendario: `Futebol. Mes: ${mesAno}. Busque jogos no sofascore.com. Inclua todas as ligas e sempre Sport Recife, Nautico e Santa Cruz. RETORNE APENAS JSON VALIDO SEM TEXTO ANTES OU DEPOIS: {"mes":"Abril","ano":"2026","jogos":[{"data":"15/04","dia_semana":"Qua","competicao":"Champions League","competicao_tipo":"champions","time1":"Bayern","time2":"Real Madrid","hora":"16:00","fase":"Quartas","destaque":true}]}`
  };

  const maxTokens = { bets: 4000, criativos: 3000, promocoes: 3000, calendario: 5000 };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens[tipo] || 3000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompts[tipo] || prompts.bets }]
      })
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Erro Anthropic: ${err.slice(0, 300)}` });
    }
    const data = await response.json();
    const textContent = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const start = textContent.indexOf('{');
    const end = textContent.lastIndexOf('}');
    if (start === -1) return res.status(500).json({ error: 'JSON nao encontrado', raw: textContent.slice(0, 300) });
    return res.status(200).json(JSON.parse(textContent.slice(start, end + 1)));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
