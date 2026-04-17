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

// ============================================
// In-memory rate limiter (per IP, resets on
// cold start — adequate for a personal site).
// Limit: 30 requests per IP per 60 seconds.
// ============================================
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX       = 30;
const _rateLimitMap = new Map(); // ip → { count, resetAt }

function isRateLimited(ip) {
  const now = Date.now();
  let entry = _rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    _rateLimitMap.set(ip, entry);
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// Allowed origins — add custom domain here if you ever set one
const ALLOWED_ORIGINS = new Set([
  'https://gm-portfolio-hub.netlify.app',
  'http://localhost',          // local dev
]);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Origin check — block requests from outside the portfolio
  const origin = event.headers['origin'] || '';
  const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
  if (origin && !ALLOWED_ORIGINS.has(origin) && !isLocalhost) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  // Rate limiting per IP
  const ip = event.headers['x-nf-client-connection-ip']
          || event.headers['x-forwarded-for']?.split(',')[0]?.trim()
          || 'unknown';
  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers: { 'Retry-After': '60' },
      body: JSON.stringify({ error: 'Too many requests' }),
    };
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
