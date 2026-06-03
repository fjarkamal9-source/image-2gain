/** Navigation top-level fiable (fallback si assign est bloqué). */
export function submitOAuthRedirect(url) {
  if (!url) return;

  try {
    window.location.assign(url);
    return;
  } catch {
    /* Safari peut bloquer assign hors gesture — fallback formulaire */
  }

  const form = document.createElement('form');
  form.method = 'GET';
  form.action = url;
  form.style.display = 'none';
  document.body.appendChild(form);
  form.submit();
}
