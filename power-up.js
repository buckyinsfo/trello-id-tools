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

const openCopyPopup = (t, action, showValueInPopup, autoCopy) => {
  return t.popup({
    title: 'Trello ID Tools',
    url: './popup.html',
    args: {
      action,
      showValueInPopup: showValueInPopup ? 'true' : 'false',
      autoCopy: autoCopy ? 'true' : 'false',
    },
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
      callback: (callbackT) => openCopyPopup(
        callbackT,
        action,
        settings.showValueInPopup,
        settings.autoCopy
      ),
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
