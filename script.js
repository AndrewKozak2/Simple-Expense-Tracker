const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const currencyEl = document.getElementById("currency-selector");
let savedCurrency = localStorage.getItem("currency");
if (
  savedCurrency !== "UAH" &&
  savedCurrency !== "USD" &&
  savedCurrency !== "EUR"
) {
  savedCurrency = "UAH";
}

let selectedCurrency = savedCurrency;
currencyEl.value = selectedCurrency;

const categoryIcons = {
  food: "fa-burger",
  transport: "fa-car",
  shopping: "fa-bag-shopping",
  entertainment: "fa-film",
  home: "fa-house",
  salary: "fa-money-bill-wave",
  uncategorized: "fa-circle-question",
};

const localStorageTransactions = JSON.parse(
  localStorage.getItem("transactions")
);
let transactions =
  localStorage.getItem("transactions") !== null ? localStorageTransactions : [];

function formatDate(dateString) {
  if (!dateString) return "Раніше";

  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isYesterday =
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Сьогодні";
  if (isYesterday) return "Вчора";

  return date.toLocaleDateString("uk-UA");
}

function renderHistory() {
  list.innerHTML = "";

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date || 0) - new Date(a.date || 0);
  });

  let lastDateHeader = null;

  sortedTransactions.forEach((transaction) => {
    const dateLabel = formatDate(transaction.date);

    if (dateLabel !== lastDateHeader) {
      const header = document.createElement("div");
      header.classList.add("date-header");
      header.innerText = dateLabel;
      list.appendChild(header);
      lastDateHeader = dateLabel;
    }

    const sign = transaction.amount < 0 ? "-" : "+";
    const itemClass = transaction.amount < 0 ? "minus" : "plus";
    const iconClass =
      categoryIcons[transaction.category] || "fa-circle-question";
    const formattedAmount = formatMoney(Math.abs(transaction.amount));

    const item = document.createElement("li");
    item.classList.add(itemClass);
    item.innerHTML = `
      <i class="fa-solid ${iconClass}" style="font-size: 20px; width: 30px; text-align: center; color: var(--text-secondary);"></i>
      <div class="transaction-info">
          <span class="t-name">${transaction.text}</span>
          <span class="t-amount">${sign}${formattedAmount}</span>
      </div>
      
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    list.appendChild(item);
  });
}

function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0);
  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0);
  const expense = amounts
    .filter((item) => item < 0)
    .reduce((acc, item) => (acc += item), 0);

  balance.innerText = formatMoney(total);
  money_plus.innerText = formatMoney(income);
  money_minus.innerText = formatMoney(expense);
}

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === "" || amount.value.trim() === "") {
    alert("Будь ласка, введіть назву та суму!");
    return;
  }

  const checkedCategory = document.querySelector(
    'input[name="category"]:checked'
  );
  const categoryValue = checkedCategory
    ? checkedCategory.value
    : "uncategorized";

  const newTransaction = {
    id: generateID(),
    text: text.value,
    amount: +amount.value,
    category: categoryValue,
    date: new Date(),
  };

  transactions.push(newTransaction);
  renderHistory();
  updateValues();
  updateLocalStorage();
  renderChart();

  text.value = "";
  amount.value = "";

  const defaultRadio = document.getElementById("cat-food");
  if (defaultRadio) defaultRadio.checked = true;
}

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  init();
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = themeToggleBtn.querySelector("i");
const body = document.body;
const savedTheme = localStorage.getItem("theme");

function updateIcon(isLight) {
  if (isLight) {
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  } else {
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }
}

if (savedTheme === "light") {
  body.classList.add("light-mode");
  updateIcon(true);
}

themeToggleBtn.addEventListener("click", () => {
  body.classList.toggle("light-mode");
  const isLightMode = body.classList.contains("light-mode");
  updateIcon(isLightMode);
  localStorage.setItem("theme", isLightMode ? "light" : "dark");
  renderChart();
});

function init() {
  renderHistory();
  updateValues();
  renderChart();
}

form.addEventListener("submit", addTransaction);

let myChart = null;
function renderChart() {
  const chartCanvas = document.getElementById("expenseChart");
  const chartContainer = document.querySelector(".chart-container");
  const ctx = chartCanvas.getContext("2d");

  const categoriesTotal = {};

  transactions.forEach((transaction) => {
    if (transaction.amount < 0) {
      const cat = transaction.category;
      const amount = Math.abs(transaction.amount);
      if (categoriesTotal[cat]) {
        categoriesTotal[cat] += amount;
      } else {
        categoriesTotal[cat] = amount;
      }
    }
  });

  if (Object.keys(categoriesTotal).length === 0) {
    chartContainer.style.display = "none";
    if (myChart) {
      myChart.destroy();
      myChart = null;
    }
    return;
  } else {
    chartContainer.style.display = "block";
  }

  const chartLabels = Object.keys(categoriesTotal).map((cat) => {
    const names = {
      food: "Їжа 🍔",
      transport: "Авто 🚗",
      shopping: "Шопінг 🛍️",
      entertainment: "Розваги 🎬",
      home: "Дім 🏠",
      salary: "Зарплата 💰",
      uncategorized: "Інше ❓",
    };
    return names[cat] || cat;
  });
  const chartData = Object.values(categoriesTotal);

  const chartColors = [
    "#ff6384",
    "#36a2eb",
    "#ffcd56",
    "#4bc0c0",
    "#9966ff",
    "#ff9f40",
    "#c9cbcf",
  ];

  if (myChart) {
    myChart.destroy();
  }

  const isLight = document.body.classList.contains("light-mode");
  const textColor = isLight ? "#333333" : "#e0e0e0";

  myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: "Сума",
          data: chartData,
          backgroundColor: chartColors,
          borderWidth: 0,
          borderColor: "transparent",
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            font: {
              size: 14,
              family: "'Roboto', sans-serif",
            },
            padding: 20,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: isLight ? "#fff" : "#333",
          titleColor: isLight ? "#000" : "#fff",
          bodyColor: isLight ? "#000" : "#fff",
          borderColor: isLight ? "#ddd" : "#555",
          borderWidth: 1,
        },
      },
      layout: {
        padding: 10,
      },
    },
  });
}

function formatMoney(number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: selectedCurrency,
    minimumFractionDigits: 2,
  }).format(number);
}

currencyEl.addEventListener("change", (e) => {
  selectedCurrency = e.target.value;
  localStorage.setItem("currency", selectedCurrency);
  init();
});
init();
