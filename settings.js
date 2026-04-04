const DEBUG = false;
const SETTINGS_KEY = 'settings';
const SAVE_CLOSE_DELAY_MS = 700;
const DEFAULT_SETTINGS = Object.freeze({
  showCardId: true,
  showListId: true,
  showBoardId: true,
  showCardUrl: true,
  showMetadata: true,
});

const SETTING_FIELDS = Object.freeze([
  'showCardId',
  'showListId',
  'showBoardId',
  'showCardUrl',
  'showMetadata',
]);

const t = window.TrelloPowerUp.iframe();
const settingsForm = document.getElementById('settings-form');
const settingsStatus = document.getElementById('settings-status');

const debugLog = (...args) => {
  if (DEBUG) {
    console.debug('[trello-id-tools]', ...args);
  }
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
    const storedSettings = await t.get('board', 'shared', SETTINGS_KEY, DEFAULT_SETTINGS);
    const settings = normalizeSettings(storedSettings);
    debugLog('Loaded settings', settings, t.getContext());
    return settings;
  } catch (error) {
    debugLog('Settings load failed, using defaults', error);
    return { ...DEFAULT_SETTINGS };
  }
};

const saveSettings = async (settings) => {
  debugLog('Saving settings', settings);
  await t.set('board', 'shared', SETTINGS_KEY, settings);
};

const renderSettings = (settings) => {
  SETTING_FIELDS.forEach((fieldName) => {
    const checkbox = settingsForm.elements[fieldName];
    if (checkbox) {
      const { [fieldName]: enabled } = settings;
      checkbox.checked = Boolean(enabled);
    }
  });
};

const collectSettingsFromForm = () =>
  SETTING_FIELDS.reduce((settings, fieldName) => {
    settings[fieldName] = Boolean(settingsForm.elements[fieldName]?.checked);
    return settings;
  }, {});

const scheduleClose = () => {
  window.setTimeout(() => {
    t.closePopup();
  }, SAVE_CLOSE_DELAY_MS);
};

const initializeSettings = async () => {
  const settings = await loadSettings();
  renderSettings(settings);
  await t.sizeTo('#settings-root');
};

settingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const settings = collectSettingsFromForm();
    await saveSettings(settings);
    setStatus('Settings saved', 'success');
    scheduleClose();
  } catch (error) {
    debugLog('Settings save failed', error);
    setStatus('Unable to save settings. Please try again.', 'error');
  } finally {
    t.sizeTo('#settings-root');
  }
});

initializeSettings();
