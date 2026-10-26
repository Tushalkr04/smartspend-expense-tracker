
/* ==========================================
   SMARTSPEND - PERSONAL EXPENSE TRACKER
   Complete JavaScript (Light Theme)
========================================== */


// 1. Get HTML elements easily

function get(id) {
    return document.getElementById(id);
}


// 2. Transaction Categories

const expenseCategories = [
    "Food",
    "Transport",
    "Shopping",
    "Education",
    "Bills",
    "Health",
    "Entertainment",
    "Other"
];

const incomeCategories = [
    "Allowance",
    "Salary",
    "Freelance",
    "Gift",
    "Other"
];


// 3. Load saved transactions from localStorage

let transactions = [];

try {
    const savedData = JSON.parse(
        localStorage.getItem("smartspend_transactions") || "[]"
    );

    transactions = Array.isArray(savedData) ? savedData : [];

} catch (error) {
    transactions = [];
}


// Load saved budget

let budget = Number(
    localStorage.getItem("smartspend_budget")
) || 0;


// Chart variable

let chart = null;


// 4. Format numbers into Indian Rupees

function money(amount) {

    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


// 5. Save transactions in browser

function saveTransactions() {

    localStorage.setItem(
        "smartspend_transactions",
        JSON.stringify(transactions)
    );

}


// 6. Update category dropdown based on transaction type

function updateCategories() {

    let type = get("transactionType").value;

    let categories;

    if (type === "income") {
        categories = incomeCategories;
    } else {
        categories = expenseCategories;
    }

    get("category").innerHTML = "";

    categories.forEach(function(category) {

        let option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        get("category").appendChild(option);

    });

}


// 7. Calculate total income and expenses

function updateDashboard() {

    let income = 0;
    let expense = 0;

    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            income += transaction.amount;

        } else if (transaction.type === "expense") {

            expense += transaction.amount;

        }

    });


    // Calculate current balance

    let balance = income - expense;


    // Display dashboard values

    get("incomeTotal").textContent = money(income);

    get("expenseTotal").textContent = money(expense);

    get("balanceTotal").textContent = money(balance);


    // Update other sections

    updateBudget();

    updateChart();

    displayTransactions();

}


// 8. Monthly Budget Tracker

function updateBudget() {

    // Calculate expenses for the current month

    let currentMonth = new Date().toLocaleDateString("en-CA").slice(0, 7);

    let totalExpense = 0;

    transactions.forEach(function(transaction) {

        if (
            transaction.type === "expense" &&
            transaction.date.slice(0, 7) === currentMonth
        ) {

            totalExpense += transaction.amount;

        }

    });


    // Display budget information

    get("budgetSpent").textContent =
        money(totalExpense) + " Spent";

    get("budgetLimit").textContent =
        "of " + money(budget);


    // Calculate budget percentage

    let percentage = 0;

    if (budget > 0) {
        percentage = (totalExpense / budget) * 100;
    }


    // Update progress bar

    get("budgetProgress").style.width =
        Math.min(percentage, 100) + "%";


    // Display budget status

    if (budget === 0) {

        get("budgetMessage").textContent =
            "Set a budget to track your spending.";

        get("budgetProgress").style.background =
            "#2563eb";

    } else if (totalExpense > budget) {

        get("budgetMessage").textContent =
            "You are over budget by " +
            money(totalExpense - budget);

        get("budgetProgress").style.background =
            "#ef4444";

    } else {

        get("budgetMessage").textContent =
            "Remaining Budget: " +
            money(budget - totalExpense) +
            " (" + Math.round(percentage) + "% used)";

        get("budgetProgress").style.background =
            "#2563eb";

    }


    // Display saved budget in input

    get("budgetInput").value = budget || "";

}


// 9. Display Transaction History

function displayTransactions() {

    let table = get("transactionRows");

    table.innerHTML = "";


    // Get selected filters

    let selectedType = get("typeFilter").value;

    let selectedCategory = get("categoryFilter").value;


    // Get unique categories

    let allCategories = [
        ...new Set(
            transactions.map(function(t) {
                return t.category;
            })
        )
    ];


    // Update category filter dropdown

    get("categoryFilter").innerHTML =
        '<option value="all">All Categories</option>';

    allCategories.forEach(function(category) {

        let option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        get("categoryFilter").appendChild(option);

    });


    // Restore selected category

    if (allCategories.includes(selectedCategory)) {

        get("categoryFilter").value = selectedCategory;

    } else {

        selectedCategory = "all";

    }


    // Filter transactions

    let filtered = transactions.filter(function(t) {

        let typeMatch =
            selectedType === "all" ||
            t.type === selectedType;

        let categoryMatch =
            selectedCategory === "all" ||
            t.category === selectedCategory;

        return typeMatch && categoryMatch;

    });


    // Show latest transactions first

    filtered.sort(function(a, b) {

        return b.date.localeCompare(a.date);

    });


    // Create transaction rows

    filtered.forEach(function(t) {

        let row = document.createElement("tr");


        // Amount color

        let amountClass =
            t.type === "income" ? "plus" : "minus";


        // Amount sign

        let amountSign =
            t.type === "income" ? "+" : "-";


        // Transaction values

        let values = [
            t.description,
            t.category,
            t.date,
            t.type === "income" ? "Income" : "Expense",
            amountSign + money(t.amount)
        ];


        // Create table cells safely

        values.forEach(function(value, index) {

            let cell = document.createElement("td");

            cell.textContent = value;

            if (index === 4) {
                cell.className = amountClass;
            }

            row.appendChild(cell);

        });


        // Delete button

        let actionCell = document.createElement("td");

        let deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";

        deleteButton.textContent = "Delete";


        // Delete transaction when clicked

        deleteButton.addEventListener("click", function() {

            deleteTransaction(t.id);

        });


        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        table.appendChild(row);

    });


    // Display message if no transactions are found

    get("transactionEmpty").hidden =
        filtered.length > 0;

}


// 10. Delete Transaction

function deleteTransaction(id) {

    let confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (confirmDelete) {

        transactions = transactions.filter(function(t) {

            return t.id !== id;

        });


        // Save updated data

        saveTransactions();


        // Refresh dashboard

        updateDashboard();

    }

}


// 11. Expense Chart (Professional Light Theme)

function updateChart() {

    let categoryTotals = {};


    // Calculate total expense for each category

    transactions.forEach(function(t) {

        if (t.type === "expense") {

            if (!categoryTotals[t.category]) {

                categoryTotals[t.category] = 0;

            }

            categoryTotals[t.category] += t.amount;

        }

    });


    // Get chart labels and values

    let labels = Object.keys(categoryTotals);

    let values = Object.values(categoryTotals);


    // Destroy old chart before creating a new one

    if (chart !== null) {

        chart.destroy();

        chart = null;

    }


    // Show empty message if no expenses exist

    if (labels.length === 0) {

        get("expenseChart").hidden = true;

        get("chartEmpty").hidden = false;

        get("chartEmpty").textContent =
            "Add an expense to see your chart.";

        return;

    }


    // Check whether Chart.js is available

    if (typeof Chart === "undefined") {

        get("expenseChart").hidden = true;

        get("chartEmpty").hidden = false;

        get("chartEmpty").textContent =
            "Chart unavailable. Check your internet connection.";

        return;

    }


    // Show chart

    get("expenseChart").hidden = false;

    get("chartEmpty").hidden = true;


    // Create doughnut chart

    chart = new Chart(get("expenseChart"), {

        type: "doughnut",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: [
                    "#2563eb",  // Blue
                    "#10b981",  // Green
                    "#f59e0b",  // Orange
                    "#ef4444",  // Red
                    "#8b5cf6",  // Purple
                    "#06b6d4",  // Cyan
                    "#ec4899",  // Pink
                    "#94a3b8"   // Grey
                ],

                borderColor: "#ffffff",

                borderWidth: 4,

                hoverOffset: 8

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "68%",

            plugins: {

                legend: {

                    position: "right",

                    labels: {

                        color: "#64748b",

                        boxWidth: 12,

                        padding: 15,

                        font: {
                            size: 11,
                            family: "Inter"
                        }

                    }

                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return context.label +
                                ": " + money(context.raw);

                        }

                    }

                }

            }

        }

    });

}


// 12. Open Add Transaction Popup

get("addButton").addEventListener("click", function() {

    // Reset form

    get("transactionForm").reset();


    // Set today's date automatically

    let today = new Date();

    let year = today.getFullYear();

    let month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    let day = String(
        today.getDate()
    ).padStart(2, "0");

    get("date").value =
        year + "-" + month + "-" + day;


    // Update category dropdown

    updateCategories();


    // Open popup

    get("transactionDialog").showModal();

});


// 13. Close Transaction Popup

get("closeDialog").addEventListener("click", function() {

    get("transactionDialog").close();

});


// 14. Change Categories When Type Changes

get("transactionType").addEventListener(
    "change",
    updateCategories
);


// 15. Add New Transaction

get("transactionForm").addEventListener(
    "submit",
    function(event) {

        // Prevent page refresh

        event.preventDefault();


        // Get form values

        let description = get("description").value.trim();

        let amount = Number(get("amount").value);

        let type = get("transactionType").value;

        let category = get("category").value;

        let date = get("date").value;


        // Validate input

        if (
            description === "" ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            date === ""
        ) {

            alert("Please enter valid transaction details.");

            return;

        }


        // Create transaction object

        let newTransaction = {

            id: Date.now() + Math.random(),

            description: description,

            amount: amount,

            type: type,

            category: category,

            date: date

        };


        // Add transaction to array

        transactions.push(newTransaction);


        // Save to localStorage

        saveTransactions();


        // Update dashboard

        updateDashboard();


        // Close popup

        get("transactionDialog").close();

    }
);


// 16. Set Monthly Budget

get("budgetForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        // Get budget amount

        let newBudget = Number(
            get("budgetInput").value
        );


        // Validate budget

        if (
            !Number.isFinite(newBudget) ||
            newBudget <= 0
        ) {

            alert("Please enter a valid budget.");

            return;

        }


        // Update budget

        budget = newBudget;


        // Save budget in localStorage

        localStorage.setItem(
            "smartspend_budget",
            String(budget)
        );


        // Refresh budget section

        updateBudget();

    }
);


// 17. Transaction Filters

get("typeFilter").addEventListener(
    "change",
    displayTransactions
);

get("categoryFilter").addEventListener(
    "change",
    displayTransactions
);


// 18. Start SmartSpend Application

updateCategories();

updateDashboard();

