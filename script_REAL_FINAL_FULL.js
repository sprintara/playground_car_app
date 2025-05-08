// Поради дължина и рестартиране на сесията, ще възстановя само работещо ядро.
// Съдържа всичко: добавяне, редакция, екстри, PDF, визуализация, localStorage

let cars = [];
let currentCarIndex = null;
let isEditing = false;

function getSelectedExtras() {
  const categories = ["komfort", "safety", "other"];
  const extras = {};
  categories.forEach(cat => {
    const checkboxes = document.querySelectorAll(`input[name="${cat}"]:checked`);
    if (checkboxes.length > 0) {
      extras[cat] = Array.from(checkboxes).map(cb => cb.value);
    }
  });
  return extras;
}

function displayCars() {
  const list = document.getElementById("carList");
  list.innerHTML = "";
  cars.forEach((car, index) => {
    const make = (typeof car.make === "string" && car.make.trim()) || "-";
    const model = (typeof car.model === "string" && car.model.trim()) || "-";
    const year = (typeof car.year === "string" || typeof car.year === "number") ? car.year : "-";
    const li = document.createElement("li");
    li.innerHTML = `${make} ${model} (${year}) <button onclick="deleteCar(${index})">🗑️</button>`;
    li.addEventListener("click", () => showCarDetails(index));
    list.appendChild(li);
  });
}

function showCarDetails(index) {
  currentCarIndex = index;
  const car = cars[index];
  const details = document.getElementById("carDetails");

  let extrasHtml = "";
  if (car.extras) {
    for (const [category, values] of Object.entries(car.extras)) {
      if (values.length > 0) {
        const title = category === "komfort" ? "Комфорт" :
                      category === "safety" ? "Безопасност" :
                      category === "other" ? "Други" : category;
        extrasHtml += `<p><strong>Секция ${title}:</strong> ${values.join(", ")}</p>`;
      }
    }
  }

  details.innerHTML = `
    <h2>${car.make} ${car.model}</h2>
    <p><strong>Година:</strong> ${car.year}</p>
    <p><strong>VIN:</strong> ${car.vin}</p>
    <p><strong>Тип каросерия:</strong> ${car.bodyType}</p>
    <p><strong>Тип двигател:</strong> ${car.engineType}</p>
    <p><strong>Цвят:</strong> ${car.color}</p>
    <p><strong>Конски сили:</strong> ${car.horsepower}</p>
    <p><strong>Скоростна кутия:</strong> ${car.transmission}</p>
    <p><strong>Държава на покупка:</strong> ${car.country}</p>
    <p><strong>Дата на покупка:</strong> ${car.purchaseDate}</p>
    <p><strong>Продавач:</strong> ${car.seller}</p>
    <p><strong>Цена:</strong> €${car.price}</p>
    <p><strong>Метод на транспорт:</strong> ${car.transport}</p>
    <p><strong>Доставено от:</strong> ${car.transportBy}</p>
    <p><strong>Дата на доставка:</strong> ${car.deliveryDate}</p>
    ${extrasHtml}
    <button id="editBtn" onclick="editCar(${index})">✏️ Редактирай</button>
  `;

  document.getElementById("expenseSection").style.display = "block";
  document.getElementById("exportBtn").style.display = "inline-block";
  displayExpenses();
}

function editCar(index) {
  const car = cars[index];
  isEditing = true;
  currentCarIndex = index;
  document.getElementById("make").value = car.make;
  document.getElementById("model").value = car.model;
  document.getElementById("year").value = car.year;
  document.getElementById("vin").value = car.vin;
  document.getElementById("bodyType").value = car.bodyType;
  document.getElementById("engineType").value = car.engineType;
  document.getElementById("color").value = car.color;
  document.getElementById("horsepower").value = car.horsepower;
  document.getElementById("transmission").value = car.transmission;
  document.getElementById("country").value = car.country;
  document.getElementById("purchaseDate").value = car.purchaseDate;
  document.getElementById("seller").value = car.seller;
  document.getElementById("price").value = car.price;
  document.getElementById("transport").value = car.transport;
  document.getElementById("transportBy").value = car.transportBy;
  document.getElementById("deliveryDate").value = car.deliveryDate;
}

document.getElementById("carForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const carData = {
    make: document.getElementById("make").value,
    model: document.getElementById("model").value,
    year: document.getElementById("year").value,
    vin: document.getElementById("vin").value,
    bodyType: document.getElementById("bodyType").value,
    engineType: document.getElementById("engineType").value,
    color: document.getElementById("color").value,
    horsepower: document.getElementById("horsepower").value,
    transmission: document.getElementById("transmission").value,
    country: document.getElementById("country").value,
    purchaseDate: document.getElementById("purchaseDate").value,
    seller: document.getElementById("seller").value,
    price: document.getElementById("price").value,
    transport: document.getElementById("transport").value,
    transportBy: document.getElementById("transportBy").value,
    deliveryDate: document.getElementById("deliveryDate").value,
    extras: getSelectedExtras(),
    expenses: isEditing ? cars[currentCarIndex].expenses : []
  };
  if (isEditing) {
    cars[currentCarIndex] = carData;
    isEditing = false;
    currentCarIndex = null;
  } else {
    cars.push(carData);
  }
  this.reset();
  displayCars();
  document.getElementById("carDetails").innerHTML = "";
  document.getElementById("expenseSection").style.display = "none";
  document.getElementById("exportBtn").style.display = "none";
  saveToStorage();
});

function deleteCar(index) {
  cars.splice(index, 1);
  displayCars();
  document.getElementById("carDetails").innerHTML = "";
  document.getElementById("expenseSection").style.display = "none";
  document.getElementById("exportBtn").style.display = "none";
  saveToStorage();
}

function displayExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";
  const car = cars[currentCarIndex];
  let total = 0;
  car.expenses.forEach(exp => {
    total += exp.amount;
    const li = document.createElement("li");
    li.textContent = `${exp.date} - ${exp.type}: €${exp.amount} (${exp.desc})`;
    list.appendChild(li);
  });
  document.getElementById("totalExpense").textContent = `Общо разходи: €${total.toFixed(2)}`;
}

document.getElementById("expenseForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const expense = {
    date: document.getElementById("expenseDate").value,
    type: document.getElementById("expenseType").value,
    desc: document.getElementById("expenseDesc").value,
    amount: parseFloat(document.getElementById("expenseAmount").value)
  };
  if (currentCarIndex !== null) {
    cars[currentCarIndex].expenses.push(expense);
    displayExpenses();
    this.reset();
    saveToStorage();
  }
});

document.getElementById("exportBtn").addEventListener("click", function () {
  if (currentCarIndex === null) return;
  const car = cars[currentCarIndex];
  const content = document.createElement("div");

  const expenseHtml = car.expenses.map(e =>
    `<li>${e.date} - ${e.type}: €${e.amount} (${e.desc})</li>`
  ).join("");

  const total = car.expenses.reduce((sum, e) => sum + e.amount, 0);

  let extrasHtml = "";
  if (car.extras) {
    for (const [category, values] of Object.entries(car.extras)) {
      if (values.length > 0) {
        const title = category === "komfort" ? "Комфорт" :
                      category === "safety" ? "Безопасност" :
                      category === "other" ? "Други" : category;
        extrasHtml += `<p><strong>Секция ${title}:</strong> ${values.join(", ")}</p>`;
      }
    }
  }

  content.innerHTML = `
    <h1>${car.make} ${car.model}</h1>
    <p><strong>Година:</strong> ${car.year}</p>
    <p><strong>VIN:</strong> ${car.vin}</p>
    <p><strong>Тип каросерия:</strong> ${car.bodyType}</p>
    <p><strong>Тип двигател:</strong> ${car.engineType}</p>
    <p><strong>Цвят:</strong> ${car.color}</p>
    <p><strong>Конски сили:</strong> ${car.horsepower}</p>
    <p><strong>Скоростна кутия:</strong> ${car.transmission}</p>
    <p><strong>Държава на покупка:</strong> ${car.country}</p>
    <p><strong>Дата на покупка:</strong> ${car.purchaseDate}</p>
    <p><strong>Продавач:</strong> ${car.seller}</p>
    <p><strong>Цена:</strong> €${car.price}</p>
    <p><strong>Метод на транспорт:</strong> ${car.transport}</p>
    <p><strong>Доставено от:</strong> ${car.transportBy}</p>
    <p><strong>Дата на доставка:</strong> ${car.deliveryDate}</p>
    ${extrasHtml}
    <h3>Разходи</h3>
    <ul>${expenseHtml}</ul>
    <p><strong>Общо разходи:</strong> €${total.toFixed(2)}</p>
  `;

  html2pdf().from(content).save(`${car.make}_${car.model}.pdf`);
});

function saveToStorage() {
  localStorage.setItem("carsData", JSON.stringify(cars));
}

function loadFromStorage() {
  const stored = localStorage.getItem("carsData");
  if (stored) {
    cars = JSON.parse(stored);
    displayCars();
  }
}

window.addEventListener("load", loadFromStorage);