let chart;
let data = [];
let deviceNameMap = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 10000);

    document.getElementById('deviceFilter').addEventListener('change', applyFilters);
    document.getElementById('timeFilter').addEventListener('change', applyFilters);
    document.getElementById('tempMin').addEventListener('input', applyFilters);
    document.getElementById('tempMax').addEventListener('input', applyFilters);
    document.getElementById('humMin').addEventListener('input', applyFilters);
    document.getElementById('humMax').addEventListener('input', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
});

function resetFilters() {
    document.getElementById('deviceFilter').value = 'all';
    document.getElementById('timeFilter').value = '1';
    document.getElementById('tempMin').value = '';
    document.getElementById('tempMax').value = '';
    document.getElementById('humMin').value = '';
    document.getElementById('humMax').value = '';
    applyFilters();
}

function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(result => {
            if (result.status === 'ok') {
                data = result.data.map(entry => {
                    if (!entry.device_id) entry.device_id = 'unknown';
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
    const uniqueDevices = [...new Set(data.map(entry => entry.device_id))];

    // Очистити старі опції, крім "Усі"
    deviceFilter.querySelectorAll('option:not([value="all"])').forEach(opt => opt.remove());

    // Оновити мапу імен
    deviceNameMap = {};
    uniqueDevices.forEach((id, index) => {
        deviceNameMap[id] = `Пристрій ${index + 1}`;
        const option = document.createElement('option');
        option.value = id;
        option.textContent = deviceNameMap[id];
        deviceFilter.appendChild(option);
    });
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

    if (!isNaN(tempMin)) {
        filtered = filtered.filter(entry => entry.temperature !== undefined && entry.temperature >= tempMin);
    }
    if (!isNaN(tempMax)) {
        filtered = filtered.filter(entry => entry.temperature !== undefined && entry.temperature <= tempMax);
    }
    if (!isNaN(humMin)) {
        filtered = filtered.filter(entry => entry.humidity !== undefined && entry.humidity >= humMin);
    }
    if (!isNaN(humMax)) {
        filtered = filtered.filter(entry => entry.humidity !== undefined && entry.humidity <= humMax);
    }

    renderTable(filtered);
    renderChart(filtered);
}

function renderTable(filtered) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    filtered.forEach((entry, index) => {
        const temp = entry.temperature !== undefined ? entry.temperature.toFixed(1) : '-';
        const hum = entry.humidity !== undefined ? entry.humidity.toFixed(1) : '-';
        const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '-';
        const name = deviceNameMap[entry.device_id] || entry.device_id;

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${index + 1}</td>
      <td>${name}</td>
      <td>${temp}</td>
      <td>${hum}</td>
      <td>${timeStr}</td>
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
