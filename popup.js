const DEBUG = false;

const t = window.TrelloPowerUp.iframe();

const debugLog = (...args) => {
  if (DEBUG) console.debug('[trello-id-tools]', ...args);
};

// execCommand('copy') on a visible selected element.
// MUST be called from a real user gesture (click/keypress).
const copyToClipboard = (text) => {
  const input = document.getElementById('value-input');
  input.value = text;
  input.style.display = 'block';
  input.focus();
  input.select();
  input.setSelectionRange(0, text.length);
  const success = document.execCommand('copy');
  input.style.display = '';
  return success;
};

const onCopySuccess = (label) => {
  t.alert({ message: `${label} copied to clipboard`, duration: 3 });
  window.setTimeout(() => t.closePopup(), 80);
};

t.render(async () => {
  const label            = t.arg('label') || 'Value';
  const value            = t.arg('value') || '';
  const autoCopy         = t.arg('autoCopy') === 'true';
  const showValueInPopup = t.arg('showValueInPopup') === 'true';

  debugLog('Args:', { label, autoCopy, showValueInPopup, valueLength: value.length });

  const autoView   = document.getElementById('auto-view');
  const manualView = document.getElementById('manual-view');
  const statusView = document.getElementById('status-view');

  if (autoCopy) {
    // ── Auto-copy mode ──
    // Show a full-surface button. The user clicks it — that IS a real
    // trusted gesture — so execCommand('copy') succeeds.
    // Pre-focus with rAF so Enter/Space also works immediately.
    const btn = document.getElementById('btn-auto');
    btn.textContent = `Click to copy ${label}`;

    autoView.style.display = 'block';
    await t.sizeTo('#popup-root');

    btn.addEventListener('click', () => {
      const success = copyToClipboard(value);
      if (success) {
        onCopySuccess(label);
      } else {
        // Fallback: switch to manual view
        autoView.style.display  = 'none';
        manualView.style.display = 'block';
        document.getElementById('value-label').textContent = label;
        document.getElementById('copy-status').textContent = 'Click Copy or press ⌘C';
        t.sizeTo('#popup-root');
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });

    // Pre-focus so Enter works without a mouse click
    requestAnimationFrame(() => btn.focus());

  } else {
    // ── Manual mode ──
    const valueLabel = document.getElementById('value-label');
    const valueInput = document.getElementById('value-input');
    const copyBtn    = document.getElementById('btn-manual');
    const hint       = document.getElementById('copy-status');

    valueLabel.textContent = label;
    valueInput.value       = value;
    hint.textContent       = 'Value ready — click Copy or press ⌘C';

    manualView.style.display = 'block';
    await t.sizeTo('#popup-root');

    valueInput.focus();
    valueInput.select();

    copyBtn.addEventListener('click', () => {
      valueInput.select();
      const success = document.execCommand('copy');
      if (success) {
        hint.textContent    = 'Copied ✓';
        hint.dataset.state  = 'success';
        copyBtn.textContent = 'Copied ✓';
        copyBtn.disabled    = true;
        t.sizeTo('#popup-root');
        t.alert({ message: `${label} copied to clipboard`, duration: 3 });
        window.setTimeout(() => t.closePopup(), 1200);
      } else {
        hint.textContent   = 'Press ⌘C to copy';
        hint.dataset.state = '';
        t.sizeTo('#popup-root');
      }
    });
  }
});
