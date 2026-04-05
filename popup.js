const DEBUG = false;

const t = window.TrelloPowerUp.iframe();
const statusMessage = document.getElementById('status-message');

const debugLog = (...args) => {
  if (DEBUG) console.debug('[trello-id-tools]', ...args);
};

t.render(async () => {
  try {
    const message = t.arg('message') || 'Done';
    const state = t.arg('state') || 'success';
    statusMessage.textContent = message;
    statusMessage.dataset.state = state;
    await t.sizeTo('#popup-root');

    // Auto-close on success
    if (state === 'success') {
      window.setTimeout(() => t.closePopup(), 900);
    }
  } catch (err) {
    debugLog('Popup render error', err);
    statusMessage.textContent = 'Something went wrong.';
    statusMessage.dataset.state = 'error';
    await t.sizeTo('#popup-root');
  }
});
