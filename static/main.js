let chart;
let data = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 10000); // оновлення кожні 10 секунд
    document.getElementById('idSearch').addEventListener('input', applyFilters);
    setInterval(updateTimes, 1000); // оновлюємо час у таблиці щосекунди
});

function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(result => {
            if (result.status === 'ok') {
                data = result.data.map((entry, index) => {
                    if (!entry.device_id) {
                        entry.device_id = "device_" + (index + 1);
                    }
                    return entry;
                });
                applyFilters();
            } else {
                console.error('Помилка отримання даних:', result.message);
            }
        })
        .catch(err => console.error('Помилка fetch:', err));
}

function applyFilters() {
    const idSearchValue = document.getElementById('idSearch').value.trim().toLowerCase();

    let filtered = data;
    if (idSearchValue !== '') {
        filtered = filtered.filter(entry => entry._id.toLowerCase().includes(idSearchValue));
    }

    renderTable(filtered);
    renderChart(filtered);
}

let displayedData = [];

function renderTable(dataToRender) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    displayedData = dataToRender;

    dataToRender.forEach((entry, index) => {
        const temp = entry.temperature !== undefined ? entry.temperature.toFixed(1) : '-';
        const hum = entry.humidity !== undefined ? entry.humidity.toFixed(1) : '-';

        const timeCellId = `time-${index}`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry._id}</td>
            <td>${entry.device_id}</td>
            <td>${temp}</td>
            <td>${hum}</td>
            <td id="${timeCellId}">${formatTimeRelative(entry.timestamp)}</td>
        `;
        tbody.appendChild(row);
    });
}

function formatTimeRelative(timestamp) {
    if (!timestamp) return '-';
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    if (diff < 1000) return 'щойно';
    if (diff < 60000) return Math.floor(diff / 1000) + ' сек тому';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' хв тому';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' год тому';

    return new Date(timestamp).toLocaleString();
}

function updateTimes() {
    displayedData.forEach((entry, index) => {
        const timeCell = document.getElementById(`time-${index}`);
        if (timeCell) {
            timeCell.textContent = formatTimeRelative(entry.timestamp);
        }
    });
}

function renderChart(data) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (chart) chart.destroy();

    const labels = data.map(entry => new Date(entry.timestamp).toLocaleTimeString());
    const tempData = data.map(entry => entry.temperature);
    const humData = data.map(entry => entry.humidity);

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Температура (°C)',
                    data: tempData,
                    borderColor: 'rgb(255, 99, 132)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Вологість (%)',
                    data: humData,
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
