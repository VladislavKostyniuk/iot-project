// Дані IoT-пристроїв (приклад)
const iotData = [
    // Приклад записів, де є timestamp, device, temperature, humidity
    { device: 'Device 1', temperature: 22.5, humidity: 45, timestamp: '2025-05-30T10:00:00Z' },
    { device: 'Device 2', temperature: 23.1, humidity: 43, timestamp: '2025-05-30T10:05:00Z' },
    { device: 'Device 1', temperature: 22.7, humidity: 46, timestamp: '2025-05-30T10:10:00Z' },
    // ...
];

// Функція рендерингу таблиці (без колонки Час)
function renderTable(data) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';

    data.forEach(entry => {
        const row = document.createElement('tr');

        // Колонка "Пристрій"
        const deviceCell = document.createElement('td');
        deviceCell.textContent = entry.device;
        row.appendChild(deviceCell);

        // Колонка "Температура"
        const tempCell = document.createElement('td');
        tempCell.textContent = entry.temperature.toFixed(1);
        row.appendChild(tempCell);

        // Колонка "Вологість"
        const humidityCell = document.createElement('td');
        humidityCell.textContent = entry.humidity.toFixed(1);
        row.appendChild(humidityCell);

        tableBody.appendChild(row);
    });
}

// Функція рендерингу графіка за допомогою Chart.js
function renderChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Відсортуємо дані за часом (щоб графік був коректним)
    const sortedData = data.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedData.map(entry => {
        const d = new Date(entry.timestamp);
        // Формат для підписів (можна змінити під свої потреби)
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const temperatures = sortedData.map(entry => entry.temperature);
    const humidities = sortedData.map(entry => entry.humidity);

    // Якщо графік вже існує — видаляємо старий (щоб оновити)
    if (window.myChartInstance) {
        window.myChartInstance.destroy();
    }

    window.myChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Температура (°C)',
                    data: temperatures,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.3,
                },
                {
                    label: 'Вологість (%)',
                    data: humidities,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false,
                    tension: 0.3,
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

// Початковий рендер
renderTable(iotData);
renderChart(iotData);
  