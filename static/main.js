async function fetchData() {
    const response = await fetch('/data');
    const json = await response.json();
    return json.data;
}

function renderTable(data) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Даних не знайдено</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.device_id || '-'}</td>
            <td>${item.temperature?.toFixed(1) ?? '-'}</td>
            <td>${item.humidity?.toFixed(1) ?? '-'}</td>
            <td>${new Date(item.timestamp || item._id).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

function applyFilters(data) {
    const rowNumber = parseInt(document.getElementById('rowNumber').value);
    const tempMin = parseFloat(document.getElementById('tempMin').value);
    const tempMax = parseFloat(document.getElementById('tempMax').value);
    const humMin = parseFloat(document.getElementById('humMin').value);
    const humMax = parseFloat(document.getElementById('humMax').value);

    return data.filter((item, index) => {
        const temp = item.temperature;
        const hum = item.humidity;

        if (!isNaN(rowNumber) && rowNumber !== index + 1) return false;
        if (!isNaN(tempMin) && temp < tempMin) return false;
        if (!isNaN(tempMax) && temp > tempMax) return false;
        if (!isNaN(humMin) && hum < humMin) return false;
        if (!isNaN(humMax) && hum > humMax) return false;

        return true;
    });
}

function drawCharts(data) {
    const labels = data.map((d, i) => i + 1);
    const temperatures = data.map(d => d.temperature);
    const humidities = data.map(d => d.humidity);

    new Chart(document.getElementById('tempChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Температура (°C)',
                data: temperatures,
                borderColor: 'red',
                fill: false
            }]
        }
    });

    new Chart(document.getElementById('humChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Вологість (%)',
                data: humidities,
                borderColor: 'blue',
                fill: false
            }]
        }
    });
}

async function init() {
    let data = await fetchData();
    renderTable(data);
    drawCharts(data);

    const inputs = document.querySelectorAll('.filters input');
    inputs.forEach(input => input.addEventListener('input', () => {
        const filtered = applyFilters(data);
        renderTable(filtered);
    }));

    document.getElementById('clearFilters').addEventListener('click', () => {
        inputs.forEach(input => input.value = '');
        renderTable(data);
    });
}

init();
