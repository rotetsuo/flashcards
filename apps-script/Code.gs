/**
 * Flashcards — backend (Google Apps Script)
 *
 * A planilha É o banco de dados: cada vez que a página abre (ou você toca em
 * "Atualizar"), os termos são lidos ao vivo da planilha.
 * Suas configurações (quais palavras entram) e o progresso ficam salvos nas
 * "User Properties" do Apps Script, então valem no celular e no computador.
 */

// ===== CONFIGURAÇÃO =====
const SPREADSHEET_ID = '1bpLPIZPWn8xzdHzjZiCd5f2jXpvW8dh9mTezrvT8E1w';
const SHEET_NAME = 'Glossario';   // aba com os termos
// As colunas são achadas pelo NOME no cabeçalho (pode mudar a ordem ou inserir colunas).
// Basta o cabeçalho começar com estes textos (sem diferenciar maiúsculas/acentos).
const HEADERS = {
  id: 'id',
  term: 'termo',            // obrigatório
  category: 'categoria',
  meaning: 'definicao',     // "Definição em uma frase"
  where: 'onde aparece',    // "Onde aparece no projeto"
  example: 'exemplo'        // "Exemplo( se necessario)"
};
// ========================

const DEFAULT_SETTINGS = {
  mode: 'range',   // 'range' = intervalo de posições | 'custom' = palavras escolhidas
  from: 1,
  to: 50,
  custom: [],      // termos escolhidos (pelo texto do termo)
  reverse: false,  // true = significado na frente
  includeKnown: true,
  skipEmpty: true  // pular termos que ainda não têm definição
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Flashcards')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

// ---------- chamadas do frontend ----------

function loadData() {
  return {
    terms: getTerms_(),
    settings: getSettings_(),
    known: getBig_('known') || [],
    updatedAt: new Date().toISOString()
  };
}

function saveSettings(s) {
  const clean = {
    mode: s.mode === 'custom' ? 'custom' : 'range',
    from: Math.max(1, parseInt(s.from, 10) || 1),
    to: Math.max(1, parseInt(s.to, 10) || 1),
    custom: Array.isArray(s.custom) ? s.custom.map(String) : [],
    reverse: !!s.reverse,
    includeKnown: s.includeKnown !== false,
    skipEmpty: s.skipEmpty !== false
  };
  if (clean.to < clean.from) { const t = clean.to; clean.to = clean.from; clean.from = t; }
  putBig_('settings', clean);
  return clean;
}

function setKnown(term, isKnown) {
  const known = new Set(getBig_('known') || []);
  if (isKnown) known.add(String(term)); else known.delete(String(term));
  const arr = Array.from(known);
  putBig_('known', arr);
  return arr;
}

function resetKnown() {
  putBig_('known', []);
  return [];
}

// ---------- internos ----------

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return (SHEET_NAME && ss.getSheetByName(SHEET_NAME)) || ss.getSheets()[0];
}

function norm_(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function getTerms_() {
  const values = getSheet_().getDataRange().getDisplayValues();

  // acha a linha de cabeçalho: a primeira que tem uma célula começando com "termo"
  let headerRow = -1, cols = {};
  for (let r = 0; r < Math.min(values.length, 20) && headerRow < 0; r++) {
    const row = values[r].map(norm_);
    if (row.some(function (c) { return c.indexOf(HEADERS.term) === 0; })) {
      headerRow = r;
      Object.keys(HEADERS).forEach(function (k) {
        cols[k] = row.findIndex(function (c) { return c.indexOf(HEADERS[k]) === 0; });
      });
    }
  }
  if (headerRow < 0) throw new Error('Não achei a coluna "Termo" no cabeçalho da aba ' + getSheet_().getName());

  const get = function (r, k) { return cols[k] >= 0 ? String(r[cols[k]] || '').trim() : ''; };
  const out = [];
  for (let i = headerRow + 1; i < values.length; i++) {
    const r = values[i];
    const term = get(r, 'term');
    if (!term) continue;
    out.push({
      n: out.length + 1,
      id: get(r, 'id') || String(out.length + 1),
      term: term,
      category: get(r, 'category'),
      meaning: get(r, 'meaning'),
      where: get(r, 'where'),
      example: get(r, 'example')
    });
  }
  return out;
}

function getSettings_() {
  return Object.assign({}, DEFAULT_SETTINGS, getBig_('settings') || {});
}

// User Properties têm limite de ~9KB por chave; estes helpers dividem em pedaços.
const CHUNK = 8000;

function putBig_(key, obj) {
  const props = PropertiesService.getUserProperties();
  const json = JSON.stringify(obj);
  const oldCount = parseInt(props.getProperty(key + '__n') || '0', 10);
  const parts = [];
  for (let i = 0; i < json.length; i += CHUNK) parts.push(json.slice(i, i + CHUNK));
  const batch = {};
  batch[key + '__n'] = String(parts.length);
  parts.forEach(function (p, i) { batch[key + '__' + i] = p; });
  props.setProperties(batch);
  for (let i = parts.length; i < oldCount; i++) props.deleteProperty(key + '__' + i);
}

function getBig_(key) {
  const props = PropertiesService.getUserProperties();
  const n = parseInt(props.getProperty(key + '__n') || '0', 10);
  if (!n) return null;
  let json = '';
  for (let i = 0; i < n; i++) json += props.getProperty(key + '__' + i) || '';
  try { return JSON.parse(json); } catch (e) { return null; }
}
