const DEBUG = true;

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

t.render(async () => {
  const action           = t.arg('action');
  const autoCopyRaw      = t.arg('autoCopy');
  const autoCopy         = autoCopyRaw === 'true';
  const showValueInPopup = t.arg('showValueInPopup') === 'true';

  const valueView  = document.getElementById('value-view');
  const statusView = document.getElementById('status-view');

  // Show arg values directly on screen for debugging
  const debugDisplay = document.getElementById('debug-display');
  debugDisplay.textContent = `action="${action}" autoCopyRaw="${autoCopyRaw}" autoCopy=${autoCopy} showValueInPopup=${showValueInPopup}`;
  debugDisplay.style.display = 'block';
  await t.sizeTo('#popup-root');

  try {
    const value = await getTrelloValue(action);

    const valueLabel = document.getElementById('value-label');
    const valueInput = document.getElementById('value-input');
    const copyBtn    = document.getElementById('copy-btn');
    const hint       = document.getElementById('copy-status');

    valueLabel.textContent = LABELS[action] || action;
    valueInput.value = value;
    hint.textContent = 'Value ready — click Copy or press ⌘C';

    valueView.style.display = 'block';
    await t.sizeTo('#popup-root');

    valueInput.focus();
    valueInput.select();

    const doCopy = () => {
      valueInput.select();
      const success = document.execCommand('copy');
      if (success) {
        hint.textContent = 'Copied ✓';
        hint.dataset.state = 'success';
        copyBtn.textContent = 'Copied ✓';
        copyBtn.disabled = true;
        t.sizeTo('#popup-root');
        t.alert({ message: `${LABELS[action]} copied to clipboard` });
        window.setTimeout(() => t.closePopup(), 1200);
      } else {
        hint.textContent = 'Press ⌘C to copy';
        hint.dataset.state = '';
        t.sizeTo('#popup-root');
      }
    };

    copyBtn.addEventListener('click', doCopy);

    if (autoCopy) {
      requestAnimationFrame(() => {
        copyBtn.focus();
        copyBtn.click();
      });
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
