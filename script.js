const balance = document.getElementById("balance");
const moneyPlus = document.getElementById("moneyPlus");
const moneyMinus = document.getElementById("moneyMinus");
const transactionBody = document.getElementById("transactionBody");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const dateInput = document.getElementById("date");
const addIncomeBtn = document.getElementById("addIncomeBtn");
const addExpenseBtn = document.getElementById("addExpenseBtn");

// IMPORTANT: Replace this with the *deployed web app URL* you get from Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwDu1WWHgLPKxTKrT59bFkXnC-2psHTk5WLAkEpqc7Qxh3RapBHvMkluFX-4jMyex6D/exec'; // <--- *** UPDATE THIS ***

let transactions = []; // Initialize as an empty array

addIncomeBtn.addEventListener("click", () => addTransaction("income"));
addExpenseBtn.addEventListener("click", () => addTransaction("expense"));

// generateID is now mainly used for *new* transactions added during the session.
// Loaded transactions get a temporary ID from doGet.
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function addTransaction(type) {
  const amountValue = parseFloat(amount.value);
  const dateValue = dateInput.value; // YYYY-MM-DD format from input

  if (text.value.trim() === '' || isNaN(amountValue) || amountValue <= 0 || dateValue.trim() === '') { // Added amount <= 0 check
    alert('Please enter a description, a positive amount, and a date.');
    return;
  }

  // Format date to DD/MM/YY for display and saving
  const [year, month, day] = dateValue.split('-');
  const formattedDateForDisplayAndSheet = `${day}/${month}/${year.slice(-2)}`;

  const transaction = {
    id: generateID(), // Generate a new ID for this client-side transaction
    text: text.value.trim(), // Trim whitespace
    amount: type === "expense" ? -Math.abs(amountValue) : Math.abs(amountValue),
    date: formattedDateForDisplayAndSheet // Use the formatted date
  };

  transactions.push(transaction); // Add to the client-side array
  sendToGoogleSheet(transaction); // Send the new transaction to Google Sheet

  // Re-render the DOM and update values
  renderTransactions(); // Renamed from init() for clarity
  updateValues();

  // Clear the form
  text.value = "";
  amount.value = "";
  dateInput.value = ""; // Clear the date input
}

function addTransactionDOM(transaction) {
  const item = document.createElement("tr");
  const isExpense = transaction.amount < 0;
  // item.classList.add(isExpense ? "expense-row" : "income-row"); // Removed this class application from JS

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    // Format with 2 decimal places only if needed, otherwise no decimals
    return absAmount % 1 === 0 ? absAmount.toFixed(0) : absAmount.toFixed(2);
  };

  // Display amount directly in the correct column without the sign
  // The sign is handled by the column and CSS color
  const displayAmount = formatAmount(transaction.amount);

  item.innerHTML = `
    <td>${transaction.date}</td>
    <td>${transaction.text}</td>
    <td class="plus">${isExpense ? '' : `₹${displayAmount}`}</td>
    <td class="minus">${isExpense ? `₹${displayAmount}` : ''}</td>
    <td><button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fas fa-trash-alt"></i></button></td>
  `;

  transactionBody.appendChild(item);
}

function removeTransaction(id) {
  // Note: This only removes the transaction from the client-side array
  // and the display. It does NOT remove it from the Google Sheet.
  // Implementing persistent deletion requires adding backend logic in code.gs
  // and calling it from here.
  transactions = transactions.filter(transaction => transaction.id !== id);

  // Re-render the DOM and update values
  renderTransactions(); // Renamed
  updateValues();
}

function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);

  const total = amounts.reduce((acc, item) => acc + item, 0);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0);
  const expense = amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0); // Keep expense as negative for total, but display as positive

  const formatSummaryAmount = (amount) => {
    // Format with 2 decimal places only if needed, otherwise no decimals
     const absAmount = Math.abs(amount); // Use absolute for display formatting
     return absAmount % 1 === 0 ? absAmount.toFixed(0) : absAmount.toFixed(2);
  };

  balance.innerText = `₹${formatSummaryAmount(total)}`; // Total can be negative, so format abs and handle sign? No, format the actual total.
  // Update formatSummaryAmount to handle negative correctly for total display if needed.
  const formattedTotal = total % 1 === 0 ? total.toFixed(0) : total.toFixed(2);
   balance.innerText = `₹${formattedTotal}`;


  moneyPlus.innerText = `₹+${formatSummaryAmount(income)}`;
  moneyMinus.innerText = `₹-${formatSummaryAmount(expense)}`; // Display absolute value of expense

  // Display "No Transactions" message if the list is empty
  if (transactions.length === 0) {
      if (!document.getElementById('noTransactionsRow')) { // Prevent adding multiple times
           const noTransRow = document.createElement('tr');
           noTransRow.id = 'noTransactionsRow';
           noTransRow.innerHTML = '<td colspan="5" style="text-align: center;">No Transactions</td>';
           transactionBody.appendChild(noTransRow);
      }
  } else {
       // Remove the "No Transactions" row if it exists and there are transactions
       const noTransRow = document.getElementById('noTransactionsRow');
       if (noTransRow) {
           noTransRow.remove();
       }
  }
}

// Renamed init to renderTransactions for better clarity on its purpose
function renderTransactions() {
  transactionBody.innerHTML = ""; // Clear current table body
  if (transactions.length > 0) {
     transactions.forEach(addTransactionDOM); // Add transactions from the array
  }
  // updateValues() is called after rendering in the main async init function
  // and also within addTransaction and removeTransaction
}


// Async function to fetch initial data and then initialize the app
async function initApp() {
    console.log('Fetching transactions...');
    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/json' }, // Headers might be restricted in no-cors mode
            mode: 'no-cors' // <<< TEMPORARY TEST
        });

        console.log('Fetch completed in no-cors mode. Response is opaque.', res);
        // You WON'T be able to read res.json() or check res.ok in no-cors mode
        // If you don't get 'TypeError: Failed to fetch' anymore, it's likely a CORS issue.
        // If you still get the error, it's a deeper network issue.

        // Since we can't read the response, we can't load actual data in this mode.
        // Just proceed with rendering empty/default state for this test.
         transactions = []; // Assume empty for this test
         renderTransactions();
         updateValues();


    } catch (error) {
        console.error('Error fetching transactions (in no-cors test):', error);
        alert('An error occurred while loading transactions even in no-cors mode. It is likely a fundamental network error.');
        transactions = [];
        renderTransactions();
        updateValues();
    }
}

function sendToGoogleSheet(transaction) {
  // Filter the transaction object to send only the data required by the sheet
  const payload = {
    date: transaction.date, // Use the DD/MM/YY format
    description: transaction.text,
    income: transaction.amount > 0 ? transaction.amount : '', // Send positive income
    expenses: transaction.amount < 0 ? Math.abs(transaction.amount) : '' // Send positive expense
  };

  console.log('Attempting to save transaction:', payload);
  console.log('Sending POST request to URL:', GOOGLE_SCRIPT_URL);

  fetch(GOOGLE_SCRIPT_URL, { // Use the deployed URL for POST
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
    // mode: 'no-cors' // Do NOT use no-cors unless specifically debugging CORS issues
  })
  .then(res => {
    console.log('Received response with status:', res.status, res.statusText);
    if (!res.ok) {
        // If the HTTP status is not OK (e.g., 400, 401, 404, 500), throw an error
        // Try to read the response body text for more info
        return res.text().then(text => {
             console.error('HTTP error response body:', text); // Log the response body
             throw new Error(`HTTP error! status: ${res.status}, body: ${text.substring(0, 200)}...`); // Include status and partial body in error
        });
    }
    // If status is OK, proceed to parse JSON
    return res.json();
  })
  .then(data => { // This block handles the JSON response from the script
    console.log('Sheet save response data:', data);
    if (data && data.success === false) { // Check if the script returned a success: false flag
        console.error('Error saving to sheet reported by script:', data.message);
        alert('Failed to save transaction to Google Sheet: ' + data.message); // Show the specific error message from the script
    } else if (data && data.success === true) {
        console.log('Transaction saved successfully to Google Sheet.');
        // Optionally provide positive feedback if needed
        // alert('Transaction saved successfully!'); // Maybe too many alerts?
    } else {
         // Handle unexpected JSON response format
         console.error('Unexpected response format from script:', data);
         alert('Received unexpected response from script. Check console for details.');
    }
  })
  .catch(err => { // This catch block handles network errors, CORS issues, or errors thrown in the .then blocks above
    console.error('Fetch or processing error during save:', err);
    alert('An error occurred while saving the transaction. Please check your internet connection, script deployment settings, and browser console.');
  });
}

// Call the async initialization function when the script loads
initApp();