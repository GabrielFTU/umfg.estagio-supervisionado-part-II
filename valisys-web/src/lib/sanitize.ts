/**
 * Utilitário de sanitização XSS para uso quando HTML de fora do React precisar
 * ser renderizado (ex: conteúdo de terceiros via dangerouslySetInnerHTML).
 *
 * React já escapa todos os valores em JSX por padrão — use estas funções apenas
 * se você PRECISAR renderizar HTML externo.
 */

const HTML_TAG_REGEX = /<[^>]*(>|$)/g;
const JS_PROTOCOL_REGEX = /^javascript:/i;
const DATA_URI_REGEX = /^data:/i;

/** Remove todas as tags HTML de uma string. */
export function stripHtml(input: string): string {
  return input.replace(HTML_TAG_REGEX, '');
}

/** Sanitiza uma URL para uso em href/src — bloqueia javascript: e data: URIs. */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (JS_PROTOCOL_REGEX.test(trimmed) || DATA_URI_REGEX.test(trimmed)) {
    return '#';
  }
  return trimmed;
}

/** Trunca e sanitiza texto de entrada do usuário para exibição segura. */
export function safeText(input: unknown, maxLength = 4000): string {
  if (input == null) return '';
  const str = String(input).slice(0, maxLength);
  return stripHtml(str);
}
