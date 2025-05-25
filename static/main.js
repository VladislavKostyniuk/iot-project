let data = [];
let filteredData = [];

const tempChartCtx = document.getElementById('tempChart').getContext('2d');
const humChartCtx = document.getElementById('humChart').getContext('2d');

let tempChart = new Chart(tempChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Температура (°C)',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    }
});

let humChart = new Chart(humChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Вологість (%)',
            data: [],
            borderColor: 'rgb(54, 162, 235)',
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    }
});

async function fetchData() {
    try {
        const response = await fetch('/data');
        const json = await response.json();
        if (json.status === 'ok') {
            data = json.data;
            filteredData = [...data];
            renderTable(filteredData);
            updateCharts(filteredData);
        } else {
            console.error('Помилка отримання даних:', json.message);
        }
    } catch (err) {
        console.error('Помилка fetch:', err);
    }
}

function renderTable(dataArray) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    dataArray.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>Пристрій ${item.device_id.replace(/[^0-9]/g, '') || index + 1}</td>
            <td>${item.temperature}</td>
            <td>${item.humidity}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateCharts(dataArray) {
    const labels = dataArray.map((_, i) => i + 1);
    const temps = dataArray.map(item => item.temperature);
    const hums = dataArray.map(item => item.humidity);

    tempChart.data.labels = labels;
    tempChart.data.datasets[0].data = temps;
    tempChart.update();

    humChart.data.labels = labels;
    humChart.data.datasets[0].data = hums;
    humChart.update();
}

function applyFilter() {
    const minTemp = parseFloat(document.getElementById('minTemp').value);
    const maxTemp = parseFloat(document.getElementById('maxTemp').value);
    const minHum = parseFloat(document.getElementById('minHum').value);
    const maxHum = parseFloat(document.getElementById('maxHum').value);

    filteredData = data.filter(item => {
        const tempOk = (isNaN(minTemp) || item.temperature >= minTemp) &&
            (isNaN(maxTemp) || item.temperature <= maxTemp);
        const humOk = (isNaN(minHum) || item.humidity >= minHum) &&
            (isNaN(maxHum) || item.humidity <= maxHum);
        return tempOk && humOk;
    });

    renderTable(filteredData);
    updateCharts(filteredData);
}

function resetFilter() {
    document.getElementById('minTemp').value = '';
    document.getElementById('maxTemp').value = '';
    document.getElementById('minHum').value = '';
    document.getElementById('maxHum').value = '';

    filteredData = [...data];
    renderTable(filteredData);
    updateCharts(filteredData);
}

// Автоматичне оновлення кожні 10 секунд
setInterval(fetchData, 10000);

// Перший запуск
fetchData();
