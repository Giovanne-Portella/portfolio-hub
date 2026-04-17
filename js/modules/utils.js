// ============================================
// Utils — Funções utilitárias compartilhadas
// ============================================

// ============================================
// SLUG HELPER
// ============================================
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}


// ============================================
// UTILS - XSS Prevention
// ============================================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

/**
 * Sanitize a URL for use in an href attribute.
 * Blocks javascript:, data:, vbscript: and similar dangerous protocols.
 * Returns '#' for any URL that does not start with http://, https://, mailto:, or /.
 */
function safeUrl(url) {
  if (!url) return '#';
  const trimmed = String(url).trim();
  if (/^(https?:\/\/|mailto:|\/)/i.test(trimmed)) {
    return escapeAttr(trimmed);
  }
  return '#';
}


// ============================================
// TIME SINCE CALCULATOR (Company duration)
// ============================================
function calcTimeSince(dateStr) {
  const start = new Date(dateStr);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} ${months > 1 ? 'meses' : 'mês'}`);
  if (parts.length === 0) parts.push('Menos de 1 mês');

  const formatted = start.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  return `${formatted} — presente · ${parts.join(' e ')}`;
}

