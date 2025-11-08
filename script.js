const functions = [
  {
    name: "SUM",
    icon: "∑",
    category: "集計",
    description: "数値の合計を計算します。複数の範囲や値を一度に集約。",
    args: [
      {
        label: "範囲 / 値",
        placeholder: "A1:A10",
        helper: "数値セルの範囲や直接の数値を入力 (カンマ区切り可)",
      },
    ],
    template: (values) => `SUM(${values[0]})`,
  },
  {
    name: "AVERAGE",
    icon: "Ø",
    category: "集計",
    description: "選択した範囲の平均値を求めます。",
    args: [
      {
        label: "範囲 / 値",
        placeholder: "B2:B20",
        helper: "平均化したいセル範囲や値を入力",
      },
    ],
    template: (values) => `AVERAGE(${values[0]})`,
  },
  {
    name: "IF",
    icon: "?",
    category: "ロジック",
    description: "条件に応じて結果を切り替える条件分岐を作成します。",
    args: [
      {
        label: "論理式",
        placeholder: "A1>10",
        helper: "TRUE / FALSE を返す条件式",
      },
      {
        label: "真の場合",
        placeholder: '"OK"',
        helper: "条件が TRUE のときの戻り値",
      },
      {
        label: "偽の場合",
        placeholder: '"NG"',
        helper: "条件が FALSE のときの戻り値",
      },
    ],
    template: (values) => `IF(${values[0]},${values[1]},${values[2]})`,
  },
  {
    name: "VLOOKUP",
    icon: "⌕",
    category: "検索",
    description: "キーで表を検索し、指定列の値を返します。",
    args: [
      {
        label: "検索値",
        placeholder: "A2",
        helper: "探したい値 (セル参照や文字列)",
      },
      {
        label: "検索範囲",
        placeholder: "参照表!A:D",
        helper: "キー列を含む範囲 (最左列が検索対象)",
      },
      {
        label: "列番号",
        placeholder: "2",
        helper: "取得したい値が存在する列番号",
      },
      {
        label: "検索方法",
        placeholder: "FALSE",
        helper: "完全一致なら FALSE、近似なら TRUE",
      },
    ],
    template: (values) => `VLOOKUP(${values.join(",")})`,
  },
  {
    name: "TEXT",
    icon: "Ab",
    category: "テキスト",
    description: "数値を任意の表示形式で文字列に変換します。",
    args: [
      {
        label: "値",
        placeholder: "A1",
        helper: "フォーマットしたい数値または日付",
      },
      {
        label: "表示形式",
        placeholder: '"yyyy/mm/dd"',
        helper: "Excel の表示形式を文字列で入力",
      },
    ],
    template: (values) => `TEXT(${values[0]},${values[1]})`,
  },
  {
    name: "CONCAT",
    icon: "∞",
    category: "テキスト",
    description: "複数の文字列を結合して 1 つの文字列にします。",
    args: [
      {
        label: "文字列",
        placeholder: '"名前" , B2',
        helper: "結合したい文字列やセル (カンマ区切り)",
      },
    ],
    template: (values) => `CONCAT(${values[0]})`,
  },
  {
    name: "SUMIF",
    icon: "Σ*",
    category: "集計",
    description: "条件を満たすセルだけを合計します。",
    args: [
      {
        label: "条件範囲",
        placeholder: "A:A",
        helper: "条件判定を行うセル範囲",
      },
      {
        label: "条件",
        placeholder: '"完了"',
        helper: "合計対象とする条件 (例: ">=10")",
      },
      {
        label: "合計範囲",
        placeholder: "B:B",
        helper: "合計するセル範囲 (省略可)",
        optional: true,
      },
    ],
    template: (values) => `SUMIF(${values.filter(Boolean).join(",")})`,
  },
  {
    name: "XLOOKUP",
    icon: "⌕",
    category: "検索",
    description: "最新の検索関数。どの方向にも柔軟に検索できます。",
    args: [
      {
        label: "検索値",
        placeholder: "B2",
        helper: "探したい値",
      },
      {
        label: "検索範囲",
        placeholder: "顧客一覧!A:A",
        helper: "検索対象となる範囲",
      },
      {
        label: "戻り範囲",
        placeholder: "顧客一覧!C:C",
        helper: "結果として返したい範囲",
      },
      {
        label: "見つからないとき",
        placeholder: '"見つかりません"',
        helper: "任意: 未検出時に返す値",
        optional: true,
      },
    ],
    template: (values) => `XLOOKUP(${values.filter(Boolean).join(",")})`,
  },
  {
    name: "FILTER",
    icon: "⧉",
    category: "分析",
    description: "条件に合致する行をフィルターして一覧で返します。",
    args: [
      {
        label: "配列",
        placeholder: "A1:D100",
        helper: "抽出対象の範囲",
      },
      {
        label: "条件",
        placeholder: "(B1:B100=\"東京\")",
        helper: "TRUE / FALSE を返す配列式",
      },
      {
        label: "空の場合",
        placeholder: '"該当なし"',
        helper: "任意: 結果が空のときのメッセージ",
        optional: true,
      },
    ],
    template: (values) => `FILTER(${values.filter(Boolean).join(",")})`,
  },
];

const formulaDisplay = document.getElementById("formulaDisplay");
const formulaText = document.getElementById("formulaText");
const hintText = document.getElementById("hintText");
const functionList = document.getElementById("functionList");
const modal = document.getElementById("functionModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalForm = document.getElementById("functionForm");
const copyFormulaBtn = document.getElementById("copyFormulaBtn");
const clearFormulaBtn = document.getElementById("clearFormulaBtn");
const quickActionButtons = document.querySelectorAll(".quick-actions .btn");
const presetCard = document.querySelector(".preset-card ul");
const newFormulaBtn = document.getElementById("newFormulaBtn");
const tourBtn = document.getElementById("tourBtn");
const tourPopover = document.getElementById("tourPopover");
const tourCloseBtn = tourPopover.querySelector(".tour-popover__close");

let currentFormula = "";
let caretPosition = 0;

const categories = {
  集計: "gradient--violet",
  ロジック: "gradient--green",
  テキスト: "gradient--pink",
  検索: "gradient--blue",
  分析: "gradient--cyan",
};

function renderFunctionCards() {
  const template = document.getElementById("functionCardTemplate");
  const fragment = document.createDocumentFragment();

  functions.forEach((fn) => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".function-card");
    const icon = clone.querySelector(".function-card__icon");
    const title = clone.querySelector(".function-card__title");
    const category = clone.querySelector(".function-card__category");
    const description = clone.querySelector(".function-card__description");
    const cta = clone.querySelector(".function-card__cta");

    icon.textContent = fn.icon;
    title.textContent = fn.name;
    category.textContent = fn.category;
    description.textContent = fn.description;

    card.classList.add(categories[fn.category] ?? "");

    card.addEventListener("click", () => openFunctionModal(fn));
    cta.addEventListener("click", (event) => {
      event.stopPropagation();
      openFunctionModal(fn);
    });

    fragment.appendChild(clone);
  });

  functionList.appendChild(fragment);
}

function openFunctionModal(fn) {
  modalTitle.textContent = `${fn.name} 関数`;
  modalDescription.textContent = fn.description;
  modalForm.innerHTML = "";

  fn.args.forEach((arg, index) => {
    const field = document.createElement("div");
    field.className = "form-field";

    const label = document.createElement("label");
    label.textContent = arg.label + (arg.optional ? " (任意)" : "");
    label.setAttribute("for", `arg-${index}`);

    const input = document.createElement(arg.multiline ? "textarea" : "input");
    input.id = `arg-${index}`;
    input.name = `arg-${index}`;
    input.placeholder = arg.placeholder ?? "";
    input.required = !arg.optional;
    if (arg.multiline) {
      input.rows = 3;
    }

    if (arg.helper) {
      const helper = document.createElement("small");
      helper.textContent = arg.helper;
      field.append(label, input, helper);
    } else {
      field.append(label, input);
    }

    modalForm.appendChild(field);
  });

  modal.setAttribute("aria-hidden", "false");
  modal.querySelector("input, textarea")?.focus();
}

function closeFunctionModal() {
  modal.setAttribute("aria-hidden", "true");
  modalForm.reset();
}

function insertAtCaret(text) {
  const before = currentFormula.slice(0, caretPosition);
  const after = currentFormula.slice(caretPosition);
  currentFormula = before + text + after;
  caretPosition = before.length + text.length;
  updateFormulaView();
}

function updateFormulaView() {
  const display = formulaDisplay;
  display.innerHTML = "";

  const normalized = currentFormula.trim();
  if (!normalized) {
    display.classList.add("empty");
  } else {
    display.classList.remove("empty");
  }

  const chipTemplate = document.getElementById("formulaChipTemplate");
  const tokens = tokenizeFormula(normalized);

  tokens.forEach((token) => {
    const node = chipTemplate.content.firstElementChild.cloneNode(true);
    node.textContent = token.value;
    node.dataset.type = token.type;
    display.appendChild(node);
  });

  formulaText.value = normalized ? `=${normalized}` : "";
  hintText.textContent = normalized
    ? "完成した式はコピーして Excel に貼り付けましょう。"
    : "関数カードを選ぶか、右側のショートカットで式を組み立ててください。";

  requestAnimationFrame(() => {
    const hasEqual = formulaText.value.startsWith("=");
    const baseOffset = hasEqual ? 1 : 0;
    const selectionPosition = Math.min(
      formulaText.value.length,
      caretPosition + baseOffset
    );
    formulaText.setSelectionRange(selectionPosition, selectionPosition);
  });
}

function tokenizeFormula(formula) {
  if (!formula) return [];

  const matches = formula.match(/([A-Z]+(?=\())|([A-Z]+\d+)|([\+\-\*\/\^])|([=(),])|([^A-Z\d\+\-\*\/\^=(),]+)/gi);
  if (!matches) return [{ value: formula, type: "text" }];

  return matches.map((token) => {
    if (/^[A-Z]+(?=\()/.test(token)) {
      return { value: token, type: "function" };
    }
    if (/^[A-Z]+\d+$/i.test(token)) {
      return { value: token, type: "reference" };
    }
    if (/^[\+\-\*\/\^]$/.test(token)) {
      return { value: token, type: "operator" };
    }
    if (/^[=(),]$/.test(token)) {
      return { value: token, type: "symbol" };
    }
    return { value: token.trim(), type: "text" };
  });
}

modal.addEventListener("click", (event) => {
  if (event.target.dataset.close === "true") {
    closeFunctionModal();
  }
});

modalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(modalForm);
  const values = Array.from(formData.values()).map((value) => value.trim()).filter(Boolean);

  const fnName = modalTitle.textContent.replace(" 関数", "");
  const fn = functions.find((item) => item.name === fnName);
  if (!fn) return;

  const assembled = fn.template(values);
  insertAtCaret(assembled);
  closeFunctionModal();
});

functionList.addEventListener("scroll", () => {
  hintText.textContent = "スクロールしてさらに多くの関数を探しましょう。";
});

copyFormulaBtn.addEventListener("click", async () => {
  if (!currentFormula) return;
  const textToCopy = `=${currentFormula}`;
  try {
    await navigator.clipboard.writeText(textToCopy);
    hintText.textContent = "コピーしました！Excel で Ctrl + V してください。";
  } catch (error) {
    hintText.textContent = "コピーに失敗しました。手動で選択してください。";
  }
});

clearFormulaBtn.addEventListener("click", () => {
  currentFormula = "";
  caretPosition = 0;
  updateFormulaView();
});

quickActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.insert;
    if (value === "()") {
      insertAtCaret("()");
      caretPosition -= 1;
    } else {
      insertAtCaret(value);
    }
  });
});

presetCard.addEventListener("click", (event) => {
  if (event.target.matches("li[data-template]")) {
    const template = event.target.dataset.template.replace(/^=/, "");
    currentFormula = template;
    caretPosition = currentFormula.length;
    updateFormulaView();
    hintText.textContent = `${event.target.textContent} テンプレートを読み込みました。`;
  }
});

formulaText.addEventListener("focus", () => {
  caretPosition = currentFormula.length;
});

formulaText.addEventListener("keyup", (event) => {
  const rawValue = event.target.value;
  const value = rawValue.replace(/^=/, "");
  currentFormula = value;
  const rawPosition = event.target.selectionStart ?? rawValue.length;
  caretPosition = Math.max(0, Math.min(value.length, rawPosition - 1));
  updateFormulaView();
});

formulaText.addEventListener("click", (event) => {
  const position = event.target.selectionStart ?? currentFormula.length;
  caretPosition = Math.max(0, Math.min(currentFormula.length, position - 1));
});

newFormulaBtn.addEventListener("click", () => {
  currentFormula = "";
  caretPosition = 0;
  updateFormulaView();
  hintText.textContent = "新しい式を作成します。関数を選択しましょう。";
  window.scrollTo({ top: document.querySelector("main").offsetTop, behavior: "smooth" });
});

tourBtn.addEventListener("click", () => {
  tourPopover.hidden = false;
});

tourCloseBtn.addEventListener("click", () => {
  tourPopover.hidden = true;
});

document.addEventListener("DOMContentLoaded", () => {
  renderFunctionCards();
  updateFormulaView();
});
