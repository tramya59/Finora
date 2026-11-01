/**
 * Finora - validation.js
 * FORM 1: Thêm / sửa giao dịch (add-transaction.html) - đủ 7 loại input, validation JS.
 * FORM 3: Thiết lập ngân sách (budget.html).
 * Dùng các hàm dùng chung trong main.js: showError, clearError, showToast, getTransactions...
 */

/** Danh mục hợp lệ theo loại giao dịch: "Lương" chỉ dành cho thu nhập. */
function getAllowedCategories(type) {
  switch (type) {
    case "income":
      return ["Lương", "Khác"];
    case "expense":
      return ["Ăn uống", "Học tập", "Nhà ở", "Di chuyển", "Mua sắm", "Khác"];
    default:
      return [];
  }
}


// FORM THÊM / SỬA GIAO DỊCH
function setupTransactionForm() {
  const form = document.getElementById("transactionForm");
  if (!form) return;

  const titleInput = document.getElementById("transTitle");
  const amountInput = document.getElementById("transAmount");
  const categoryInput = document.getElementById("transCategory");
  const dateInput = document.getElementById("transDate");
  const noteInput = document.getElementById("transNote");
  const recurringInput = document.getElementById("isRecurring");
  const formTitle = document.querySelector(".form-title");
  const submitButton = form.querySelector(".btn-submit");

  const today = getTodayString();
  dateInput.max = today;     // không cho chọn ngày tương lai
  dateInput.value = today;

  function getSelectedType() {
    return form.querySelector('input[name="transactionType"]:checked').value;
  }

  /** Chỉ cho chọn các danh mục phù hợp với loại thu/chi đang chọn. */
  function syncCategoryOptions() {
    const allowed = getAllowedCategories(getSelectedType());
    Array.from(categoryInput.options).forEach(option => {
      if (option.value === "") return; // giữ dòng "-- Chọn danh mục --"
      const isAllowed = allowed.includes(option.value);
      option.disabled = !isAllowed;
      option.hidden = !isAllowed;
    });
    if (categoryInput.value && !allowed.includes(categoryInput.value)) categoryInput.value = "";
  }

  // --- Chế độ SỬA (Update trong CRUD): trang được mở với ?editId=... ---
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("editId") ? Number(params.get("editId")) : null;
  let editingTransaction = null;

  if (editId) {
    editingTransaction = getTransactions().find(item => item.id === editId) || null;
    if (editingTransaction) {
      formTitle.textContent = "Chỉnh Sửa Giao Dịch";
      submitButton.textContent = "💾 Cập Nhật Giao Dịch";
      form.querySelector('input[name="transactionType"][value="' + editingTransaction.type + '"]').checked = true;
      syncCategoryOptions();
      titleInput.value = editingTransaction.title;
      amountInput.value = editingTransaction.amount;
      categoryInput.value = editingTransaction.category;
      dateInput.value = editingTransaction.date;
      noteInput.value = editingTransaction.note || "";
      recurringInput.checked = Boolean(editingTransaction.isRecurring);
    } else {
      showToast("Không tìm thấy giao dịch cần sửa!", true);
    }
  }
  syncCategoryOptions();

  // Tự động xóa lỗi khi người dùng nhập lại (sự kiện input / change)
  titleInput.addEventListener("input", () => clearError(titleInput, "transTitleError"));
  amountInput.addEventListener("input", () => clearError(amountInput, "transAmountError"));
  categoryInput.addEventListener("change", () => clearError(categoryInput, "transCategoryError"));
  dateInput.addEventListener("change", () => clearError(dateInput, "transDateError"));
  noteInput.addEventListener("input", () => clearError(noteInput, "transNoteError"));
  form.querySelectorAll('input[name="transactionType"]').forEach(radio => {
    radio.addEventListener("change", function () {
      syncCategoryOptions();
      clearError(categoryInput, "transCategoryError");
    });
  });

  // --- Kiểm tra từng trường; trả về true nếu hợp lệ ---
  function validateTitle() {
    const value = titleInput.value.trim();
    if (value === "") {
      showError(titleInput, "transTitleError", "Tiêu đề giao dịch không được để trống!");
    } else if (value.length < 6) {
      showError(titleInput, "transTitleError", "Tiêu đề phải có ít nhất 6 ký tự (VD: Ăn sáng)!");
    } else if (value.length > 80) {
      showError(titleInput, "transTitleError", "Tiêu đề không được dài quá 80 ký tự!");
    } else {
      clearError(titleInput, "transTitleError");
      return true;
    }
    return false;
  }

  function validateAmount() {
    const raw = amountInput.value.trim();
    const value = Number(raw);
    if (raw === "" || isNaN(value)) {
      showError(amountInput, "transAmountError", "Vui lòng nhập số tiền hợp lệ!");
    } else if (!Number.isInteger(value)) {
      showError(amountInput, "transAmountError", "Số tiền phải là số nguyên (đơn vị VNĐ)!");
    } else if (value < 1000) {
      showError(amountInput, "transAmountError", "Số tiền tối thiểu là 1.000 đ!");
    } else if (value > 100000000000) {
      showError(amountInput, "transAmountError", "Số tiền quá lớn (tối đa 100 tỷ đ)!");
    } else {
      clearError(amountInput, "transAmountError");
      return true;
    }
    return false;
  }

  function validateCategory() {
    if (categoryInput.value === "") {
      showError(categoryInput, "transCategoryError", "Vui lòng chọn danh mục phù hợp!");
      return false;
    }
    if (!getAllowedCategories(getSelectedType()).includes(categoryInput.value)) {
      showError(categoryInput, "transCategoryError", "Danh mục này không phù hợp với loại giao dịch đã chọn!");
      return false;
    }
    clearError(categoryInput, "transCategoryError");
    return true;
  }

  function validateDate() {
    if (!dateInput.value) {
      showError(dateInput, "transDateError", "Vui lòng chọn ngày giao dịch!");
    } else if (isNaN(new Date(dateInput.value).getTime())) {
      showError(dateInput, "transDateError", "Ngày giao dịch không hợp lệ!");
    } else if (dateInput.value > today) {
      showError(dateInput, "transDateError", "Không thể chọn ngày trong tương lai!");
    } else if (dateInput.value < "2000-01-01") {
      showError(dateInput, "transDateError", "Ngày giao dịch phải từ năm 2000 trở đi!");
    } else {
      clearError(dateInput, "transDateError");
      return true;
    }
    return false;
  }

  function validateNote() {
    if (noteInput.value.trim().length > 200) {
      showError(noteInput, "transNoteError", "Ghi chú không được dài quá 200 ký tự!");
      return false;
    }
    clearError(noteInput, "transNoteError");
    return true;
  }

  // --- Sự kiện SUBMIT ---
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // chặn tải lại trang

    // Chạy đủ mọi hàm kiểm tra (không dừng ở lỗi đầu tiên) để hiện hết lỗi cùng lúc
    const results = [validateTitle(), validateAmount(), validateCategory(), validateDate(), validateNote()];
    if (results.includes(false)) return;

    const data = {
      title: titleInput.value.trim(),
      amount: Number(amountInput.value),
      type: getSelectedType(),
      category: categoryInput.value,
      date: dateInput.value,
      note: noteInput.value.trim(),
      isRecurring: recurringInput.checked
    };
    const transactions = getTransactions();

    if (editingTransaction) {
      // CẬP NHẬT giao dịch cũ (giữ nguyên id)
      const updated = transactions.map(item => item.id === editingTransaction.id ? { ...item, ...data } : item);
      saveTransactions(updated);
      showToast("Đã cập nhật giao dịch thành công!");
      setTimeout(() => { window.location.href = "transactions.html"; }, 1200);
    } else {
      // THÊM giao dịch mới
      transactions.push({ id: Date.now(), ...data });
      saveTransactions(transactions);
      showToast("Đã lưu giao dịch thành công!");
      form.reset();
      dateInput.value = today;
      syncCategoryOptions();
    }
  });
}

/*
// FORM THIẾT LẬP NGÂN SÁCH (tháng + danh mục + hạn mức)
*/
function setupBudgetForm() {
  const form = document.getElementById("budgetForm");
  if (!form) return;

  const monthInput = document.getElementById("budgetMonth");
  const categoryInput = document.getElementById("budgetCategory");
  const limitInput = document.getElementById("budgetInput");

  monthInput.addEventListener("change", () => clearError(monthInput, "budgetMonthError"));
  categoryInput.addEventListener("change", () => clearError(categoryInput, "budgetCategoryError"));
  limitInput.addEventListener("input", () => clearError(limitInput, "budgetInputError"));

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    let isValid = true;

    // Tháng: bắt buộc, đúng dạng YYYY-MM
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthInput.value)) {
      showError(monthInput, "budgetMonthError", "Vui lòng chọn tháng ngân sách!");
      isValid = false;
    } else {
      clearError(monthInput, "budgetMonthError");
    }

    // Danh mục: bắt buộc
    if (categoryInput.value === "") {
      showError(categoryInput, "budgetCategoryError", "Vui lòng chọn danh mục!");
      isValid = false;
    } else {
      clearError(categoryInput, "budgetCategoryError");
    }

    // Hạn mức: số nguyên >= 100.000
    const limit = Number(limitInput.value);
    if (limitInput.value.trim() === "" || isNaN(limit) || !Number.isInteger(limit) || limit < 100000) {
      showError(limitInput, "budgetInputError", "Hạn mức phải là số nguyên lớn hơn hoặc bằng 100.000 đ!");
      isValid = false;
    } else if (limit > 100000000000) {
      showError(limitInput, "budgetInputError", "Hạn mức quá lớn (tối đa 100 tỷ đ)!");
      isValid = false;
    } else {
      clearError(limitInput, "budgetInputError");
    }

    if (!isValid) return;

    // Mỗi (tháng + danh mục) chỉ có 1 hạn mức: đã có thì cập nhật, chưa có thì thêm mới
    const budgets = getBudgets();
    const existing = budgets.find(b => b.month === monthInput.value && b.category === categoryInput.value);
    if (existing) {
      existing.limit = limit;
    } else {
      budgets.push({ id: Date.now(), month: monthInput.value, category: categoryInput.value, limit: limit });
    }
    saveBudgets(budgets);

    limitInput.value = "";
    renderBudgetPage(); // hàm trong main.js: vẽ lại danh sách ngân sách
    showToast(existing ? "Đã cập nhật hạn mức!" : "Đã lưu hạn mức ngân sách!");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupTransactionForm();
  setupBudgetForm();
});
