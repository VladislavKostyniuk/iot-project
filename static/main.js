let chart;
let data = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    document.getElementById('deviceFilter').addEventListener('change', applyFilters);
    document.getElementById('timeFilter').addEventListener('change', applyFilters);
});

function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(result => {
            if (result.status === 'ok') {
                data = result.data.map((entry, index) => {
                    // Якщо немає унікальних id для пристроїв, пронумеруємо пристрої по черзі
                    if (!entry.device_id) {
                        entry.device_id = "device_" + (index + 1);
                    }
                    return entry;
                });
                populateDeviceFilter();
                applyFilters();
            } else {
                console.error('Помилка отримання даних:', result.message);
            }
        })
        .catch(err => console.error('Помилка fetch:', err));
}

function populateDeviceFilter() {
    const deviceFilter = document.getElementById('deviceFilter');
    // Очищаємо попередні опції, крім "Усі"
    deviceFilter.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());

    const deviceIds = [...new Set(data.map(entry => entry.device_id))];
    deviceIds.forEach((id, i) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `Пристрій ${i + 1}`;
        deviceFilter.appendChild(option);
    });
}

function applyFilters() {
    const deviceFilterValue = document.getElementById('deviceFilter').value;
    const timeFilterValue = document.getElementById('timeFilter').value;
    const now = Date.now();

    let filtered = data;

    if (deviceFilterValue !== 'all') {
        filtered = filtered.filter(entry => entry.device_id === deviceFilterValue);
    }

    if (timeFilterValue !== 'all') {
        const minutes = parseInt(timeFilterValue);
        const cutoff = now - minutes * 60 * 1000;
        filtered = filtered.filter(entry => new Date(entry.timestamp).getTime() >= cutoff);
    }

    renderTable(filtered);
    renderChart(filtered);
}

function renderTable(data) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    data.forEach((entry, index) => {
        const temp = entry.temperature !== undefined ? entry.temperature.toFixed(1) : '-';
        const hum = entry.humidity !== undefined ? entry.humidity.toFixed(1) : '-';
        const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '-';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>Пристрій ${entry.device_id}</td>
          <td>${temp}</td>
          <td>${hum}</td>
          <td>${timeStr}</td>
        `;
        tbody.appendChild(row);
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
