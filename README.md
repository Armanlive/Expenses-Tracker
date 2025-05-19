# 💰 Expense Tracker

A simple, client-side web application to track your income and expenses. Built with HTML, CSS, and vanilla JavaScript. Your transaction data is saved directly in your browser's Local Storage.

## Live Demo

Experience the Expense Tracker live on GitHub Pages:
[https://armanlive.github.io/Expenses-Tracker/](https://armanlive.github.io/Expenses-Tracker/)

## Features

*   **Track Balance:** See your current balance updated in real-time.
*   **View Summary:** Quickly see your total income and total expenses.
*   **Transaction History Table:** A clear table listing all your recorded transactions with date, description, income, and expense amounts.
*   **Add Transactions:** Easily add new income or expense entries by specifying the date, description, and amount.
*   **Delete Transactions:** Remove individual transactions from the history.
*   **Local Persistence:** All your transaction data is saved directly within your browser using Local Storage, so it persists even after closing and reopening the browser or refreshing the page (on the same browser and device).

## How to Use

1.  Visit the live demo link above.
2.  Under "Add New Transaction", select a **Date**, enter a **Description** (e.g., "Groceries", "Monthly Salary"), and the **Amount**.
3.  Click either the **"Income"** or **"Expense"** button.
4.  The transaction will appear in the "Transaction History" table, and your Balance, Income, and Expense summaries will update.
5.  To delete a transaction, click the **trash can icon** next to it in the history table.

**Important:** Data is stored in your browser's Local Storage. It is not backed up to a server and is only available in the specific browser you used to enter it. Clearing your browser's site data for this page will remove your transactions.

## Getting Started (For Developers)

If you want to run this project locally or contribute:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/armanlive/Expenses-Tracker.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd Expenses-Tracker
    ```
3.  **Open `index.html` in your preferred web browser.**
    *   You can typically just double-click the `index.html` file.
    *   For best practice, especially if adding more complex features later, consider using a simple local web server (e.g., Python's `http.server`, or the Live Server extension for VS Code).

## Technologies Used

*   HTML5 (Structure)
*   CSS3 (Styling)
*   JavaScript (Logic and Local Storage)
*   Font Awesome (for the trash icon)

## Credits

Developed by Arman.

## License

This project is open source and available under the [MIT License](LICENSE). *(Note: You should create a LICENSE file in your repo with the MIT license text if you want to formally apply it)*.

---

**To use this `README.md`:**

1.  Create a file named `README.md` in the root directory of your GitHub repository.
2.  Copy and paste the content above into that file.
3.  Commit and push the `README.md` file to your repository.

GitHub will automatically display the content of this file on the main page of your repository.

Let me know what small changes you'd like to make next!
