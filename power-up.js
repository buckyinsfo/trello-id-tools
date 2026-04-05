const DEBUG = false;
const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = Object.freeze({
  showCardId:       true,
  showListId:       true,
  showBoardId:      true,
  showCardUrl:      true,
  showMetadata:     true,
  showValueInPopup: true,
  autoCopy:         false,
});

const BUTTON_DEFINITIONS = Object.freeze([
  { action: 'cardId',   text: 'Copy Card ID',   settingKey: 'showCardId'   },
  { action: 'listId',   text: 'Copy List ID',   settingKey: 'showListId'   },
  { action: 'boardId',  text: 'Copy Board ID',  settingKey: 'showBoardId'  },
  { action: 'cardUrl',  text: 'Copy Card URL',  settingKey: 'showCardUrl'  },
  { action: 'metadata', text: 'Copy Metadata',  settingKey: 'showMetadata' },
]);

const LABELS = Object.freeze({
  cardId:   'Card ID',
  listId:   'List ID',
  boardId:  'Board ID',
  cardUrl:  'Card URL',
  metadata: 'Metadata JSON',
});

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

// Auto-copy: fetch value, copy silently via a hidden input in index.html,
// show a Trello toast. No popup opens at all.
const autoCopyValue = async (t, action) => {
  try {
    const value = await resolveValue(t, action);

    // Write value into the hidden input on the connector page and copy from there
    const hiddenInput = document.getElementById('auto-copy-input');
    hiddenInput.value = value;
    hiddenInput.select();
    document.execCommand('copy');
    hiddenInput.value = '';

    debugLog('Auto-copied', action, String(value).substring(0, 40));
    t.alert({ message: `${LABELS[action]} copied to clipboard` });
  } catch (err) {
    debugLog('Auto-copy failed', err.message);
    t.alert({ message: `Failed to copy ${LABELS[action]}` });
  }
};

// Manual mode: open popup to display value, user clicks Copy button.
const openCopyPopup = (t, action, showValueInPopup) => {
  return t.popup({
    title: 'Trello ID Tools',
    url: './popup.html',
    args: { action, showValueInPopup },
    height: 120,
  });
};

const buildCardButtons = async (t) => {
  const settings = await loadSettings(t);
  debugLog('Settings loaded', settings);

  return BUTTON_DEFINITIONS
    .filter(({ settingKey }) => settings[settingKey])
    .map(({ action, text }) => ({
      icon: ICON_URL,
      text,
      condition: 'always',
      callback: settings.autoCopy
        ? (callbackT) => autoCopyValue(callbackT, action)
        : (callbackT) => openCopyPopup(callbackT, action, settings.showValueInPopup),
    }));
};

const openSettings = (t) => t.popup({
  title: 'Trello ID Tools Settings',
  url: './settings.html',
  height: 400,
});

window.TrelloPowerUp.initialize({
  'card-buttons': buildCardButtons,
  'show-settings': openSettings,
});
