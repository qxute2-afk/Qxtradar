export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const smarticoKey = process.env.SMARTICO_API_KEY;

  // Se não tem key Smartico, retorna dados mock para não quebrar a UI
  if (!smarticoKey) {
    return res.status(200).json({ source: 'manual', data: [] });
  }

  const { date_from, date_to } = req.body || {};

  try {
    const url = `https://boapi.smartico.ai/api/af2_media_report_af?aggregation_period=DAY&date_from=${date_from || ''}&date_to=${date_to || ''}`;
    const response = await fetch(url, {
      headers: { 'authorization': smarticoKey }
    });

    if (!response.ok) {
      return res.status(200).json({ source: 'manual', data: [], error: 'Smartico indisponível' });
    }

    const raw = await response.json();
    const rows = (raw.data || []).map(r => ({
      data: r.dt ? r.dt.split('T')[0] : '',
      casa: r.brand_name || '—',
      cliques: r.visit_count || 0,
      cadastros: r.registration_count || 0,
      ftd: r.ftd_count || 0,
      deposito: r.deposit_total || 0,
      cpa: r.commissions_cpa || 0,
      rev: r.commissions_rev_share || 0,
    }));

    return res.status(200).json({ source: 'smartico', data: rows });
  } catch (err) {
    return res.status(200).json({ source: 'manual', data: [], error: err.message });
  }
}
