let allData = [];
let filteredData = [];
let tempChart, humChart;

async function fetchData() {
    const response = await fetch('/data?limit=50');
    const json = await response.json();
    if (json.status === 'ok') {
        allData = json.data.map((item, index) => {
            return {
                ...item,
                _customId: (index + 1).toString(),
                device_id: `Пристрій ${parseInt(item.device_id.replace('device_00', ''))}`
            };
        });
        filteredData = [...allData];
        updateTable(filteredData);
        drawCharts(filteredData);
    } else {
        alert('Помилка завантаження даних');
    }
}

function updateTable(data) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    data.forEach((item) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item._customId}</td>
            <td>${item.device_id}</td>
            <td>${item.temperature.toFixed(2)}</td>
            <td>${item.humidity.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function drawCharts(data) {
    const labels = data.map(d => new Date(parseInt(d._id.substring(0, 8), 16) * 1000).toLocaleTimeString());
    const temps = data.map(d => d.temperature);
    const hums = data.map(d => d.humidity);

    const tempCtx = document.getElementById('tempChart').getContext('2d');
    const humCtx = document.getElementById('humChart').getContext('2d');

    if (tempChart) tempChart.destroy();
    if (humChart) humChart.destroy();

    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Температура (°C)',
                data: temps,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    humChart = new Chart(humCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Вологість (%)',
                data: hums,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

function applyTemperatureFilter() {
    const minTemp = parseFloat(document.getElementById('minTemp').value);
    const maxTemp = parseFloat(document.getElementById('maxTemp').value);
    const minHum = parseFloat(document.getElementById('minHum').value);
    const maxHum = parseFloat(document.getElementById('maxHum').value);
    const deviceFilter = document.getElementById('deviceFilter').value;

    filteredData = allData.filter(item => {
        if (!isNaN(minTemp) && item.temperature < minTemp) return false;
        if (!isNaN(maxTemp) && item.temperature > maxTemp) return false;
        if (!isNaN(minHum) && item.humidity < minHum) return false;
        if (!isNaN(maxHum) && item.humidity > maxHum) return false;
        if (deviceFilter && item._customId !== deviceFilter) return false;
        return true;
    });

    updateTable(filteredData);
    drawCharts(filteredData);
}

function resetFilter() {
    document.getElementById('minTemp').value = '';
    document.getElementById('maxTemp').value = '';
    document.getElementById('minHum').value = '';
    document.getElementById('maxHum').value = '';
    document.getElementById('deviceFilter').value = '';
    filteredData = [...allData];
    updateTable(filteredData);
    drawCharts(filteredData);
}

function applyDeviceFilter() {
    applyTemperatureFilter();
}

fetchData();
setInterval(fetchData, 15000);
