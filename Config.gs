/**
 * ============================================================
 * TRUE MEDS - RTO & REATTEMPT PORTAL
 * File      : Config.gs
 * Purpose   : Configuration Manager
 * Version   : 2.0.0
 * ============================================================
 */

const Config = (() => {

  const CONFIG_SHEET = "Configuration";
  const LINK_SHEET   = "G-sheet/Drive Links";

  let settingsCache = null;
  let linksCache = null;
  let locationsCache = null;

  /**
   * Load Configuration Sheet
   */
  function loadSettings() {

    if (settingsCache) return settingsCache;

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(CONFIG_SHEET);

    if (!sheet)
      throw new Error("Configuration sheet not found.");

    const values = sheet.getDataRange().getValues();

    settingsCache = {};

    for (let i = 1; i < values.length; i++) {

      const key = String(values[i][0]).trim();

      if (!key) continue;

      settingsCache[key] = values[i][1];

    }

    return settingsCache;

  }

  /**
   * Load Sheet / Drive Links
   */
  function loadLinks() {

    if (linksCache) return linksCache;

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(LINK_SHEET);

    if (!sheet)
      throw new Error("G-sheet/Drive Links sheet not found.");

    const values = sheet.getDataRange().getValues();

    linksCache = values.slice(1);

    return linksCache;

  }

  /**
   * Load the location mapping stored in Configuration!H:J.
   * Row 1 contains the headers: Zone, Warehouse, LM Hub.
   */
  function loadLocations() {

    if (locationsCache) return locationsCache;

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(CONFIG_SHEET);

    if (!sheet)
      throw new Error("Configuration sheet not found.");

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      locationsCache = [];
      return locationsCache;
    }

    const values = sheet
      .getRange(2, 8, lastRow - 1, 3)
      .getDisplayValues();

    const seen = {};

    locationsCache = values.reduce((rows, value) => {
      const location = {
        zone: String(value[0] || "").trim(),
        warehouse: String(value[1] || "").trim(),
        lmHub: String(value[2] || "").trim()
      };

      if (!location.zone && !location.warehouse && !location.lmHub)
        return rows;

      const key = [location.zone, location.warehouse, location.lmHub]
        .join("|")
        .toLowerCase();

      if (!seen[key]) {
        seen[key] = true;
        rows.push(location);
      }

      return rows;
    }, []);

    return locationsCache;

  }
   
   function configText(value) {

    return value === null || value === undefined
      ? ""
      : String(value).trim();

  }

  function findConfigValueRange(key) {

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(CONFIG_SHEET);

    if (!sheet)
      throw new Error("Configuration sheet not found.");

    const lastRow = sheet.getLastRow();

    if (lastRow < 2)
      return null;

    const wanted = configText(key).toUpperCase();
    const keys = sheet
      .getRange(2, 1, lastRow - 1, 1)
      .getDisplayValues();

    for (let i = 0; i < keys.length; i++) {

      if (configText(keys[i][0]).toUpperCase() === wanted)
        return sheet.getRange(i + 2, 2);

    }

    return null;

  }

  function resolveConfigImageUrl(key) {

    const range = findConfigValueRange(key);

    if (!range)
      return "";

    const value = range.getValue();

    // Google Sheets Image-in-cell objects expose a temporary browser URL.
    if (value && typeof value.getContentUrl === "function")
      return value.getContentUrl();

    // Safe fallback while B24 still contains a normal URL.
    return configText(value);

  }

  /**
   * Public API
   */
  return {

    /**
     * Get Setting Value
     */
    get(key) {

      const settingName = configText(key).toUpperCase();

      if (settingName === "APP_LOGO_URL")
        return resolveConfigImageUrl(settingName);

      const settings = loadSettings();

      return settings[settingName] !== undefined
        ? settings[settingName]
        : settings[key];

    },

    /**
     * Get All Settings
     */
    all() {

      return loadSettings();

    },

    /**
     * Get All Link Rows
     */
    links() {

      return loadLinks();

    },

    /**
     * Get Configuration!H:J location rows.
     */
    locations() {

      return loadLocations();

    },

    /**
     * Reload Configuration
     */
    refresh() {

      settingsCache = null;
      linksCache = null;
      locationsCache = null;

    }

  };

})();
