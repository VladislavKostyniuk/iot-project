let chart;
let data = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 10000); // оновлення кожні 10 секунд

    // Замінено: прибрав eventListener по deviceFilter і timeFilter
    // Додаємо eventListener по idFilter (пошук по ID)
    document.getElementById('idFilter').addEventListener('input', applyFilters);

    // Прибрав усі фільтри, крім idFilter
    // document.getElementById('timeFilter').remove(); // видалити в HTML!

    setInterval(updateTimes, 1000); // оновлення часу в таблиці щосекунди
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
    const idFilterValue = document.getElementById('idFilter').value.toLowerCase();

    let filtered = data;

    if (idFilterValue) {
        filtered = filtered.filter(entry => entry._id.toLowerCase().includes(idFilterValue));
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
        row.dataset.timestamp = entry.timestamp || '';
        row.innerHTML = `
          <td>${entry._id}</td>
          <td>${entry.device_id}</td>
          <td>${temp}</td>
          <td>${hum}</td>
          <td class="time-cell">${timeStr}</td>
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

function updateTimes() {
    document.querySelectorAll('#dataTable tbody tr').forEach(row => {
        const ts = row.dataset.timestamp;
        if (ts) {
            row.querySelector('.time-cell').textContent = new Date(ts).toLocaleString();
        }
    });
}
