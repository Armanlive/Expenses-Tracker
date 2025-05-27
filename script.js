let transactions = [];
    let editIndex = null;
    let currentMonth = 'all';
    let selectedRow = null; // For showing action row

    function saveTransactions() {
      localStorage.setItem('expense_transactions', JSON.stringify(transactions));
    }
    function loadTransactions() {
      const saved = localStorage.getItem('expense_transactions');
      transactions = saved ? JSON.parse(saved) : [];
    }

    function showMessage(text, type = 'success') {
      const msg = document.getElementById('message');
      msg.textContent = text;
      msg.className = `message show ${type}`;
      setTimeout(() => {
        msg.classList.remove('show');
      }, 1800);
    }

    function formatDate(dateStr) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      let day = d.getDate().toString().padStart(2, '0');
      let month = (d.getMonth() + 1).toString().padStart(2, '0');
      let year = d.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    }

    function setMaxDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const maxDate = `${yyyy}-${mm}-${dd}`;
      document.getElementById('date').setAttribute('max', maxDate);
      document.getElementById('date').value = maxDate;
    }

    function getMonths(transactions) {
      const months = new Set();
      transactions.forEach(t => {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
      });
      return Array.from(months).sort((a, b) => b.localeCompare(a));
    }

    function getMonthLabel(ym) {
      const [y, m] = ym.split('-');
      const date = new Date(y, m - 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    function getFilteredTransactions() {
      if (currentMonth === 'all') return transactions;
      return transactions.filter(t => {
        const d = new Date(t.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === currentMonth;
      });
    }

    function updateMonthFilter() {
      const monthFilter = document.getElementById('monthFilter');
      const months = getMonths(transactions);
      let options = `<option value="all">All Months</option>`;
      months.forEach(m => {
        options += `<option value="${m}">${getMonthLabel(m)}</option>`;
      });
      monthFilter.innerHTML = options;
      monthFilter.value = currentMonth;
    }

    function updateUI() {
      updateMonthFilter();
      const filtered = getFilteredTransactions();
      let balance = 0, income = 0, expense = 0;
      const tbody = document.getElementById('transaction-tbody');
      tbody.innerHTML = '';
      if (filtered.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="4" style="color:#777;font-style:italic;">Transaction History data empty</td>`;
        tbody.appendChild(tr);
      } else {
        filtered.forEach((t, i) => {
          if (t.type === 'income') {
            income += t.amount;
            balance += t.amount;
          } else {
            expense += t.amount;
            balance -= t.amount;
          }
          const tr = document.createElement('tr');
          tr.className = "main-row";
          tr.setAttribute("data-row", i);
          tr.innerHTML = `
            <td>${formatDate(t.date)}</td>
            <td>${t.desc}</td>
            <td style="color:#0a7a0a;font-weight:700;">${t.type === 'income' ? '₹' + t.amount : ''}</td>
            <td style="color:#b71c1c;font-weight:700;">${t.type === 'expense' ? '₹' + t.amount : ''}</td>
          `;
          tr.addEventListener('click', function(e){
            if (!e.target.closest('.icon-btn')) {
              selectedRow = (selectedRow === i) ? null : i;
              updateUI();
            }
          });
          tbody.appendChild(tr);

          // Show action row if selected
          if (selectedRow === i) {
            const actionTr = document.createElement('tr');
            actionTr.className = "table-action-row";
            actionTr.innerHTML = `<td colspan="4">
              <div class="action-btns">
                <button class="icon-btn edit" title="Edit" onclick="editTransaction(${transactions.indexOf(t)});event.stopPropagation();"><i class="bi bi-pencil-square"></i></button>
                <button class="icon-btn delete" title="Delete" onclick="removeTransaction(${transactions.indexOf(t)});event.stopPropagation();"><i class="bi bi-trash"></i></button>
              </div>
            </td>`;
            tbody.appendChild(actionTr);
          }
        });
      }
      document.getElementById('balance').textContent = (balance < 0 ? "₹" : "₹") + Math.abs(balance);
      document.getElementById('income').textContent = "₹" + income;
      document.getElementById('income').style.color = "#0a7a0a";
      document.getElementById('expense').textContent = "₹" + expense;
      document.getElementById('expense').style.color = "#b71c1c";
      saveTransactions();
    }

    function addTransaction(type) {
      const dateInput = document.getElementById('date');
      const date = dateInput.value;
      const desc = document.getElementById('desc').value.trim();
      const amount = parseFloat(document.getElementById('amount').value);

      const today = new Date();
      today.setHours(0,0,0,0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0,0,0,0);

      if (!date || !desc || isNaN(amount) || amount <= 0) {
        showMessage("Please enter valid date, description, and amount.", "error");
        return;
      }
      if (selectedDate > today) {
        showMessage("Future dates are not allowed.", "error");
        dateInput.value = dateInput.getAttribute('max');
        return;
      }

      if (editIndex !== null) {
        transactions[editIndex] = { date, desc, amount, type };
        if (type === "income") {
          showMessage("Edit income Successfully!", "success");
        } else {
          showMessage("Edit Expense successfully!", "success");
        }
        editIndex = null;
        document.getElementById('income-btn').textContent = "Income";
        document.getElementById('expense-btn').textContent = "Expense";
        document.getElementById('income-btn').classList.remove('active-type');
        document.getElementById('expense-btn').classList.remove('active-type');
      } else {
        transactions.push({ date, desc, amount, type });
        if (type === "income") {
          showMessage("Income added Successfully!", "success");
        } else {
          showMessage("Expense added Successfully!", "success");
        }
      }
      selectedRow = null;
      updateUI();
      document.getElementById('transaction-form').reset();
      setMaxDate();
    }

    document.getElementById('income-btn').addEventListener('click', function() {
      addTransaction('income');
      this.classList.add('active-type');
      document.getElementById('expense-btn').classList.remove('active-type');
    });

    document.getElementById('expense-btn').addEventListener('click', function() {
      addTransaction('expense');
      this.classList.add('active-type');
      document.getElementById('income-btn').classList.remove('active-type');
    });

    window.editTransaction = function(index) {
      const t = transactions[index];
      document.getElementById('date').value = t.date;
      document.getElementById('desc').value = t.desc;
      document.getElementById('amount').value = t.amount;
      editIndex = index;
      if (t.type === 'income') {
        document.getElementById('income-btn').classList.add('active-type');
        document.getElementById('expense-btn').classList.remove('active-type');
        document.getElementById('income-btn').textContent = "Update Income";
        document.getElementById('expense-btn').textContent = "Expense";
      } else {
        document.getElementById('expense-btn').classList.add('active-type');
        document.getElementById('income-btn').classList.remove('active-type');
        document.getElementById('expense-btn').textContent = "Update Expense";
        document.getElementById('income-btn').textContent = "Income";
      }
      selectedRow = null;
      updateUI();
    };

    window.removeTransaction = function(index) {
      transactions.splice(index, 1);
      showMessage("Delete Successfully!", "success");
      selectedRow = null;
      updateUI();
      if (editIndex === index) {
        document.getElementById('transaction-form').reset();
        setMaxDate();
        editIndex = null;
        document.getElementById('income-btn').textContent = "Income";
        document.getElementById('expense-btn').textContent = "Expense";
        document.getElementById('income-btn').classList.remove('active-type');
        document.getElementById('expense-btn').classList.remove('active-type');
      }
    };

    document.getElementById('exportCSV').onclick = function(e) {
      e.preventDefault();
      const filtered = getFilteredTransactions();
      if (!filtered.length) {
        showMessage("Transaction History data empty", "error");
        return;
      }
      let csv = '"Date","Description","Income","Expenses"\n';
      filtered.forEach(t => {
        const date = formatDate(t.date);
        const desc = t.desc.replace(/"/g, '""');
        const income = t.type === 'income' ? t.amount : '';
        const expense = t.type === 'expense' ? t.amount : '';
        csv += `"${date}","${desc}","${income}","${expense}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Transaction_History.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage("CSV file Created successfully!", "success");
    };

    document.getElementById('exportPDF').onclick = function(e) {
      e.preventDefault();
      const filtered = getFilteredTransactions();
      if (!filtered.length) {
        showMessage("Transaction History data empty", "error");
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Transaction History", 14, 18);
      doc.setFontSize(10);

      const headers = [["Date", "Description", "Income", "Expenses"]];
      const body = filtered.map(t => [
        formatDate(t.date),
        t.desc,
        t.type === 'income' ? t.amount : '',
        t.type === 'expense' ? t.amount : ''
      ]);

      doc.autoTable({
        head: headers,
        body: body,
        startY: 24,
        theme: 'striped',
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [20, 162, 255], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [247, 250, 253] },
        margin: { left: 10, right: 10 }
      });
      doc.save('Transaction_History.pdf');
      showMessage("PDF file Created successfully!", "success");
    };

    document.getElementById('monthFilter').addEventListener('change', function() {
      currentMonth = this.value;
      selectedRow = null;
      updateUI();
    });

    document.getElementById('exportDropdown').onclick = function(e) {
      this.classList.toggle('show');
    };
    document.addEventListener('click', function(e) {
      const dropdown = document.getElementById('exportDropdown');
      if (!dropdown.contains(e.target)) dropdown.classList.remove('show');
    });

    setMaxDate();
    loadTransactions();
    updateUI();