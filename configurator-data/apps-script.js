/**
 * XPENG BG Configurator — Google Apps Script
 *
 * Deploy as Web App:
 * 1. Open this Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this code into Code.gs
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the URL — that's your CONFIGURATOR_API endpoint
 *
 * Usage:
 *   GET {url}?model=g9        → returns G9 configurator data
 *   GET {url}?model=g6        → returns G6 data
 *   GET {url}?model=p7-plus   → returns P7+ data
 *   GET {url}?refresh=true    → bust cache
 */

function doGet(e) {
  var modelSlug = e.parameter.model;
  var refresh = e.parameter.refresh === 'true';

  if (!modelSlug) {
    return jsonResponse({ error: 'Missing ?model= parameter' });
  }

  // Check cache first (6 hours)
  var cache = CacheService.getScriptCache();
  var cacheKey = 'configurator_' + modelSlug;

  if (!refresh) {
    var cached = cache.get(cacheKey);
    if (cached) {
      return jsonResponse(JSON.parse(cached));
    }
  }

  // Read from sheets
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = {
    model: getFirstRowBySlug(ss, 'Models', modelSlug),
    variants: getRowsBySlug(ss, 'Variants', modelSlug),
    colors: getRowsBySlug(ss, 'Colors', modelSlug),
    interiors: getRowsBySlug(ss, 'Interiors', modelSlug),
    wheels: getRowsBySlug(ss, 'Wheels', modelSlug),
    accessories: getRowsBySlug(ss, 'Accessories', modelSlug),
  };

  if (!data.model) {
    return jsonResponse({ error: 'Model not found: ' + modelSlug });
  }

  // Cache for 6 hours (21600 seconds)
  var jsonStr = JSON.stringify(data);
  cache.put(cacheKey, jsonStr, 21600);

  return jsonResponse(data);
}

/**
 * Get all rows matching model_slug from a sheet tab
 */
function getRowsBySlug(ss, sheetName, modelSlug) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var slugCol = headers.indexOf('model_slug');
  if (slugCol === -1) return [];

  var results = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][slugCol] === modelSlug) {
      results.push(rowToObject(headers, data[i]));
    }
  }

  return results;
}

/**
 * Get the first row matching model_slug (for Models tab — single result)
 */
function getFirstRowBySlug(ss, sheetName, modelSlug) {
  var rows = getRowsBySlug(ss, sheetName, modelSlug);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Convert a row array to an object using header names as keys
 */
function rowToObject(headers, row) {
  var obj = {};
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = row[i];

    if (key === '') continue;

    // Convert types
    if (val === 'TRUE' || val === true) val = true;
    else if (val === 'FALSE' || val === false) val = false;
    else if (typeof val === 'string' && val !== '' && !isNaN(val) && key !== 'color_hex' && key !== 'acceleration') {
      val = Number(val);
    }

    obj[key] = val;
  }
  return obj;
}

/**
 * Return a JSON response with CORS headers
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
