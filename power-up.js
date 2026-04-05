const DEBUG = false;
const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = Object.freeze({
  showCardId: true,
  showListId: true,
  showBoardId: true,
  showCardUrl: true,
  showMetadata: true,
});

const BUTTON_DEFINITIONS = Object.freeze([
  { action: 'cardId',   text: 'Copy Card ID',   settingKey: 'showCardId'   },
  { action: 'listId',   text: 'Copy List ID',   settingKey: 'showListId'   },
  { action: 'boardId',  text: 'Copy Board ID',  settingKey: 'showBoardId'  },
  { action: 'cardUrl',  text: 'Copy Card URL',  settingKey: 'showCardUrl'  },
  { action: 'metadata', text: 'Copy Metadata',  settingKey: 'showMetadata' },
]);

const ICON_URL = './icons/icon.png';

const debugLog = (...args) => {
  if (DEBUG) console.debug('[trello-id-tools]', ...args);
};

const normalizeSettings = (settings = {}) => ({
  ...DEFAULT_SETTINGS,
  ...(settings && typeof settings === 'object' ? settings : {}),
});

const loadSettings = async (t) => {
  try {
    const settings = await t.get('board', 'shared', SETTINGS_KEY, DEFAULT_SETTINGS);
    return normalizeSettings(settings);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

const resolveValue = async (t, action) => {
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
      cardId: card.id,
      listId: list.id,
      boardId: board.id,
      cardUrl: card.url,
      shortLink: card.shortLink,
      cardNumber: card.idShort,
    }, null, 2);
    default: throw new Error(`Unknown action: ${action}`);
  }
};

const CONFIRMATIONS = {
  cardId:   'Copied Card ID ✓',
  listId:   'Copied List ID ✓',
  boardId:  'Copied Board ID ✓',
  cardUrl:  'Copied Card URL ✓',
  metadata: 'Copied Metadata ✓',
};

// Copy to clipboard directly in the card button callback context —
// this runs in Trello's native UI context which has clipboard access,
// unlike the sandboxed popup iframe which blocks clipboard writes.
const handleCopyAction = (action) => async (t) => {
  try {
    const value = await resolveValue(t, action);
    await navigator.clipboard.writeText(String(value));
    debugLog('Copied', action, String(value).substring(0, 40));

    // Show a brief confirmation popup
    return t.popup({
      title: CONFIRMATIONS[action],
      url: './popup.html',
      args: { message: CONFIRMATIONS[action], state: 'success' },
      height: 60,
    });
  } catch (err) {
    debugLog('Copy failed', err.message);
    return t.popup({
      title: 'Copy to Clipboard',
      url: './popup.html',
      args: { message: err.message || 'Unable to copy.', state: 'error' },
      height: 60,
    });
  }
};

const openSettings = (t) => t.popup({
  title: 'Trello ID Tools Settings',
  url: './settings.html',
  height: 340,
});

const buildCardButtons = async (t) => {
  const settings = await loadSettings(t);
  return BUTTON_DEFINITIONS
    .filter(({ settingKey }) => settings[settingKey])
    .map(({ action, text }) => ({
      icon: ICON_URL,
      text,
      condition: 'always',
      callback: handleCopyAction(action),
    }));
};

window.TrelloPowerUp.initialize({
  'card-buttons': buildCardButtons,
  'show-settings': openSettings,
});
