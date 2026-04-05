const DEBUG = false;
const SETTINGS_KEY = 'settings';
const SAVE_CLOSE_DELAY_MS = 700;
const DEFAULT_SETTINGS = Object.freeze({
  showCardId:       true,
  showListId:       true,
  showBoardId:      true,
  showCardUrl:      true,
  showMetadata:     true,
  showValueInPopup: true,
  autoCopy:         false,
});

const SETTING_FIELDS = Object.freeze([
  'showCardId',
  'showListId',
  'showBoardId',
  'showCardUrl',
  'showMetadata',
  'showValueInPopup',
  'autoCopy',
]);

const t = window.TrelloPowerUp.iframe();
const settingsForm   = document.getElementById('settings-form');
const settingsStatus = document.getElementById('settings-status');

const debugLog = (...args) => {
  if (DEBUG) console.debug('[trello-id-tools]', ...args);
};

const normalizeSettings = (settings = {}) => ({
  ...DEFAULT_SETTINGS,
  ...(settings && typeof settings === 'object' ? settings : {}),
});

const setStatus = (message, state = 'success') => {
  settingsStatus.textContent = message;
  settingsStatus.dataset.state = state;
};

const loadSettings = async () => {
  try {
    const stored = await t.get('board', 'shared', SETTINGS_KEY, DEFAULT_SETTINGS);
    return normalizeSettings(stored);
  } catch (err) {
    debugLog('Settings load failed, using defaults', err);
    return { ...DEFAULT_SETTINGS };
  }
};

const saveSettings = async (settings) => {
  debugLog('Saving settings', settings);
  await t.set('board', 'shared', SETTINGS_KEY, settings);
};

const renderSettings = (settings) => {
  SETTING_FIELDS.forEach((field) => {
    const checkbox = settingsForm.elements[field];
    if (checkbox) checkbox.checked = Boolean(settings[field]);
  });
};

const collectSettings = () =>
  SETTING_FIELDS.reduce((acc, field) => {
    acc[field] = Boolean(settingsForm.elements[field]?.checked);
    return acc;
  }, {});

const initializeSettings = async () => {
  const settings = await loadSettings();
  renderSettings(settings);
  await t.sizeTo('#settings-root');
};

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await saveSettings(collectSettings());
    setStatus('Settings saved', 'success');
    window.setTimeout(() => t.closePopup(), SAVE_CLOSE_DELAY_MS);
  } catch (err) {
    debugLog('Save failed', err);
    setStatus('Unable to save. Please try again.', 'error');
  } finally {
    t.sizeTo('#settings-root');
  }
});

initializeSettings();
