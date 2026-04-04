const DEBUG = false;
const ICON_URL = './icons/icon.png';
const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = Object.freeze({
  showCardId: true,
  showListId: true,
  showBoardId: true,
  showCardUrl: true,
  showMetadata: true,
});

const BUTTON_DEFINITIONS = Object.freeze([
  {
    action: 'cardId',
    text: 'Copy Card ID',
    settingKey: 'showCardId',
  },
  {
    action: 'listId',
    text: 'Copy List ID',
    settingKey: 'showListId',
  },
  {
    action: 'boardId',
    text: 'Copy Board ID',
    settingKey: 'showBoardId',
  },
  {
    action: 'cardUrl',
    text: 'Copy Card URL',
    settingKey: 'showCardUrl',
  },
  {
    action: 'metadata',
    text: 'Copy Metadata',
    settingKey: 'showMetadata',
  },
]);

const debugLog = (...args) => {
  if (DEBUG) {
    console.debug('[trello-id-tools]', ...args);
  }
};

const normalizeSettings = (settings = {}) => ({
  ...DEFAULT_SETTINGS,
  ...(settings && typeof settings === 'object' ? settings : {}),
});

const loadSettings = async (t) => {
  try {
    const settings = await t.get('board', 'shared', SETTINGS_KEY, DEFAULT_SETTINGS);
    const normalizedSettings = normalizeSettings(settings);
    debugLog('Loaded settings', normalizedSettings);
    return normalizedSettings;
  } catch (error) {
    debugLog('Falling back to default settings', error);
    return { ...DEFAULT_SETTINGS };
  }
};

const openCopyPopup = (t, action) => {
  debugLog('Opening copy popup', action, t.getContext());

  return t.popup({
    title: 'Copy to Clipboard',
    url: './popup.html',
    args: { action },
    height: 120,
  });
};

const buildCardButtons = async (t) => {
  const settings = await loadSettings(t);
  const context = t.getContext();
  debugLog('Card button context', context);

  return BUTTON_DEFINITIONS
    .filter(({ settingKey }) => settings[settingKey])
    .map(({ action, text }) => ({
      icon: ICON_URL,
      text,
      condition: 'always',
      callback: (popupContext) => openCopyPopup(popupContext, action),
    }));
};

const openSettings = (t) => {
  debugLog('Opening settings dialog', t.getContext());

  return t.popup({
    title: 'Trello ID Tools Settings',
    url: './settings.html',
    height: 340,
  });
};

window.TrelloPowerUp.initialize({
  'card-buttons': buildCardButtons,
  'show-settings': openSettings,
});
