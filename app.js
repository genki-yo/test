const CONFIG = {
  googleSheets: {
    spreadsheetId: 'YOUR_SPREADSHEET_ID'
  },
  datasets: {
    municipalities: {
      type: 'googleSheets',
      sheetName: 'municipalities',
      fallbackPath: 'data/municipalities.csv'
    },
    areas: {
      type: 'googleSheets',
      sheetName: 'areas',
      fallbackPath: 'data/areas.csv'
    },
    categories: {
      type: 'googleSheets',
      sheetName: 'categories',
      fallbackPath: 'data/categories.csv'
    },
    schedule: {
      type: 'googleSheets',
      sheetName: 'collection_schedule',
      fallbackPath: 'data/collection_schedule.csv'
    }
  },
  upcomingLimit: 10
};

const state = {
  municipalities: [],
  areas: [],
  categories: new Map(),
  schedule: [],
  selectedMunicipality: null,
  selectedArea: null,
  activeCategories: new Set(),
  searchTerm: ''
};

const municipalitySelect = document.getElementById('municipalitySelect');
const areaSelect = document.getElementById('areaSelect');
const categoryFiltersContainer = document.getElementById('categoryFilters');
const searchInput = document.getElementById('searchInput');
const upcomingList = document.getElementById('upcomingList');
const noResultsMessage = document.getElementById('noResultsMessage');
const scheduleTableBody = document.querySelector('#scheduleTable tbody');
const legendContainer = document.getElementById('legend');
const icsButton = document.getElementById('icsButton');
const shareButton = document.getElementById('shareButton');
const cardTemplate = document.getElementById('cardTemplate');

async function init() {
  try {
    const [municipalities, areas, categories, schedule] = await Promise.all([
      fetchDataset(CONFIG.datasets.municipalities),
      fetchDataset(CONFIG.datasets.areas),
      fetchDataset(CONFIG.datasets.categories),
      fetchDataset(CONFIG.datasets.schedule)
    ]);

    state.municipalities = municipalities;
    state.areas = areas;
    state.categories = new Map(categories.map((category) => [category.category_id, category]));
    state.schedule = schedule
      .map((item) => ({
        ...item,
        municipality_id: item.municipality_id?.trim(),
        area_id: item.area_id?.trim() ?? '',
        date: item.date?.trim(),
        category_id: item.category_id?.trim(),
        note: item.note?.trim()
      }))
      .filter((item) => item.municipality_id && item.date && item.category_id);

    populateMunicipalitySelect();
    populateCategoryFilters();
    populateLegend();

    attachEventListeners();
    restoreStateFromQuery();
    refreshUI();
  } catch (error) {
    console.error('Failed to initialise the application', error);
    showError(error);
  }
}

async function fetchDataset(options) {
  if (!options || options.type !== 'googleSheets') {
    return fetchCsv(options?.fallbackPath ?? '');
  }

  const spreadsheetId = options.spreadsheetId ?? CONFIG.googleSheets?.spreadsheetId;

  if (!spreadsheetId || spreadsheetId === 'YOUR_SPREADSHEET_ID') {
    console.warn('Google スプレッドシートIDが設定されていません。ローカルCSVを利用します。');
    return fetchCsv(options.fallbackPath ?? '');
  }

  const url = new URL(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`);
  url.searchParams.set('sheet', options.sheetName ?? '');
  url.searchParams.set('tqx', 'out:csv');

  try {
    return await fetchCsv(url.toString());
  } catch (error) {
    console.warn(`Google スプレッドシートからの取得に失敗しました (${options.sheetName}). ローカルCSVにフォールバックします。`, error);
    return fetchCsv(options.fallbackPath ?? '');
  }
}

async function fetchCsv(path) {
  if (!path) {
    throw new Error('データソースが設定されていません。');
  }

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`データを取得できませんでした: ${path}`);
  }

  const text = await response.text();
  const rows = parseCsv(text);
  if (!rows.length) {
    return [];
  }

  const [headers, ...dataRows] = rows;
  return dataRows
    .filter((row) => row.some((value) => value.trim().length > 0))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
}

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '\r') {
      continue;
    }

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    if (char === '\n' && !insideQuotes) {
      currentRow.push(currentValue.trim());
      rows.push(currentRow);
      currentRow = [];
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  if (rows.length && rows[0][0]?.charCodeAt(0) === 0xfeff) {
    rows[0][0] = rows[0][0].slice(1);
  }

  return rows;
}

function populateMunicipalitySelect() {
  municipalitySelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '自治体を選択してください';
  placeholder.disabled = true;
  placeholder.selected = true;
  municipalitySelect.appendChild(placeholder);

  const sorted = [...state.municipalities].sort((a, b) =>
    a.municipality_name.localeCompare(b.municipality_name, 'ja')
  );

  for (const municipality of sorted) {
    const option = document.createElement('option');
    option.value = municipality.municipality_id;
    option.textContent = municipality.municipality_name;
    municipalitySelect.appendChild(option);
  }
}

function populateAreaSelect(municipalityId) {
  areaSelect.innerHTML = '';
  if (!municipalityId) {
    areaSelect.disabled = true;
    return;
  }

  const areas = state.areas.filter((area) => area.municipality_id === municipalityId);
  if (!areas.length) {
    areaSelect.disabled = true;
    return;
  }

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '地区を選択してください';
  placeholder.disabled = true;
  placeholder.selected = true;
  areaSelect.appendChild(placeholder);

  const sorted = [...areas].sort((a, b) => a.area_name.localeCompare(b.area_name, 'ja'));
  for (const area of sorted) {
    const option = document.createElement('option');
    option.value = area.area_id;
    option.textContent = area.area_name;
    areaSelect.appendChild(option);
  }

  areaSelect.disabled = false;

  if (sorted.length === 1) {
    state.selectedArea = sorted[0].area_id;
    areaSelect.value = state.selectedArea;
    areaSelect.dispatchEvent(new Event('change'));
  }
}

function populateCategoryFilters() {
  categoryFiltersContainer.innerHTML = '';
  state.activeCategories.clear();
  const categories = Array.from(state.categories.values()).sort((a, b) =>
    a.category_name.localeCompare(b.category_name, 'ja')
  );

  for (const category of categories) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'category-filter';
    button.dataset.categoryId = category.category_id;
    button.dataset.active = 'true';
    button.setAttribute('aria-pressed', 'true');

    const swatch = document.createElement('span');
    swatch.className = 'category-swatch';
    swatch.style.backgroundColor = category.color_hex || '#9aa5b1';

    const label = document.createElement('span');
    label.textContent = category.category_name;

    button.appendChild(swatch);
    button.appendChild(label);

    button.addEventListener('click', () => {
      const active = button.dataset.active === 'true';
      button.dataset.active = String(!active);
      button.setAttribute('aria-pressed', String(!active));
      if (active) {
        state.activeCategories.delete(category.category_id);
      } else {
        state.activeCategories.add(category.category_id);
      }
      refreshUI();
      updateQueryString();
    });

    state.activeCategories.add(category.category_id);
    categoryFiltersContainer.appendChild(button);
  }
}

function populateLegend() {
  legendContainer.innerHTML = '';
  const categories = Array.from(state.categories.values()).sort((a, b) =>
    a.category_name.localeCompare(b.category_name, 'ja')
  );

  for (const category of categories) {
    const item = document.createElement('li');
    item.className = 'legend__item';

    const title = document.createElement('div');
    title.className = 'legend__title';

    const swatch = document.createElement('span');
    swatch.className = 'category-swatch';
    swatch.style.backgroundColor = category.color_hex || '#9aa5b1';

    const name = document.createElement('span');
    name.textContent = category.category_name;

    const description = document.createElement('p');
    description.className = 'legend__description';
    description.textContent = category.description || '説明は登録されていません。';

    title.appendChild(swatch);
    title.appendChild(name);
    item.appendChild(title);
    item.appendChild(description);
    legendContainer.appendChild(item);
  }
}

function attachEventListeners() {
  municipalitySelect.addEventListener('change', (event) => {
    state.selectedMunicipality = event.target.value || null;
    state.selectedArea = null;
    populateAreaSelect(state.selectedMunicipality);
    areaSelect.value = '';
    refreshUI();
    updateQueryString();
  });

  areaSelect.addEventListener('change', (event) => {
    state.selectedArea = event.target.value || null;
    refreshUI();
    updateQueryString();
  });

  searchInput.addEventListener('input', (event) => {
    state.searchTerm = event.target.value.trim();
    refreshUI();
    updateQueryString();
  });

  icsButton.addEventListener('click', handleIcsDownload);
  shareButton.addEventListener('click', handleShare);
}

function refreshUI() {
  const filteredEntries = getFilteredEntries();
  const currentMunicipality = state.municipalities.find(
    (municipality) => municipality.municipality_id === state.selectedMunicipality
  );
  const currentArea = state.areas.find(
    (area) =>
      area.municipality_id === state.selectedMunicipality && area.area_id === state.selectedArea
  );

  renderUpcoming(filteredEntries, currentMunicipality);
  renderTable(filteredEntries, currentMunicipality);
  updateActionButtons(filteredEntries, currentMunicipality);
}

function getFilteredEntries() {
  return state.schedule
    .filter((entry) => {
      if (state.selectedMunicipality && entry.municipality_id !== state.selectedMunicipality) {
        return false;
      }
      if (state.selectedArea && entry.area_id && entry.area_id !== state.selectedArea) {
        return false;
      }
      if (state.activeCategories.size && !state.activeCategories.has(entry.category_id)) {
        return false;
      }
      if (state.searchTerm) {
        const haystack = `${entry.note || ''} ${lookupCategoryName(entry.category_id)}`.toLowerCase();
        if (!haystack.includes(state.searchTerm.toLowerCase())) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function renderUpcoming(entries, municipality) {
  upcomingList.innerHTML = '';
  const now = startOfDay(new Date());
  const upcoming = entries.filter((entry) => new Date(entry.date) >= now).slice(0, CONFIG.upcomingLimit);

  if (!upcoming.length) {
    noResultsMessage.hidden = false;
    return;
  }

  noResultsMessage.hidden = true;

  for (const entry of upcoming) {
    const card = cardTemplate.content.firstElementChild.cloneNode(true);
    const dateElement = card.querySelector('.card__date');
    const categoryElement = card.querySelector('.card__category');
    const noteElement = card.querySelector('.card__note');

    dateElement.textContent = formatDate(entry.date, municipality?.timezone);
    categoryElement.textContent = lookupCategoryName(entry.category_id);
    noteElement.textContent = entry.note || '特別な注意事項はありません。';

    const color = state.categories.get(entry.category_id)?.color_hex;
    if (color) {
      card.style.borderLeft = `6px solid ${color}`;
    }

    upcomingList.appendChild(card);
  }
}

function renderTable(entries, municipality) {
  scheduleTableBody.innerHTML = '';
  for (const entry of entries) {
    const row = document.createElement('tr');
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(entry.date, municipality?.timezone);

    const weekdayCell = document.createElement('td');
    weekdayCell.textContent = formatWeekday(entry.date, municipality?.timezone);

    const categoryCell = document.createElement('td');
    categoryCell.textContent = lookupCategoryName(entry.category_id);

    const noteCell = document.createElement('td');
    noteCell.textContent = entry.note || '';

    row.appendChild(dateCell);
    row.appendChild(weekdayCell);
    row.appendChild(categoryCell);
    row.appendChild(noteCell);
    scheduleTableBody.appendChild(row);
  }
}

function lookupCategoryName(categoryId) {
  return state.categories.get(categoryId)?.category_name || categoryId;
}

function formatDate(dateString, timeZone = 'Asia/Tokyo') {
  const date = new Date(`${dateString}T00:00:00`);
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'long',
    timeZone
  });
  return formatter.format(date);
}

function formatWeekday(dateString, timeZone = 'Asia/Tokyo') {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('ja-JP', { weekday: 'long', timeZone }).format(date);
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function updateActionButtons(entries, municipality) {
  const hasMunicipality = Boolean(municipality);

  icsButton.disabled = entries.length === 0 || !hasMunicipality;
  shareButton.disabled = !state.selectedMunicipality;
}

function handleIcsDownload() {
  const entries = getFilteredEntries();
  if (!entries.length) {
    return;
  }

  const municipality = state.municipalities.find(
    (item) => item.municipality_id === state.selectedMunicipality
  );
  const area = state.areas.find(
    (item) =>
      item.municipality_id === state.selectedMunicipality && item.area_id === state.selectedArea
  );

  const timezone = municipality?.timezone || 'Asia/Tokyo';
  const titlePrefix = municipality ? `${municipality.municipality_name} ` : '';
  const areaName = area ? area.area_name : '';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Waste Collection Scheduler//JP',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeIcsText(`${titlePrefix}${areaName} ごみ収集`)}`,
    `X-WR-TIMEZONE:${timezone}`
  ];

  const generatedAt = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  for (const entry of entries) {
    const uid = `${entry.municipality_id}-${entry.area_id || 'all'}-${entry.date}-${entry.category_id}@waste-scheduler`;
    const start = `${entry.date.replace(/-/g, '')}`;
    const summary = `${lookupCategoryName(entry.category_id)} (${areaName || '共通'})`;
    const description = entry.note || '';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${generatedAt}`);
    lines.push(`DTSTART;VALUE=DATE:${start}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    if (municipality?.contact_url) {
      lines.push(`URL:${escapeIcsText(municipality.contact_url)}`);
    }
    if (description) {
      lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${state.selectedMunicipality || 'schedule'}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeIcsText(text) {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

async function handleShare() {
  const url = new URL(window.location.href);
  updateQueryString(url);

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'ごみ収集カレンダー',
        text: '選択中の条件を共有します。',
        url: url.toString()
      });
      return;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('共有に失敗しました', error);
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url.toString());
    shareButton.textContent = 'コピーしました';
    setTimeout(() => {
      shareButton.textContent = 'この条件を共有';
    }, 2500);
  } catch (error) {
    console.error('クリップボードにコピーできませんでした', error);
    alert('URLのコピーに失敗しました。ブラウザーのアドレスバーからコピーしてください。');
  }
}

function updateQueryString(url) {
  const targetUrl = url ?? new URL(window.location.href);

  if (state.selectedMunicipality) {
    targetUrl.searchParams.set('municipality', state.selectedMunicipality);
  } else {
    targetUrl.searchParams.delete('municipality');
  }

  if (state.selectedArea) {
    targetUrl.searchParams.set('area', state.selectedArea);
  } else {
    targetUrl.searchParams.delete('area');
  }

  const inactiveCategories = Array.from(state.categories.keys()).filter(
    (categoryId) => !state.activeCategories.has(categoryId)
  );
  if (inactiveCategories.length && inactiveCategories.length !== state.categories.size) {
    targetUrl.searchParams.set('exclude', inactiveCategories.join(','));
  } else {
    targetUrl.searchParams.delete('exclude');
  }

  if (state.searchTerm) {
    targetUrl.searchParams.set('search', state.searchTerm);
  } else {
    targetUrl.searchParams.delete('search');
  }

  if (!url) {
    const nextUrl = targetUrl.toString();
    if (nextUrl !== window.location.href) {
      window.history.replaceState({}, '', nextUrl);
    }
  }

  return targetUrl;
}

function restoreStateFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const municipality = params.get('municipality');
  const area = params.get('area');
  const exclude = params.get('exclude');
  const search = params.get('search');

  if (municipality && state.municipalities.some((item) => item.municipality_id === municipality)) {
    state.selectedMunicipality = municipality;
    municipalitySelect.value = municipality;
    populateAreaSelect(municipality);
  }

  if (area && state.areas.some((item) => item.area_id === area && item.municipality_id === municipality)) {
    state.selectedArea = area;
    areaSelect.value = area;
  }

  if (exclude) {
    const excluded = exclude.split(',');
    state.activeCategories = new Set(
      Array.from(state.categories.keys()).filter((id) => !excluded.includes(id))
    );
    for (const button of categoryFiltersContainer.querySelectorAll('.category-filter')) {
      const categoryId = button.dataset.categoryId;
      const active = state.activeCategories.has(categoryId);
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  if (search) {
    state.searchTerm = search;
    searchInput.value = search;
  }
}

function showError(error) {
  noResultsMessage.hidden = false;
  noResultsMessage.textContent = `データの読み込み中に問題が発生しました: ${error.message}`;
}

document.addEventListener('DOMContentLoaded', init);
