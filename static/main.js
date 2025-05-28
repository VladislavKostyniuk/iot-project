let chart;
let data = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 10000); // кожні 10 сек

    document.getElementById('deviceFilter').addEventListener('change', applyFilters);
    document.getElementById('timeFilter').addEventListener('change', applyFilters);
    document.getElementById('tempMin').addEventListener('input', applyFilters);
    document.getElementById('tempMax').addEventListener('input', applyFilters);
    document.getElementById('humMin').addEventListener('input', applyFilters);
    document.getElementById('humMax').addEventListener('input', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
});

function fetchData() {
    fetch('/data')
        .then(res => res.json())
        .then(result => {
            if (result.status === 'ok') {
                data = result.data;
                updateLastUpdated();
                populateDeviceFilter();
                renderCurrentValues();
                applyFilters();
            } else {
                console.error('Помилка отримання даних:', result.message);
            }
        })
        .catch(err => console.error('Помилка fetch:', err));
}

function updateLastUpdated() {
    const now = new Date().toLocaleTimeString();
    document.getElementById('lastUpdated').textContent = `Останнє оновлення: ${now}`;
}

function populateDeviceFilter() {
    const deviceFilter = document.getElementById('deviceFilter');
    deviceFilter.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());

    const deviceIds = [...new Set(data.map(entry => entry.device_id))];
    deviceIds.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = id;
        deviceFilter.appendChild(option);
    });
}

function resetFilters() {
    document.getElementById('deviceFilter').value = 'all';
    document.getElementById('timeFilter').value = '1';
    document.getElementById('tempMin').value = '';
    document.getElementById('tempMax').value = '';
    document.getElementById('humMin').value = '';
    document.getElementById('humMax').value = '';
    applyFilters();
}

function applyFilters() {
    const deviceFilterValue = document.getElementById('deviceFilter').value;
    const timeFilterValue = parseInt(document.getElementById('timeFilter').value);
    const tempMin = parseFloat(document.getElementById('tempMin').value);
    const tempMax = parseFloat(document.getElementById('tempMax').value);
    const humMin = parseFloat(document.getElementById('humMin').value);
    const humMax = parseFloat(document.getElementById('humMax').value);

    const now = Date.now();
    let filtered = data;

    if (deviceFilterValue !== 'all') {
        filtered = filtered.filter(entry => entry.device_id === deviceFilterValue);
    }

    const cutoff = now - timeFilterValue * 60 * 1000;
    filtered = filtered.filter(entry => new Date(entry.timestamp).getTime() >= cutoff);

    if (!isNaN(tempMin)) filtered = filtered.filter(e => e.temperature >= tempMin);
    if (!isNaN(tempMax)) filtered = filtered.filter(e => e.temperature <= tempMax);
    if (!isNaN(humMin)) filtered = filtered.filter(e => e.humidity >= humMin);
    if (!isNaN(humMax)) filtered = filtered.filter(e => e.humidity <= humMax);

    renderTable(filtered);
    renderChart(filtered);
}

function renderCurrentValues() {
    const container = document.getElementById('currentValues');
    container.innerHTML = '';

    const latestByDevice = {};
    data.forEach(entry => {
        const existing = latestByDevice[entry.device_id];
        if (!existing || new Date(entry.timestamp) > new Date(existing.timestamp)) {
            latestByDevice[entry.device_id] = entry;
        }
    });

    Object.entries(latestByDevice).forEach(([device, entry]) => {
        const div = document.createElement('div');
        div.className = 'current-card';
        div.innerHTML = `
      <strong>${device}</strong><br>
      Температура: ${entry.temperature?.toFixed(1) ?? '-'} °C<br>
      Вологість: ${entry.humidity?.toFixed(1) ?? '-'} %<br>
      Час: ${new Date(entry.timestamp).toLocaleTimeString()}
    `;
        container.appendChild(div);
    });
}

function renderTable(filtered) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    filtered.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.device_id}</td>
      <td>${entry.temperature?.toFixed(1) ?? '-'}</td>
      <td>${entry.humidity?.toFixed(1) ?? '-'}</td>
      <td>${new Date(entry.timestamp).toLocaleString()}</td>
    `;
        tbody.appendChild(row);
    });
}

function renderChart(filtered) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (chart) chart.destroy();

    const labels = filtered.map(entry => new Date(entry.timestamp).toLocaleTimeString());
    const tempData = filtered.map(entry => entry.temperature);
    const humData = filtered.map(entry => entry.humidity);

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
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
