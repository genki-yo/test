const records = [
  {
    id: 1,
    title: "令和6年第2回 定例会 一般質問",
    date: "2024-05-28",
    speaker: "佐藤ゆかり",
    committee: "本会議",
    summary:
      "防災訓練の地域参加率向上策と、避難所運営マニュアルの改訂スケジュールについて質問。市長から実践型訓練の増回と多言語対応の準備状況が報告された。",
    tags: ["防災", "訓練", "多言語対応"],
    highlight: true,
    link:
      "https://haramuragikai.gijiroku.com/voices/CGI/voiweb.exe?ACT=200&KGNO=155&FINO=691",
  },
  {
    id: 2,
    title: "令和6年第1回 定例会 予算審査特別委員会",
    date: "2024-03-12",
    speaker: "原村市長",
    committee: "予算特別委員会",
    summary:
      "令和6年度一般会計予算案の主要ポイントを説明。子育て支援の拡充、防災備蓄品の更新、ICT教育投資を重点化する方針を示した。",
    tags: ["予算", "子育て", "ICT"],
    highlight: true,
    link:
      "https://haramuragikai.gijiroku.com/voices/CGI/voiweb.exe?ACT=200&FINO=680",
  },
  {
    id: 3,
    title: "総務産業委員会 所管事務調査",
    date: "2023-11-08",
    speaker: "田中信吾",
    committee: "総務産業委員会",
    summary:
      "公共施設の統廃合方針に関する調査報告。老朽化が進む施設を減らし、地域コミュニティ拠点として複合化する案を提示。財政負担を抑えつつ利便性を確保する設計思想を説明。",
    tags: ["公共施設", "財政", "地域拠点"],
    highlight: false,
    link: "https://haramuragikai.gijiroku.com/voices/",
  },
  {
    id: 4,
    title: "文教厚生委員会 学校給食センター整備",
    date: "2023-09-15",
    speaker: "吉田まりこ",
    committee: "文教厚生委員会",
    summary:
      "新給食センター整備計画の進捗報告。アレルギー対応ラインの導入や地元食材利用率の向上について質疑が交わされ、安全性とコストの両立を重視する方針が確認された。",
    tags: ["学校給食", "安全", "地産地消"],
    highlight: false,
    link: "https://haramuragikai.gijiroku.com/voices/",
  },
  {
    id: 5,
    title: "環境委員会 再生可能エネルギー導入",
    date: "2023-06-02",
    speaker: "中村直樹",
    committee: "環境委員会",
    summary:
      "公共施設への太陽光発電パネル設置計画と、地域マイクログリッド化の可能性を検討。初期費用と回収年数の試算、住民説明会の開催予定について議論された。",
    tags: ["再エネ", "太陽光", "エネルギー計画"],
    highlight: false,
    link: "https://haramuragikai.gijiroku.com/voices/",
  },
  {
    id: 6,
    title: "令和5年第3回 定例会 子育て施策",
    date: "2023-03-25",
    speaker: "鈴木陽子",
    committee: "本会議",
    summary:
      "子育て世帯への住宅補助と保育士確保策について質疑。人口減少対策として移住促進施策との連動も提案された。",
    tags: ["子育て", "住宅", "保育"],
    highlight: true,
    link: "https://haramuragikai.gijiroku.com/voices/",
  },
  {
    id: 7,
    title: "経済建設委員会 道路改良計画",
    date: "2022-12-10",
    speaker: "小林正樹",
    committee: "経済建設委員会",
    summary:
      "主要県道の渋滞緩和策として交差点改良と歩道拡幅を計画。工期短縮のため夜間工事を採用する案と、騒音対策の両立について検討が進められた。",
    tags: ["道路", "交通", "インフラ"],
    highlight: false,
    link: "https://haramuragikai.gijiroku.com/voices/",
  },
  {
    id: 8,
    title: "環境委員会 廃棄物処理施設更新",
    date: "2022-09-05",
    speaker: "原村市長",
    committee: "環境委員会",
    summary:
      "老朽化した焼却施設の更新計画と、広域連携によるコスト圧縮案を共有。再生可能エネルギー活用と温室効果ガス排出削減の目標値が示された。",
    tags: ["廃棄物", "広域連携", "脱炭素"],
    highlight: true,
    link: "https://haramuragikai.gijiroku.com/voices/",
  },
];

const keywordInput = document.getElementById("keyword");
const speakerInput = document.getElementById("speaker");
const committeeSelect = document.getElementById("committee");
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const sortSelect = document.getElementById("sort");
const onlyHighlightsCheckbox = document.getElementById("onlyHighlights");
const resultList = document.getElementById("resultList");
const resultCount = document.getElementById("resultCount");
const activeFilters = document.getElementById("activeFilters");
const meetingCount = document.getElementById("meetingCount");
const speechCount = document.getElementById("speechCount");
const detailTitle = document.getElementById("detailTitle");
const detailMeta = document.getElementById("detailMeta");
const detailTags = document.getElementById("detailTags");
const detailSummary = document.getElementById("detailSummary");
const detailLink = document.getElementById("detailLink");
const focusKeyword = document.getElementById("focusKeyword");
const resetFilters = document.getElementById("resetFilters");
const copySummary = document.getElementById("copySummary");
const quickBudget = document.getElementById("quickBudget");
const quickSafety = document.getElementById("quickSafety");
const searchForm = document.getElementById("searchForm");

function initCommitteeOptions() {
  const committees = Array.from(new Set(records.map((r) => r.committee))).sort();
  committees.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    committeeSelect.appendChild(option);
  });
}

function buildFilters() {
  return {
    keyword: keywordInput.value.trim(),
    speaker: speakerInput.value.trim(),
    committee: committeeSelect.value,
    dateFrom: dateFromInput.value,
    dateTo: dateToInput.value,
    sort: sortSelect.value,
    onlyHighlights: onlyHighlightsCheckbox.checked,
  };
}

function withinDateRange(date, from, to) {
  const target = new Date(date);
  if (from && target < new Date(from)) return false;
  if (to && target > new Date(to)) return false;
  return true;
}

function normalize(text) {
  return text.toLowerCase();
}

function matchKeyword(text, keyword) {
  if (!keyword) return true;
  const normalizedKeyword = normalize(keyword);
  return normalize(text).includes(normalizedKeyword);
}

function filterRecords(filters) {
  const keyword = filters.keyword;
  return records
    .filter((record) =>
      withinDateRange(record.date, filters.dateFrom, filters.dateTo)
    )
    .filter((record) =>
      !filters.committee || record.committee === filters.committee
    )
    .filter((record) =>
      !filters.speaker || matchKeyword(record.speaker, filters.speaker)
    )
    .filter((record) => {
      if (filters.onlyHighlights) return record.highlight;
      return true;
    })
    .filter((record) => {
      if (!keyword) return true;
      return (
        matchKeyword(record.title, keyword) ||
        matchKeyword(record.summary, keyword) ||
        record.tags.some((tag) => matchKeyword(tag, keyword))
      );
    })
    .sort((a, b) => {
      if (filters.sort === "asc") return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });
}

function highlight(text, keyword) {
  if (!keyword) return text;
  const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(safeKeyword, "gi");
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

function renderActiveFilters(filters) {
  activeFilters.innerHTML = "";
  const chips = [];

  if (filters.keyword) chips.push(`キーワード: ${filters.keyword}`);
  if (filters.speaker) chips.push(`発言者: ${filters.speaker}`);
  if (filters.committee) chips.push(filters.committee);
  if (filters.dateFrom || filters.dateTo) {
    chips.push(`期間: ${filters.dateFrom || "指定なし"} 〜 ${
      filters.dateTo || "指定なし"
    }`);
  }
  if (filters.onlyHighlights) chips.push("重要タグのみ");

  chips.forEach((chip) => {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = chip;
    activeFilters.appendChild(span);
  });
}

function renderStats() {
  const meetings = new Set(records.map((r) => r.title.split(" ")[0]));
  meetingCount.textContent = meetings.size;
  speechCount.textContent = records.length;
}

function renderDetail(record) {
  if (!record) return;
  detailTitle.textContent = record.title;
  detailMeta.textContent = `${record.date} / ${record.committee} / ${record.speaker}`;
  detailSummary.textContent = record.summary;
  detailLink.href = record.link;

  detailTags.innerHTML = "";
  record.tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    detailTags.appendChild(span);
  });
}

function renderResults(filters) {
  const filtered = filterRecords(filters);
  resultList.innerHTML = "";
  resultCount.textContent = filtered.length;
  renderActiveFilters(filters);

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "該当する発言がありませんでした。条件を緩めてみてください。";
    resultList.appendChild(empty);
    return;
  }

  filtered.forEach((record, index) => {
    const item = document.createElement("article");
    item.className = "result-card";
    item.dataset.id = record.id;
    item.innerHTML = `
      <div class="result-card__meta">
        <span class="pill">${record.date}</span>
        <span class="pill pill--subtle">${record.committee}</span>
      </div>
      <h3>${highlight(record.title, filters.keyword)}</h3>
      <p class="muted">${record.speaker}</p>
      <p class="summary">${highlight(record.summary, filters.keyword)}</p>
      <div class="tag-row">${record.tags
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join("")}</div>
    `;
    if (record.highlight) {
      item.classList.add("result-card--highlight");
    }
    item.addEventListener("click", () => {
      renderDetail(record);
      resultList.querySelectorAll(".result-card").forEach((card) =>
        card.classList.remove("active")
      );
      item.classList.add("active");
    });

    resultList.appendChild(item);

    if (index === 0) {
      item.classList.add("active");
      renderDetail(record);
    }
  });
}

function restoreSavedFilters() {
  const saved = JSON.parse(localStorage.getItem("searchFilters") || "{} ");
  if (saved.keyword) keywordInput.value = saved.keyword;
  if (saved.speaker) speakerInput.value = saved.speaker;
  if (saved.committee) committeeSelect.value = saved.committee;
  if (saved.dateFrom) dateFromInput.value = saved.dateFrom;
  if (saved.dateTo) dateToInput.value = saved.dateTo;
  if (saved.sort) sortSelect.value = saved.sort;
  if (saved.onlyHighlights) onlyHighlightsCheckbox.checked = saved.onlyHighlights;
}

function persistFilters(filters) {
  localStorage.setItem("searchFilters", JSON.stringify(filters));
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const filters = buildFilters();
  persistFilters(filters);
  renderResults(filters);
});

focusKeyword.addEventListener("click", () => keywordInput.focus());
resetFilters.addEventListener("click", () => {
  searchForm.reset();
  persistFilters(buildFilters());
  renderResults(buildFilters());
});
quickBudget.addEventListener("click", () => {
  keywordInput.value = "予算";
  renderResults(buildFilters());
});
quickSafety.addEventListener("click", () => {
  keywordInput.value = "防災";
  renderResults(buildFilters());
});

copySummary.addEventListener("click", async () => {
  const text = detailSummary.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copySummary.textContent = "コピーしました";
    setTimeout(() => (copySummary.textContent = "サマリーをコピー"), 1500);
  } catch (error) {
    copySummary.textContent = "コピーできませんでした";
    setTimeout(() => (copySummary.textContent = "サマリーをコピー"), 1500);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  initCommitteeOptions();
  restoreSavedFilters();
  renderStats();
  renderResults(buildFilters());
});
