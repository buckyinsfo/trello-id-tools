const DEBUG = false;

const LABELS = {
  cardId:   'Card ID',
  listId:   'List ID',
  boardId:  'Board ID',
  cardUrl:  'Card URL',
  metadata: 'Metadata JSON',
};

const t = window.TrelloPowerUp.iframe();

const debugLog = (...args) => {
  if (DEBUG) console.debug('[trello-id-tools]', ...args);
};

const getTrelloValue = async (action) => {
  const [card, list, board] = await Promise.all([
    t.card('id', 'url', 'shortLink', 'idShort'),
    t.list('id'),
    t.board('id'),
  ]);

  switch (action) {
    case 'cardId':   return card.id;
    case 'listId':   return list.id;
    case 'boardId':  return board.id;
    case 'cardUrl':  return card.url;
    case 'metadata': return JSON.stringify({
      cardId:     card.id,
      listId:     list.id,
      boardId:    board.id,
      cardUrl:    card.url,
      shortLink:  card.shortLink,
      cardNumber: card.idShort,
    }, null, 2);
    default: throw new Error(`Unknown action: ${action}`);
  }
};

const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(String(text));
};

t.render(async () => {
  const action          = t.arg('action');
  const showValueInPopup = t.arg('showValueInPopup');

  const valueView  = document.getElementById('value-view');
  const statusView = document.getElementById('status-view');

  try {
    const value = await getTrelloValue(action);
    debugLog('Resolved value', action, String(value).substring(0, 40));

    if (showValueInPopup) {
      // --- Display mode: show the value, let user click Copy ---
      const valueLabel = document.getElementById('value-label');
      const valueInput = document.getElementById('value-input');
      const copyBtn    = document.getElementById('copy-btn');
      const copyStatus = document.getElementById('copy-status');

      valueLabel.textContent = LABELS[action] || action;
      valueInput.value = value;

      valueView.style.display = 'block';
      await t.sizeTo('#popup-root');

      // Select all text for easy manual copy
      valueInput.focus();
      valueInput.select();

      // Copy button — user gesture inside popup = clipboard access granted
      copyBtn.addEventListener('click', async () => {
        try {
          await copyToClipboard(value);
          copyStatus.textContent = 'Copied ✓';
          copyStatus.dataset.state = 'success';
          copyBtn.textContent = 'Copied ✓';
          copyBtn.disabled = true;
          await t.sizeTo('#popup-root');
          window.setTimeout(() => t.closePopup(), 1200);
        } catch (err) {
          debugLog('Copy failed', err.message);
          copyStatus.textContent = 'Copy failed — select and use ⌘C';
          copyStatus.dataset.state = 'error';
          await t.sizeTo('#popup-root');
        }
      });

    } else {
      // --- Silent mode: try to copy immediately, show brief result ---
      const statusMessage = document.getElementById('status-message');
      statusView.style.display = 'block';

      try {
        await copyToClipboard(value);
        statusMessage.textContent = `Copied ${LABELS[action]} ✓`;
        statusMessage.dataset.state = 'success';
        await t.sizeTo('#popup-root');
        window.setTimeout(() => t.closePopup(), 900);
      } catch (err) {
        // Silent mode failed — fall back to showing value
        statusView.style.display = 'none';
        const valueLabel = document.getElementById('value-label');
        const valueInput = document.getElementById('value-input');
        const copyBtn    = document.getElementById('copy-btn');
        const copyStatus = document.getElementById('copy-status');

        valueLabel.textContent = LABELS[action] || action;
        valueInput.value = value;
        valueView.style.display = 'block';
        await t.sizeTo('#popup-root');

        valueInput.focus();
        valueInput.select();

        copyBtn.addEventListener('click', async () => {
          try {
            await copyToClipboard(value);
            copyStatus.textContent = 'Copied ✓';
            copyStatus.dataset.state = 'success';
            copyBtn.textContent = 'Copied ✓';
            copyBtn.disabled = true;
            await t.sizeTo('#popup-root');
            window.setTimeout(() => t.closePopup(), 1200);
          } catch (e) {
            copyStatus.textContent = 'Select and use ⌘C';
            copyStatus.dataset.state = 'error';
            await t.sizeTo('#popup-root');
          }
        });
      }
    }

  } catch (err) {
    debugLog('Popup error', err.message);
    const statusMessage = document.getElementById('status-message');
    statusView.style.display = 'block';
    statusMessage.textContent = err.message || 'Something went wrong.';
    statusMessage.dataset.state = 'error';
    await t.sizeTo('#popup-root');
  }
});
