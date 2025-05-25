let allData = [];

async function fetchData() {
    const response = await fetch('/data');
    const result = await response.json();
    if (result.status === 'ok') {
        allData = result.data;
        renderTable(allData);
        renderCharts(allData);
    } else {
        console.error('Помилка завантаження даних:', result.message);
    }
}

function renderTable(data) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';

    data.forEach((item, index) => {
        const tr = document.createElement('tr');

        // Порядковий номер
        const idCell = document.createElement('td');
        idCell.textContent = index + 1;
        tr.appendChild(idCell);

        // Назва пристрою
        const deviceCell = document.createElement('td');
        deviceCell.textContent = `Пристрій ${index + 1}`;
        tr.appendChild(deviceCell);

        // Температура
        const tempCell = document.createElement('td');
        tempCell.textContent = item.temperature;
        tr.appendChild(tempCell);

        // Вологість
        const humCell = document.createElement('td');
        humCell.textContent = item.humidity;
        tr.appendChild(humCell);

        tbody.appendChild(tr);
    });
}

function renderCharts(data) {
    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    const ctxHum = document.getElementById('humChart').getContext('2d');

    const labels = data.map((_, i) => i + 1);
    const temps = data.map(item => item.temperature);
    const hums = data.map(item => item.humidity);

    // Якщо графіки вже є, їх треба оновити, тому збережемо їх у глобальні змінні
    if (window.tempChartInstance) window.tempChartInstance.destroy();
    if (window.humChartInstance) window.humChartInstance.destroy();

    window.tempChartInstance = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Температура (°C)',
                data: temps,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    window.humChartInstance = new Chart(ctxHum, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Вологість (%)',
                data: hums,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function applyTemperatureFilter() {
    const minTemp = parseFloat(document.getElementById('minTemp').value);
    const maxTemp = parseFloat(document.getElementById('maxTemp').value);

    let filteredData = allData;

    if (!isNaN(minTemp)) {
        filteredData = filteredData.filter(item => item.temperature >= minTemp);
    }
    if (!isNaN(maxTemp)) {
        filteredData = filteredData.filter(item => item.temperature <= maxTemp);
    }

    renderTable(filteredData);
    renderCharts(filteredData);
}

function resetFilter() {
    document.getElementById('minTemp').value = '';
    document.getElementById('maxTemp').value = '';
    renderTable(allData);
    renderCharts(allData);
}

window.onload = fetchData;
