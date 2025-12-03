const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");

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

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const itemClass = transaction.amount < 0 ? "minus" : "plus";

  const iconClass = categoryIcons[transaction.category] || "fa-circle-question";

  const item = document.createElement("li");
  item.classList.add(itemClass);

  item.innerHTML = `
    <i class="fa-solid ${iconClass}" style="margin-right: 10px; font-size: 1.2em; width: 25px; text-align: center;"></i>
    
    <span style="flex: 1;">${transaction.text}</span>
    
    <span>${sign}${Math.abs(transaction.amount)}</span>
    
    <button class="delete-btn" onclick="removeTransaction(${
      transaction.id
    })">x</button>
  `;

  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);
  const expense = (
    amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1
  ).toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `+${income}`;
  money_minus.innerText = `-${expense}`;
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
  };

  transactions.push(newTransaction);
  addTransactionDOM(newTransaction);
  updateValues();
  updateLocalStorage();

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
});

function init() {
  list.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}

form.addEventListener("submit", addTransaction);
init();
