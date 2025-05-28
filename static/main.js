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
                data = result.data;
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
    deviceIds.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `Пристрій ${id}`;
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
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${index + 1}</td>
      <td>Пристрій ${entry.device_id}</td>
      <td>${entry.temperature.toFixed(1)}</td>
      <td>${entry.humidity.toFixed(1)}</td>
      <td>${new Date(entry.timestamp).toLocaleString()}</td>
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
                    fill: false
                },
                {
                    label: 'Вологість (%)',
                    data: humData,
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false
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
