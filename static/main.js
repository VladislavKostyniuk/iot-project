let data = [];

window.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 10000);

    document.getElementById('rowNumber').addEventListener('input', applyFilters);
    document.getElementById('tempMin').addEventListener('input', applyFilters);
    document.getElementById('tempMax').addEventListener('input', applyFilters);
    document.getElementById('humMin').addEventListener('input', applyFilters);
    document.getElementById('humMax').addEventListener('input', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
});

function fetchData() {
    fetch('/data')
        .then(res => res.json())
        .then(result => {
            if (result.status === 'ok') {
                const latestByDevice = {};
                result.data.forEach(entry => {
                    const id = entry.device_id || 'unknown';
                    if (!latestByDevice[id] || new Date(entry.timestamp) > new Date(latestByDevice[id].timestamp)) {
                        latestByDevice[id] = entry;
                    }
                });
                data = Object.values(latestByDevice);
                applyFilters();
            } else {
                console.error('Помилка отримання даних:', result.message);
            }
        })
        .catch(err => console.error('Помилка fetch:', err));
}

function applyFilters() {
    const rowNumber = parseInt(document.getElementById('rowNumber').value);
    const tempMin = parseFloat(document.getElementById('tempMin').value);
    const tempMax = parseFloat(document.getElementById('tempMax').value);
    const humMin = parseFloat(document.getElementById('humMin').value);
    const humMax = parseFloat(document.getElementById('humMax').value);

    let filtered = data;

    if (!isNaN(rowNumber)) {
        filtered = filtered.slice(rowNumber - 1, rowNumber); // тільки 1 рядок
    }

    if (!isNaN(tempMin)) filtered = filtered.filter(e => e.temperature >= tempMin);
    if (!isNaN(tempMax)) filtered = filtered.filter(e => e.temperature <= tempMax);
    if (!isNaN(humMin)) filtered = filtered.filter(e => e.humidity >= humMin);
    if (!isNaN(humMax)) filtered = filtered.filter(e => e.humidity <= humMax);

    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    data.forEach((entry, index) => {
        const temp = entry.temperature !== undefined ? entry.temperature.toFixed(1) : '-';
        const hum = entry.humidity !== undefined ? entry.humidity.toFixed(1) : '-';
        const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : new Date().toLocaleTimeString();
        const deviceName = entry.device_id || 'Невідомо';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${deviceName}</td>
            <td>${temp}</td>
            <td>${hum}</td>
            <td>${timeStr}</td>
        `;
        tbody.appendChild(row);
    });
}

function clearFilters() {
    document.getElementById('rowNumber').value = '';
    document.getElementById('tempMin').value = '';
    document.getElementById('tempMax').value = '';
    document.getElementById('humMin').value = '';
    document.getElementById('humMax').value = '';
    applyFilters();
}
