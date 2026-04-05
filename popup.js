const DEBUG = false;
const CLOSE_DELAY_MS = 1500;

const ACTIONS = Object.freeze({
  cardId: {
    confirmation: 'Copied Card ID ✓',
    fallback: 'Card ID',
    resolveValue: ({ card }) => card.id,
  },
  listId: {
    confirmation: 'Copied List ID ✓',
    fallback: 'List ID',
    resolveValue: ({ list }) => list.id,
  },
  boardId: {
    confirmation: 'Copied Board ID ✓',
    fallback: 'Board ID',
    resolveValue: ({ board }) => board.id,
  },
  cardUrl: {
    confirmation: 'Copied Card URL ✓',
    fallback: 'Card URL',
    resolveValue: ({ card }) => card.url,
  },
  metadata: {
    confirmation: 'Copied Metadata ✓',
    fallback: 'Metadata',
    resolveValue: ({ card, list, board }) =>
      JSON.stringify(
        {
          cardId: card.id,
          listId: list.id,
          boardId: board.id,
          cardUrl: card.url,
          shortLink: card.shortLink,
          cardNumber: card.idShort,
        },
        null,
        2,
      ),
  },
});

const t = window.TrelloPowerUp.iframe();
const statusMessage = document.getElementById('status-message');
const valueDisplay = document.getElementById('value-display');

const debugLog = (...args) => {
  if (DEBUG) {
    console.debug('[trello-id-tools]', ...args);
  }
};

const setStatus = (message, state = 'success') => {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
};

const showValue = (value) => {
  valueDisplay.value = value;
  valueDisplay.style.display = 'block';
  valueDisplay.focus();
  valueDisplay.select();
};

const hideValue = () => {
  valueDisplay.style.display = 'none';
};

const closePopupSoon = (delay = CLOSE_DELAY_MS) => {
  window.setTimeout(() => {
    t.closePopup();
  }, delay);
};

const getTrelloContextData = async () => {
  const [card, list, board] = await Promise.all([
    t.card('id', 'url', 'shortLink', 'idShort'),
    t.list('id'),
    t.board('id'),
  ]);

  const contextData = { card, list, board };
  debugLog('Resolved Trello context data', contextData, t.getContext());
  return contextData;
};

const attemptClipboardCopy = async (text) => {
  const str = String(text);

  // Attempt 1: Modern Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(str);
      debugLog('Copied via Clipboard API');
      return true;
    } catch (e) {
      debugLog('Clipboard API failed', e.message);
    }
  }

  // Attempt 2: execCommand on the visible input element (already selected)
  try {
    const success = document.execCommand('copy');
    if (success) {
      debugLog('Copied via execCommand on input');
      return true;
    }
  } catch (e) {
    debugLog('execCommand failed', e.message);
  }

  return false;
};

const runCopyAction = async () => {
  const actionKey = t.arg('action');
  const action = ACTIONS[actionKey];
  debugLog('Running copy action', actionKey);

  if (!action) {
    throw new Error(`Unknown copy action requested: ${actionKey}`);
  }

  const contextData = await getTrelloContextData();
  const valueToCopy = action.resolveValue(contextData);

  if (valueToCopy === undefined || valueToCopy === null || valueToCopy === '') {
    throw new Error('Requested Trello value is not available.');
  }

  // Always show the value in the input so user can manually copy if needed
  showValue(valueToCopy);

  // Try clipboard in background
  const copied = await attemptClipboardCopy(valueToCopy);

  if (copied) {
    hideValue();
    setStatus(action.confirmation, 'success');
    closePopupSoon(CLOSE_DELAY_MS);
  } else {
    // Clipboard blocked — show the value selected so user can hit Cmd+C
    setStatus(`Select all & copy (⌘C)`, 'fallback');
  }
};

const initializePopup = async () => {
  try {
    await runCopyAction();
  } catch (error) {
    debugLog('Copy action failed', error);
    hideValue();
    setStatus(error.message || 'Unable to copy this value.', 'error');
  } finally {
    t.sizeTo('#popup-root');
  }
};

initializePopup();
