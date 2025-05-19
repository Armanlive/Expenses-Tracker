const balance = document.getElementById("balance");
const moneyPlus = document.getElementById("moneyPlus"); // Use your existing IDs
const moneyMinus = document.getElementById("moneyMinus"); // Use your existing IDs
const transactionBody = document.getElementById("transactionBody"); // Table tbody
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const dateInput = document.getElementById("date"); // Your date input
const addIncomeBtn = document.getElementById("addIncomeBtn"); // Your income button
const addExpenseBtn = document.getElementById("addExpenseBtn"); // Your expense button

// --- Local Storage Handling ---

// Check if there are transactions in local storage
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));

// Initialize transactions array: load from local storage if available, otherwise start empty
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Function to save transactions to local storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    console.log('Transactions saved to Local Storage');
}

// --- Transaction Logic ---

addIncomeBtn.addEventListener("click", () => addTransaction("income"));
addExpenseBtn.addEventListener("click", () => addTransaction("expense"));

function generateID() {
    // Generate a unique ID for each transaction
    return Math.floor(Math.random() * 100000000);
}

function addTransaction(type) {
    const amountValue = parseFloat(amount.value);
    const dateValue = dateInput.value; // YYYY-MM-DD format from input

    // Basic validation
    if (text.value.trim() === '' || isNaN(amountValue) || amountValue <= 0 || dateValue.trim() === '') {
        alert('Please enter a description, a positive amount, and a date.');
        return;
    }

    // Determine the final amount (positive for income, negative for expense)
    const finalAmount = type === "expense" ? -Math.abs(amountValue) : Math.abs(amountValue);

    // Format date for display (DD/MM/YY)
    const [year, month, day] = dateValue.split('-');
    const formattedDate = `${day}/${month}/${year.slice(-2)}`;

    const transaction = {
        id: generateID(), // Assign a unique ID
        text: text.value.trim(), // Trim whitespace from description
        amount: finalAmount,
        date: formattedDate // Store the formatted date
    };

    // Add the new transaction to the transactions array
    transactions.push(transaction);

    // --- Save to Local Storage ---
    updateLocalStorage();

    // Re-render the transaction list and update summaries
    renderTransactions(); // Use render function
    updateValues();

    // Clear the form inputs
    text.value = "";
    amount.value = "";
    dateInput.value = "";
}

// Function to remove a transaction by its ID
function removeTransaction(id) {
    // Filter out the transaction with the specified ID
    transactions = transactions.filter(transaction => transaction.id !== id);

    // --- Update Local Storage ---
    updateLocalStorage();

    // Re-render the transaction list and update summaries
    renderTransactions(); // Use render function
    updateValues();
}


// --- DOM Manipulation and Rendering ---

// Function to add a single transaction row to the table
function addTransactionDOM(transaction) {
    const item = document.createElement("tr"); // Create a table row
    const isExpense = transaction.amount < 0;

    // Optional: Add class for row styling (you can handle this in CSS)
    // item.classList.add(isExpense ? "expense-row" : "income-row");

    // Format amount for display without the sign in the table cells
    const formatAmount = (amount) => {
        const absAmount = Math.abs(amount);
        // Format with 2 decimal places only if needed, otherwise no decimals
        return absAmount % 1 === 0 ? absAmount.toFixed(0) : absAmount.toFixed(2);
    };

    const displayAmount = formatAmount(transaction.amount);

    // Populate the table row with cells (td)
    item.innerHTML = `
        <td>${transaction.date}</td>
        <td>${transaction.text}</td>
        <td class="plus">${isExpense ? '' : `₹${displayAmount}`}</td>
        <td class="minus">${isExpense ? `₹${displayAmount}` : ''}</td>
        <td><button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fas fa-trash-alt"></i></button></td>
    `;

    // Append the new row to the table body
    transactionBody.appendChild(item);
}

// Function to update the balance, income, and expense display
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    const total = amounts.reduce((acc, item) => acc + item, 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0); // Keep as negative for total, but display absolute

    // Helper to format summary amounts (Balance, Income, Expense totals)
    const formatSummaryAmount = (amount) => {
        // Format with 2 decimal places only if needed, otherwise no decimals
        const absAmount = Math.abs(amount);
        return absAmount % 1 === 0 ? absAmount.toFixed(0) : absAmount.toFixed(2);
    };

    // Update display elements
    // Ensure total formatting includes sign if needed
    const formattedTotal = total % 1 === 0 ? total.toFixed(0) : total.toFixed(2);
    balance.innerText = `₹${formattedTotal}`;


    moneyPlus.innerText = `₹+${formatSummaryAmount(income)}`;
    moneyMinus.innerText = `₹-${formatSummaryAmount(expense)}`; // Display absolute value of expense

    // Display "No Transactions" message if the list is empty
    if (transactions.length === 0) {
        // Check if the "No Transactions" row already exists
        if (!document.getElementById('noTransactionsRow')) {
             const noTransRow = document.createElement('tr');
             noTransRow.id = 'noTransactionsRow'; // Add an ID for easy selection
             noTransRow.innerHTML = '<td colspan="5" style="text-align: center;">No Transactions</td>';
             transactionBody.appendChild(noTransRow);
        }
    } else {
        // If there are transactions, remove the "No Transactions" row if it exists
        const noTransRow = document.getElementById('noTransactionsRow');
        if (noTransRow) {
            noTransRow.remove();
        }
    }
}

// Function to clear the table body and render all transactions from the array
function renderTransactions() {
    transactionBody.innerHTML = ""; // Clear current table body

    // Add transactions from the array to the DOM
    transactions.forEach(addTransactionDOM);

    // Note: updateValues is called separately after rendering to handle the "No Transactions" message
}


// --- Initialization ---

// Initialize the app by loading from local storage and rendering
function init() {
    console.log('Initializing app and loading from Local Storage...');
    renderTransactions(); // Render transactions loaded from LS
    updateValues();       // Update the summary values and "No Transactions" message
}

// Call the initialization function when the script loads
init();
