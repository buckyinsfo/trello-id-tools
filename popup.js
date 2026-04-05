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

const copyTextToClipboard = (text) => {
  const str = String(text);

  // Use textarea + execCommand — reliable in Trello's iframe context
  // where navigator.clipboard requires document focus that the iframe doesn't have.
  const textarea = document.createElement('textarea');
  textarea.value = str;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const success = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!success) {
    throw new Error('Unable to copy to clipboard. Please try again.');
  }

  debugLog('Copied via execCommand', str.substring(0, 40));
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

  copyTextToClipboard(valueToCopy);
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
