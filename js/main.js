/**
 * Finora - main.js
 * Logic dùng chung cho cả website + riêng từng trang:
 *   Dashboard (index), Giao dịch (transactions), Ngân sách (budget), Báo cáo (reports).
 * Form thêm giao dịch & form ngân sách được kiểm tra hợp lệ trong validation.js.
 * Dữ liệu lưu bằng localStorage:
 *   "transactions" -> mảng {id, title, amount, type, category, date, note, isRecurring}
 *   "budgets"      -> mảng {id, month, category, limit}
 *   "savings_goal" -> object {title, target}
 */

// =========================================================================
// 1. HẰNG SỐ & HÀM LƯU TRỮ (localStorage)
// =========================================================================
const KEY_TRANSACTIONS = "transactions";
const KEY_BUDGETS = "budgets";
const KEY_THEME = "app_theme";
const KEY_MODE = "theme_mode";
const KEY_GOAL = "savings_goal";
const ALL_CATEGORIES = "Tất cả danh mục"; // ngân sách áp dụng cho tổng chi tiêu cả tháng

// Ảnh banner theo từng chủ đề
const THEME_BANNERS = {
  pastel:  ["images/1anhchungkhoan.jpg", "images/1congnghe.jpg", "images/4thiennhien.jpg"],
  green:   ["images/2chungkhoanxanh.jpg",  "images/2congnghe.jpg",  "images/2thiennhien.jpg"],
  sunset:  ["images/3chungkhoan.jpg", "images/3congnghe.jpg", "images/3thiennhien.jpg"],
  skyblue: ["images/4chungkhoan.jpg",    "images/4congnghe.jpg",    "images/1thiennhien.jpg"]
};

/** Đổi 3 ảnh banner theo chủ đề đang chọn. */
function updateBannerImages(themeName) {
  const images = THEME_BANNERS[themeName] || THEME_BANNERS.pastel;
  document.querySelectorAll(".slider-box img").forEach((img, index) => {
    if (images[index]) {
      img.classList.remove("img-failed");
      img.src = images[index];
    }
  });
}

/** Đọc dữ liệu JSON từ localStorage. Nếu lỗi/hỏng dữ liệu thì trả về giá trị mặc định. */
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

/** Ghi dữ liệu JSON vào localStorage. */
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Không thể lưu dữ liệu:", error);
  }
}

function readText(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
}

function writeText(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Không thể lưu cài đặt:", error);
  }
}

function getTransactions() {
  const data = readStorage(KEY_TRANSACTIONS, []);
  return Array.isArray(data) ? data : [];
}

function saveTransactions(list) {
  writeStorage(KEY_TRANSACTIONS, list);
}

function getBudgets() {
  const data = readStorage(KEY_BUDGETS, []);
  return Array.isArray(data) ? data : [];
}

function saveBudgets(list) {
  writeStorage(KEY_BUDGETS, list);
}

// =========================================================================
// 2. NGÀY THÁNG, TIỀN TỆ & TÍNH TOÁN
// =========================================================================
function pad(number) {
  return String(number).padStart(2, "0");
}

function getMonthString(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1);
}

function getTodayString() {
  const now = new Date();
  return getMonthString(now) + "-" + pad(now.getDate());
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function sumByType(list, type) {
  return list
    .filter(item => item.type === type)
    .reduce((total, item) => total + Number(item.amount), 0);
}

function filterByMonth(list, month) {
  return month ? list.filter(item => String(item.date).startsWith(month)) : list;
}

function sortByDateDesc(list) {
  return [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)) || b.id - a.id);
}

function getSpentForBudget(transactions, budget) {
  return transactions
    .filter(item =>
      item.type === "expense" &&
      String(item.date).startsWith(budget.month) &&
      (budget.category === ALL_CATEGORIES || item.category === budget.category))
    .reduce((total, item) => total + Number(item.amount), 0);
}

function getBudgetLevel(percent) {
  if (percent >= 100) return "over";
  if (percent >= 80) return "warn";
  return "ok";
}

// =========================================================================
// 3. HÀM DOM DÙNG CHUNG
// =========================================================================
function createCell(text, className) {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
}

function createBadge(type) {
  const badge = document.createElement("span");
  const isIncome = type === "income";
  badge.className = "badge " + (isIncome ? "badge-income" : "badge-expense");
  badge.textContent = isIncome ? "Thu nhập" : "Chi tiêu";
  return badge;
}

function createAmountCell(item) {
  const isIncome = item.type === "income";
  return createCell((isIncome ? "+ " : "- ") + formatCurrency(item.amount), isIncome ? "amount-income" : "amount-expense");
}

function renderEmptyRow(tbody, colspan, message) {
  const row = document.createElement("tr");
  const cell = createCell(message, "empty-cell");
  cell.colSpan = colspan;
  row.appendChild(cell);
  tbody.appendChild(row);
}

let toastTimer = null;

function showToast(message, isError) {
  const toast = document.getElementById("toastMessage");
  const text = document.getElementById("toastText");
  if (!toast) return;

  if (text) text.textContent = message;
  toast.classList.toggle("error", Boolean(isError));
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function showError(inputElement, errorElementId, message) {
  inputElement.classList.add("input-error");
  const errorElem = document.getElementById(errorElementId);
  if (errorElem) {
    errorElem.textContent = message;
    errorElem.classList.add("show");
  }
}

function clearError(inputElement, errorElementId) {
  inputElement.classList.remove("input-error");
  const errorElem = document.getElementById(errorElementId);
  if (errorElem) errorElem.classList.remove("show");
}

// =========================================================================
// 4. DỮ LIỆU MẪU
// =========================================================================
function getSampleData() {
  const month = getMonthString(new Date());
  const rows = [
    ["Tiền gia đình gửi", 4000000, "income", "Khác", 1, "Sinh hoạt phí tháng này"],
    ["Tiền trọ", 1200000, "expense", "Nhà ở", 3, "Đóng tiền nhà"],
    ["Lương part-time", 3500000, "income", "Lương", 5, "Lương tháng này"],
    ["Ăn sáng + trưa cả tuần", 450000, "expense", "Ăn uống", 7, "Căn tin trường"],
    ["Vé xe buýt tháng", 120000, "expense", "Di chuyển", 8, ""],
    ["Tiền điện nước", 380000, "expense", "Nhà ở", 10, "Điện + nước"],
    ["Cà phê với bạn", 85000, "expense", "Ăn uống", 12, ""],
    ["Đổ xăng", 150000, "expense", "Di chuyển", 14, ""],
    ["Mua áo thun", 280000, "expense", "Mua sắm", 16, "Sale cuối tháng"],
    ["Làm web freelance", 1500000, "income", "Khác", 18, "Dự án landing page"],
    ["Internet", 200000, "expense", "Nhà ở", 19, "Cước wifi"],
    ["Khóa học online", 590000, "expense", "Học tập", 20, "Khóa JavaScript"],
    ["Mua giáo trình CNTT", 250000, "expense", "Học tập", 22, "Sách vi xử lý & web"],
    ["Đi siêu thị cuối tuần", 320000, "expense", "Ăn uống", 24, "Thực phẩm dự trữ"],
    ["Grab đi phỏng vấn", 95000, "expense", "Di chuyển", 25, ""]
  ];

  return rows.map((row, index) => ({
    id: index + 1,
    title: row[0],
    amount: row[1],
    type: row[2],
    category: row[3],
    date: month + "-" + pad(row[4]),
    note: row[5],
    isRecurring: false
  }));
}

function getSampleBudgets() {
  const month = getMonthString(new Date());
  return [
    { id: 1, month: month, category: ALL_CATEGORIES, limit: 5000000 },
    { id: 2, month: month, category: "Ăn uống", limit: 1000000 },
    { id: 3, month: month, category: "Học tập", limit: 800000 }
  ];
}

function loadSampleData() {
  saveTransactions(getSampleData());
  saveBudgets(getSampleBudgets());
}

function clearAllData() {
  saveTransactions([]);
  saveBudgets([]);
  localStorage.removeItem(KEY_GOAL);
}

function initDefaultData() {
  try {
    if (localStorage.getItem(KEY_TRANSACTIONS) === null) loadSampleData();
  } catch (error) {
    console.warn("localStorage không khả dụng:", error);
  }
}

// =========================================================================
// 5. GIAO DIỆN CHUNG: MENU MOBILE, ĐỒNG HỒ, CHỦ ĐỀ, SLIDER
// =========================================================================
function setupNavToggle() {
  const button = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!button || !nav) return;

  button.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    button.textContent = isOpen ? "✕" : "☰";
  });
}

function startRealtimeClock() {
  const clockElement = document.getElementById("realtimeClock");
  if (!clockElement) return;

  function updateClock() {
    const now = new Date();
    const dateText = now.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    clockElement.textContent = dateText + " - " + now.toLocaleTimeString("vi-VN");
  }

  updateClock();
  setInterval(updateClock, 1000);
}

function applyCurrentTheme() {
  const color = readText(KEY_THEME, "pastel");
  const isDark = readText(KEY_MODE, "light") === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? color + "-dark" : color);

  const toggleButton = document.getElementById("themeToggleBtn");
  if (toggleButton) toggleButton.textContent = isDark ? "☀️ Chế độ sáng" : "🌙 Chế độ tối";

  document.querySelectorAll("[data-theme-choice]").forEach(card => {
    card.classList.toggle("selected", card.dataset.themeChoice === color);
  });
  updateBannerImages(color);
}

function setupThemeSystem() {
  const toggleButton = document.getElementById("themeToggleBtn");
  const modal = document.getElementById("themeModal");
  const openButton = document.getElementById("themeStoreBtn");
  const closeButton = document.getElementById("closeThemeModal");

  applyCurrentTheme();

  if (toggleButton) {
    toggleButton.addEventListener("click", function () {
      const isDark = readText(KEY_MODE, "light") === "dark";
      writeText(KEY_MODE, isDark ? "light" : "dark");
      applyCurrentTheme();
    });
  }

  if (!modal) return;

  if (openButton) openButton.addEventListener("click", () => modal.classList.add("open"));
  if (closeButton) closeButton.addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", function (event) {
    if (event.target === modal) modal.classList.remove("open");

    const card = event.target.closest("[data-theme-choice]");
    if (card) {
      writeText(KEY_THEME, card.dataset.themeChoice);
      applyCurrentTheme();
      modal.classList.remove("open");
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") modal.classList.remove("open");
  });
}

function setupSlider() {
  const slides = document.querySelectorAll(".slider-box img");
  if (slides.length === 0) return;

  slides.forEach(img => img.addEventListener("error", () => img.classList.add("img-failed")));

  let current = 0;
  setInterval(function () {
    slides[current].classList.remove("active-slide");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active-slide");
  }, 3500);
}

// =========================================================================
// 6. TRANG CHỦ (index.html) - DASHBOARD
// =========================================================================
function setupDashboardPage() {
  const monthInput = document.getElementById("dashMonth");
  const recentTable = document.getElementById("recentTransactionsTable");
  if (!monthInput || !recentTable) return;

  monthInput.value = getMonthString(new Date());
  monthInput.addEventListener("change", renderDashboard);
  renderDashboard();
}

function renderDashboard() {
  const month = document.getElementById("dashMonth").value;
  const transactions = getTransactions();
  const monthList = filterByMonth(transactions, month);

  const income = sumByType(monthList, "income");
  const expense = sumByType(monthList, "expense");
  const totalBalance = sumByType(transactions, "income") - sumByType(transactions, "expense");

  document.getElementById("totalIncome").textContent = formatCurrency(income);
  document.getElementById("totalExpense").textContent = formatCurrency(expense);
  document.getElementById("monthNet").textContent = formatCurrency(income - expense);
  document.getElementById("currentBalance").textContent = formatCurrency(totalBalance);

  renderBudgetAlert(month, transactions);

  const recentTable = document.getElementById("recentTransactionsTable");
  recentTable.innerHTML = "";
  const latest = sortByDateDesc(transactions).slice(0, 5);

  if (latest.length === 0) {
    renderEmptyRow(recentTable, 5, "Chưa có dữ liệu giao dịch.");
    return;
  }

  latest.forEach(item => {
    const row = document.createElement("tr");
    const typeCell = document.createElement("td");
    typeCell.appendChild(createBadge(item.type));

    const titleCell = document.createElement("td");
    const strong = document.createElement("strong");
    strong.textContent = item.title;
    titleCell.appendChild(strong);

    row.appendChild(createCell(item.date));
    row.appendChild(titleCell);
    row.appendChild(createCell(item.category));
    row.appendChild(typeCell);
    row.appendChild(createAmountCell(item));
    recentTable.appendChild(row);
  });
}

function renderBudgetAlert(month, transactions) {
  const banner = document.getElementById("budgetAlertBanner");
  if (!banner) return;

  const exceeded = getBudgets()
    .filter(budget => budget.month === month)
    .filter(budget => getSpentForBudget(transactions, budget) > budget.limit);

  banner.innerHTML = "";
  banner.classList.toggle("show", exceeded.length > 0);
  if (exceeded.length === 0) return;

  const names = exceeded.map(budget => budget.category).join(", ");
  const strong = document.createElement("strong");
  strong.textContent = "Cảnh báo: ";
  banner.appendChild(document.createTextNode("⚠️ "));
  banner.appendChild(strong);
  banner.appendChild(document.createTextNode("Chi tiêu đã vượt hạn mức ngân sách ở: " + names + "."));
}

// =========================================================================
// 7. TRANG GIAO DỊCH (transactions.html)
// =========================================================================
function setupTransactionsPage() {
  const tableBody = document.getElementById("transactionListTable");
  const filterForm = document.getElementById("filterForm");
  if (!tableBody || !filterForm) return;

  const searchInput = document.getElementById("searchInput");
  const filterMonth = document.getElementById("filterMonth");
  const filterType = document.getElementById("filterType");
  const filterCategory = document.getElementById("filterCategory");
  const summary = document.getElementById("resultSummary");

  function applyFilters() {
    const keyword = searchInput.value.toLowerCase().trim();

    const filtered = getTransactions().filter(item => {
      const haystack = (item.title + " " + (item.note || "")).toLowerCase();
      const matchKeyword = haystack.includes(keyword);
      const matchMonth = !filterMonth.value || String(item.date).startsWith(filterMonth.value);
      const matchType = filterType.value === "all" || item.type === filterType.value;
      const matchCategory = filterCategory.value === "all" || item.category === filterCategory.value;
      return matchKeyword && matchMonth && matchType && matchCategory;
    });

    renderList(sortByDateDesc(filtered));
    summary.textContent = "Tìm thấy " + filtered.length + " giao dịch · Thu " +
      formatCurrency(sumByType(filtered, "income")) + " · Chi " + formatCurrency(sumByType(filtered, "expense"));
  }

  function renderList(list) {
    tableBody.innerHTML = "";
    if (list.length === 0) {
      renderEmptyRow(tableBody, 7, "Không tìm thấy giao dịch nào phù hợp!");
      return;
    }

    list.forEach(item => {
      const row = document.createElement("tr");

      const typeCell = document.createElement("td");
      typeCell.appendChild(createBadge(item.type));

      const titleCell = document.createElement("td");
      const strong = document.createElement("strong");
      strong.textContent = item.title;
      titleCell.appendChild(strong);

      const actionCell = document.createElement("td");
      actionCell.className = "cell-actions";
      const editLink = document.createElement("a");
      editLink.className = "btn-edit";
      editLink.href = "add-transaction.html?editId=" + item.id;
      editLink.textContent = "Sửa";
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "btn-delete";
      deleteButton.dataset.id = item.id;
      deleteButton.textContent = "Xóa";
      actionCell.appendChild(editLink);
      actionCell.appendChild(deleteButton);

      row.appendChild(createCell(item.date));
      row.appendChild(titleCell);
      row.appendChild(createCell(item.category));
      row.appendChild(typeCell);
      row.appendChild(createAmountCell(item));
      row.appendChild(createCell(item.note || "—", "cell-note"));
      row.appendChild(actionCell);
      tableBody.appendChild(row);
    });
  }

  function deleteTransaction(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này không?")) return;
    saveTransactions(getTransactions().filter(item => item.id !== id));
    applyFilters();
    showToast("Đã xóa giao dịch!");
  }

  tableBody.addEventListener("click", function (event) {
    const button = event.target.closest(".btn-delete");
    if (button) deleteTransaction(Number(button.dataset.id));
  });

  filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    applyFilters();
  });

  searchInput.addEventListener("input", applyFilters);
  filterMonth.addEventListener("change", applyFilters);
  filterType.addEventListener("change", applyFilters);
  filterCategory.addEventListener("change", applyFilters);

  document.getElementById("btnResetFilter").addEventListener("click", function () {
    filterForm.reset();
    applyFilters();
  });

  applyFilters();
}

// =========================================================================
// 8. TRANG NGÂN SÁCH (budget.html)
// =========================================================================
function renderBudgetPage() {
  const list = document.getElementById("budgetList");
  const monthInput = document.getElementById("budgetMonth");
  if (!list || !monthInput) return;

  const month = monthInput.value || getMonthString(new Date());
  document.getElementById("budgetListMonth").textContent = month;

  const transactions = getTransactions();
  const budgets = getBudgets().filter(budget => budget.month === month);

  list.innerHTML = "";
  if (budgets.length === 0) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "Chưa có hạn mức nào cho tháng này. Hãy thiết lập ở form phía trên.";
    list.appendChild(empty);
    return;
  }

  budgets.forEach(budget => {
    const spent = getSpentForBudget(transactions, budget);
    const percent = Math.round((spent / budget.limit) * 100);
    const level = getBudgetLevel(percent);
    const remain = budget.limit - spent;

    const item = document.createElement("div");
    item.className = "budget-item";

    const head = document.createElement("div");
    head.className = "budget-item-head";
    const name = document.createElement("span");
    name.textContent = budget.category;
    const numbers = document.createElement("span");
    numbers.className = "budget-item-numbers";
    numbers.textContent = formatCurrency(spent) + " / " + formatCurrency(budget.limit);
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn-delete";
    deleteButton.dataset.id = budget.id;
    deleteButton.textContent = "Xóa";
    head.appendChild(name);
    head.appendChild(numbers);
    head.appendChild(deleteButton);

    const track = document.createElement("div");
    track.className = "progress-container";
    const bar = document.createElement("div");
    bar.className = "progress-bar " + level;
    bar.style.width = Math.min(percent, 100) + "%";
    track.appendChild(bar);

    const meta = document.createElement("div");
    meta.className = "budget-item-meta";
    const percentText = document.createElement("span");
    percentText.textContent = percent + "% ngân sách";
    const remainText = document.createElement("span");
    remainText.className = remain >= 0 ? "ok" : "over";
    remainText.textContent = remain >= 0 ? "Còn lại: " + formatCurrency(remain) : "Vượt mức: " + formatCurrency(-remain);
    meta.appendChild(percentText);
    meta.appendChild(remainText);

    item.appendChild(head);
    item.appendChild(track);
    item.appendChild(meta);
    list.appendChild(item);
  });
}

function setupBudgetPage() {
  const list = document.getElementById("budgetList");
  const monthInput = document.getElementById("budgetMonth");
  if (!list || !monthInput) return;

  monthInput.value = getMonthString(new Date());
  monthInput.addEventListener("change", renderBudgetPage);

  list.addEventListener("click", function (event) {
    const button = event.target.closest(".btn-delete");
    if (!button) return;
    if (!confirm("Xóa hạn mức ngân sách này?")) return;
    saveBudgets(getBudgets().filter(budget => budget.id !== Number(button.dataset.id)));
    renderBudgetPage();
    showToast("Đã xóa hạn mức!");
  });

  document.getElementById("btnLoadSample").addEventListener("click", function () {
    if (confirm("Nạp dữ liệu mẫu sẽ THAY THẾ toàn bộ giao dịch và ngân sách hiện tại. Tiếp tục?")) {
      loadSampleData();
      renderBudgetPage();
      setupSavingsGoal();
      showToast("Đã nạp dữ liệu mẫu!");
    }
  });
  document.getElementById("btnClearData").addEventListener("click", function () {
    if (confirm("Xóa TOÀN BỘ giao dịch và hạn mức để bắt đầu mới? Hành động này không thể hoàn tác.")) {
      clearAllData();
      renderBudgetPage();
      setupSavingsGoal();
      showToast("Đã xóa dữ liệu. Bạn có thể bắt đầu mới!");
    }
  });

  renderBudgetPage();
}

// =========================================================================
// 9. TRANG BÁO CÁO (reports.html) - LỌC KHOẢNG NGÀY & BIỂU ĐỒ
// =========================================================================
function toCsvField(value) {
  let text = String(value === undefined || value === null ? "" : value);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function setupReportsPage() {
  const chartContainer = document.getElementById("chartContainer");
  const statsTable = document.getElementById("categoryStatsTable");
  const startDateInput = document.getElementById("reportStartDate");
  const endDateInput = document.getElementById("reportEndDate");
  if (!chartContainer || !statsTable || !startDateInput || !endDateInput) return;

  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  startDateInput.value = getMonthString(now) + "-01";
  endDateInput.value = getMonthString(now) + "-" + pad(lastDay);
  function getReportList() {
    const start = startDateInput.value;
    const end = endDateInput.value;
    return getTransactions().filter(item => {
      if (start && item.date < start) return false;
      if (end && item.date > end) return false;
      return true;
    });
  }

  function renderReport() {
    const list = getReportList();
    const expenses = list.filter(item => item.type === "expense");

    const income = sumByType(list, "income");
    const expense = sumByType(list, "expense");
    document.getElementById("reportIncome").textContent = formatCurrency(income);
    document.getElementById("reportExpense").textContent = formatCurrency(expense);
    document.getElementById("reportNet").textContent = formatCurrency(income - expense);

    const categoryMap = {};
    expenses.forEach(item => {
      if (!categoryMap[item.category]) categoryMap[item.category] = { amount: 0, count: 0 };
      categoryMap[item.category].amount += Number(item.amount);
      categoryMap[item.category].count += 1;
    });

    chartContainer.innerHTML = "";
    statsTable.innerHTML = "";

    const categories = Object.keys(categoryMap).sort((a, b) => categoryMap[b].amount - categoryMap[a].amount);
    if (categories.length === 0) {
      const empty = document.createElement("p");
      empty.className = "chart-empty";
      empty.textContent = "Chưa có dữ liệu chi tiêu trong khoảng thời gian này.";
      chartContainer.appendChild(empty);
      renderEmptyRow(statsTable, 4, "Chưa có dữ liệu.");
      return;
    }

    const maxAmount = Math.max(...categories.map(name => categoryMap[name].amount));

    categories.forEach(name => {
      const data = categoryMap[name];
      const percentage = expense > 0 ? Math.round((data.amount / expense) * 100) : 0;

      const group = document.createElement("div");
      group.className = "chart-bar-group";
      const value = document.createElement("div");
      value.className = "chart-bar-value";
      value.textContent = formatCurrency(data.amount);
      const bar = document.createElement("div");
      bar.className = "chart-bar";
      bar.style.height = Math.max(Math.round((data.amount / maxAmount) * 190), 10) + "px";
      const label = document.createElement("div");
      label.className = "chart-bar-label";
      label.textContent = name;
      group.appendChild(value);
      group.appendChild(bar);
      group.appendChild(label);
      chartContainer.appendChild(group);

      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      const strong = document.createElement("strong");
      strong.textContent = name;
      nameCell.appendChild(strong);
      row.appendChild(nameCell);
      row.appendChild(createCell(formatCurrency(data.amount), "amount-expense"));
      row.appendChild(createCell(data.count + " lần"));
      row.appendChild(createCell(percentage + "%"));
      statsTable.appendChild(row);
    });
  }

  function exportCsv() {
    const list = sortByDateDesc(getReportList());
    if (list.length === 0) {
      showToast("Chưa có giao dịch nào để xuất!", true);
      return;
    }

    const lines = ["Mã,Ngày,Tiêu đề,Loại,Danh mục,Số tiền (VNĐ),Ghi chú"];
    list.forEach(item => {
      lines.push([
        item.id,
        item.date,
        toCsvField(item.title),
        toCsvField(item.type === "income" ? "Thu nhập" : "Chi tiêu"),
        toCsvField(item.category),
        item.amount,
        toCsvField(item.note)
      ].join(","));
    });

    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Bao_Cao_Chi_Tieu_" + startDateInput.value + "_den_" + endDateInput.value + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Đã xuất " + list.length + " giao dịch ra file CSV!");
  }

  startDateInput.addEventListener("change", renderReport);
  endDateInput.addEventListener("change", renderReport);

  document.getElementById("btnReportMonth").addEventListener("click", function () {
    startDateInput.value = getMonthString(new Date()) + "-01";
    endDateInput.value = getTodayString();
    renderReport();
  });

  document.getElementById("btnReportAll").addEventListener("click", function () {
    startDateInput.value = "";
    endDateInput.value = "";
    renderReport();
  });

  document.getElementById("btnExportCSV").addEventListener("click", exportCsv);

  renderReport();
}

// =========================================================================
// 10. TÍNH NĂNG MỚI: MỤC TIÊU TIẾT KIỆM (Savings Goal)
// =========================================================================
function setupSavingsGoal() {
  const form = document.getElementById("goalForm");
  const list = document.getElementById("goalList");
  if (!form || !list) return;

  const titleInput = document.getElementById("goalTitle");
  const targetInput = document.getElementById("goalTarget");

  titleInput.addEventListener("input", () => clearError(titleInput, "goalTitleError"));
  targetInput.addEventListener("input", () => clearError(targetInput, "goalTargetError"));

  function renderGoal() {
    const goal = readStorage(KEY_GOAL, null);
    list.innerHTML = "";
    if (!goal) {
      const empty = document.createElement("p");
      empty.className = "form-hint";
      empty.textContent = "Chưa có mục tiêu nào được thiết lập.";
      list.appendChild(empty);
      return;
    }

    const transactions = getTransactions();
    const currentBalance = Math.max(0, sumByType(transactions, "income") - sumByType(transactions, "expense"));
    const percent = Math.min(Math.round((currentBalance / goal.target) * 100), 100);
    const level = percent >= 100 ? "ok" : (percent >= 50 ? "warn" : "over");

    const item = document.createElement("div");
    item.className = "budget-item";

    const head = document.createElement("div");
    head.className = "budget-item-head";
    const name = document.createElement("span");
    name.textContent = "⭐ " + goal.title;
    const numbers = document.createElement("span");
    numbers.className = "budget-item-numbers";
    numbers.textContent = formatCurrency(currentBalance) + " / " + formatCurrency(goal.target);
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-delete";
    delBtn.textContent = "Xóa";
    delBtn.addEventListener("click", function () {
      if (confirm("Xóa mục tiêu tiết kiệm này?")) {
        localStorage.removeItem(KEY_GOAL);
        renderGoal();
        showToast("Đã xóa mục tiêu!");
      }
    });
    head.appendChild(name);
    head.appendChild(numbers);
    head.appendChild(delBtn);

    const track = document.createElement("div");
    track.className = "progress-container";
    const bar = document.createElement("div");
    bar.className = "progress-bar " + level;
    bar.style.width = Math.max(0, percent) + "%";
    track.appendChild(bar);

    const meta = document.createElement("div");
    meta.className = "budget-item-meta";
    const percentText = document.createElement("span");
    percentText.textContent = "Đạt được: " + percent + "%";
    const statusText = document.createElement("span");
    statusText.className = currentBalance >= goal.target ? "ok" : "";
    statusText.textContent = currentBalance >= goal.target
      ? "🎉 Đã hoàn thành mục tiêu!"
      : "Cần thêm: " + formatCurrency(goal.target - currentBalance);
    meta.appendChild(percentText);
    meta.appendChild(statusText);

    item.appendChild(head);
    item.appendChild(track);
    item.appendChild(meta);
    list.appendChild(item);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    let isValid = true;
    const title = titleInput.value.trim();
    const target = Number(targetInput.value);

    if (title.length < 3) {
      showError(titleInput, "goalTitleError", "Vui lòng nhập tên mục tiêu (ít nhất 3 ký tự)!");
      isValid = false;
    } else {
      clearError(titleInput, "goalTitleError");
    }

    if (targetInput.value.trim() === "" || isNaN(target) || !Number.isInteger(target) || target < 500000) {
      showError(targetInput, "goalTargetError", "Số tiền mục tiêu phải là số nguyên từ 500.000 đ trở lên!");
      isValid = false;
    } else {
      clearError(targetInput, "goalTargetError");
    }

    if (!isValid) return;

    writeStorage(KEY_GOAL, { title: title, target: target });
    titleInput.value = "";
    targetInput.value = "";
    renderGoal();
    showToast("Đã lưu mục tiêu tiết kiệm!");
  });

  renderGoal();
}
// =========================================================================
// 11. KHỞI CHẠY
// =========================================================================
applyCurrentTheme();

document.addEventListener("DOMContentLoaded", function () {
  initDefaultData();
  setupThemeSystem();
  setupNavToggle();
  startRealtimeClock();
  setupSlider();
  setupDashboardPage();
  setupTransactionsPage();
  setupBudgetPage();
  setupReportsPage();
  setupSavingsGoal();
});