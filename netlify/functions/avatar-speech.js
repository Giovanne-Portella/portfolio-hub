// ============================================
// NETLIFY FUNCTION: avatar-speech
// Gera uma fala contextual para o avatar do
// portfólio usando Claude Haiku.
//
// POST /.netlify/functions/avatar-speech
// Body : { section: string, ctx: AvatarCtx }
// Response: { bubble: string }
//
// Requer env var: ANTHROPIC_API_KEY
// Node 18 (fetch nativo — sem dependências npm)
// ============================================

const SECTION_NAMES = {
  hero:                   'página inicial',
  about:                  'seção Sobre mim',
  'github-contributions': 'seção de contribuições no GitHub',
  projects:               'seção de projetos',
  certificates:           'seção de certificados e cursos',
  companies:              'seção de experiência profissional',
  feedbacks:              'seção de feedbacks e depoimentos',
  contact:                'seção de contato',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Not configured' }) };
  }

  let section, ctx;
  try {
    ({ section = 'hero', ctx = {} } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad request' }) };
  }

  // Build context details per section
  let contextDetails = '';
  if (section === 'projects' && ctx.projects?.length) {
    contextDetails = ` Projetos: ${ctx.projects.slice(0, 3).join(', ')}.`;
  } else if (section === 'certificates' && ctx.certs?.length) {
    contextDetails = ` Certificações: ${ctx.certs.slice(0, 3).join(', ')}.`;
  } else if (section === 'companies' && ctx.company) {
    contextDetails = ` Empresa: ${ctx.company}.`;
  }

  const name  = (ctx.name  || 'Dev').split(' ')[0];
  const title = ctx.title || 'desenvolvedor';
  const sectionLabel = SECTION_NAMES[section] || section;

  const system = [
    `Você é o avatar pixel-art do portfólio de ${name}, ${title}.`,
    'Gere uma fala curta para aparecer num balão de fala animado.',
    'Regras estritas: máximo 55 caracteres, português informal, no máximo 1 emoji,',
    'SEM aspas, SEM explicações — responda SOMENTE com o texto da fala.',
  ].join(' ');

  const userMsg = `Seção atual: ${sectionLabel}.${contextDetails} Gere a fala.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 80,
        system,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    if (!res.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream error' }) };
    }

    const data = await res.json();
    // Trim and strip any quotes the model might have added
    const bubble = (data.content?.[0]?.text || '')
      .trim()
      .replace(/^["'«»]|["'«»]$/g, '')
      .slice(0, 70);

    if (!bubble) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Empty response' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ bubble }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
