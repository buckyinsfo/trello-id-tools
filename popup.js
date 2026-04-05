const DEBUG = false;
const CLOSE_DELAY_MS = 900;

const ACTIONS = Object.freeze({
  cardId: {
    confirmation: 'Copied Card ID',
    resolveValue: ({ card }) => card.id,
  },
  listId: {
    confirmation: 'Copied List ID',
    resolveValue: ({ list }) => list.id,
  },
  boardId: {
    confirmation: 'Copied Board ID',
    resolveValue: ({ board }) => board.id,
  },
  cardUrl: {
    confirmation: 'Copied Card URL',
    resolveValue: ({ card }) => card.url,
  },
  metadata: {
    confirmation: 'Copied Metadata',
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

const debugLog = (...args) => {
  if (DEBUG) {
    console.debug('[trello-id-tools]', ...args);
  }
};

const setStatus = (message, state = 'success') => {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
};

const closePopupSoon = () => {
  window.setTimeout(() => {
    t.closePopup();
  }, CLOSE_DELAY_MS);
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

const copyTextToClipboard = async (text) => {
  const str = String(text);

  // Focus the window first so clipboard API has a user-activation context
  window.focus();

  // Try modern Clipboard API after focusing
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(str);
      debugLog('Copied via Clipboard API');
      return;
    } catch (e) {
      debugLog('Clipboard API failed', e.message);
    }
  }

  // Fallback: input element trick (more reliable than textarea in iframes)
  const input = document.createElement('input');
  input.setAttribute('readonly', '');
  input.value = str;
  input.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent;';
  document.body.appendChild(input);
  input.focus();
  input.select();
  input.setSelectionRange(0, input.value.length);

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (e) {
    debugLog('execCommand failed', e.message);
  }

  document.body.removeChild(input);

  if (!success) {
    throw new Error('Clipboard unavailable. Please copy manually.');
  }

  debugLog('Copied via execCommand fallback');
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

  await copyTextToClipboard(valueToCopy);
  setStatus(action.confirmation, 'success');
  closePopupSoon();
};

const initializePopup = async () => {
  try {
    await runCopyAction();
  } catch (error) {
    debugLog('Copy action failed', error);
    setStatus(error.message || 'Unable to copy this value.', 'error');
  } finally {
    t.sizeTo('#popup-root');
  }
};

initializePopup();
