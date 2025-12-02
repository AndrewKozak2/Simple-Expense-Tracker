const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");

const localStorageTransition = JSON.parse(localStorage.getItem("transactions"));

let transactions =
  localStorage.getItem("transactions") !== null ? localStorageTransition : [];

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const itemClass = transaction.amount < 0 ? "minus" : "plus";

  const item = document.createElement("li");
  item.classList.add(itemClass);

  item.innerHTML = `
    ${transaction.text}
    <span>${sign}${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${
      transaction.id
    })">x</button>
    `;

  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map((transactions) => transactions.amount);
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

function init() {
  list.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}
init();

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === "" || amount.value.trim() === "") {
    alert("Дура, введи назву та суму!");
    return;
  }

  const newTranaction = {
    id: generateID(),
    text: text.value,
    amount: +amount.value,
  };

  transactions.push(newTranaction);
  addTransactionDOM(newTranaction);
  updateValues();
  updateLocalStorage();

  text.value = "";
  amount.value = "";
}

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  init();
}

form.addEventListener("submit", addTransaction);

init();

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
