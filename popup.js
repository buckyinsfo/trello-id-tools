const DEBUG = false;

const t = window.TrelloPowerUp.iframe();

const debugLog = (...args) => {
  if (DEBUG) console.debug('[trello-id-tools]', ...args);
};

t.render(async () => {
  const label = t.arg('label') || 'Value';
  const value = t.arg('value') || '';

  const valueLabel = document.getElementById('value-label');
  const valueInput = document.getElementById('value-input');
  const copyBtn    = document.getElementById('copy-btn');
  const hint       = document.getElementById('copy-status');

  valueLabel.textContent = label;
  valueInput.value       = value;
  hint.textContent       = 'Value ready — click Copy or press ⌘C';

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
});
