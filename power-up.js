const DEBUG = false;
const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = Object.freeze({
  showCardId:   true,
  showListId:   true,
  showBoardId:  true,
  showCardUrl:  true,
  showMetadata: true,
});

const BUTTON_DEFINITIONS = Object.freeze([
  { action: 'cardId',   text: 'Copy Card ID',  label: 'Card ID',       settingKey: 'showCardId'   },
  { action: 'listId',   text: 'Copy List ID',  label: 'List ID',       settingKey: 'showListId'   },
  { action: 'boardId',  text: 'Copy Board ID', label: 'Board ID',      settingKey: 'showBoardId'  },
  { action: 'cardUrl',  text: 'Copy Card URL', label: 'Card URL',      settingKey: 'showCardUrl'  },
  { action: 'metadata', text: 'Copy Metadata', label: 'Metadata JSON', settingKey: 'showMetadata' },
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

const handleButtonClick = (action, label) => async (t) => {
  const value = await resolveValue(t, action);
  return t.popup({
    title: 'Trello ID Tools',
    url: './popup.html',
    args: { label, value },
    height: 120,
  });
};

const buildCardButtons = async (t) => {
  const settings = await loadSettings(t);
  debugLog('Settings loaded', settings);
  return BUTTON_DEFINITIONS
    .filter(({ settingKey }) => settings[settingKey])
    .map(({ action, text, label }) => ({
      icon: ICON_URL,
      text,
      condition: 'always',
      callback: handleButtonClick(action, label),
    }));
};

const openSettings = (t) => t.popup({
  title: 'Trello ID Tools Settings',
  url: './settings.html',
  height: 310,
});

window.TrelloPowerUp.initialize({
  'card-buttons': buildCardButtons,
  'show-settings': openSettings,
});
