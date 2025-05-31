let chart;
let data = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 10000); // оновлення кожні 10 секунд

    // Фільтр по id
    document.getElementById('idFilter').addEventListener('change', applyFilters);

    // Фільтри по температурі і вологості
    document.getElementById('tempMin').addEventListener('input', applyFilters);
    document.getElementById('tempMax').addEventListener('input', applyFilters);
    document.getElementById('humMin').addEventListener('input', applyFilters);
    document.getElementById('humMax').addEventListener('input', applyFilters);
});

function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(result => {
            if (result.status === 'ok') {
                data = result.data; // без змін device_id
                populateIdFilter();
                applyFilters();
            } else {
                console.error('Помилка отримання даних:', result.message);
            }
        })
        .catch(err => console.error('Помилка fetch:', err));
}

function populateIdFilter() {
    const idFilter = document.getElementById('idFilter');
    // Видаляємо всі опції, крім "all"
    idFilter.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());

    // Отримаємо унікальні id
    const ids = [...new Set(data.map(entry => entry.id))];
    ids.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = id;
        idFilter.appendChild(option);
    });
}

function applyFilters() {
    const idFilterValue = document.getElementById('idFilter').value;
    const tempMin = parseFloat(document.getElementById('tempMin').value);
    const tempMax = parseFloat(document.getElementById('tempMax').value);
    const humMin = parseFloat(document.getElementById('humMin').value);
    const humMax = parseFloat(document.getElementById('humMax').value);

    let filtered = data;

    if (idFilterValue !== 'all') {
        filtered = filtered.filter(entry => entry.id === idFilterValue);
    }

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
          <td>${entry.id}</td>
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

    const labels = data.map(entry => entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '');
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
