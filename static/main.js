let data = [];

window.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 10000); // оновлення кожні 10 сек

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
                data = result.data;
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

    if (!isNaN(tempMin)) filtered = filtered.filter(e => e.temperature !== undefined && e.temperature >= tempMin);
    if (!isNaN(tempMax)) filtered = filtered.filter(e => e.temperature !== undefined && e.temperature <= tempMax);
    if (!isNaN(humMin)) filtered = filtered.filter(e => e.humidity !== undefined && e.humidity >= humMin);
    if (!isNaN(humMax)) filtered = filtered.filter(e => e.humidity !== undefined && e.humidity <= humMax);

    if (!isNaN(rowNumber) && rowNumber >= 1 && rowNumber <= filtered.length) {
        filtered = [filtered[rowNumber - 1]];
    }

    renderTable(filtered);
}

function renderTable(filteredData) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5">Немає даних за заданими параметрами</td>`;
        tbody.appendChild(tr);
        return;
    }

    filteredData.forEach((entry, index) => {
        const temp = typeof entry.temperature === 'number' ? entry.temperature.toFixed(1) : '-';
        const hum = typeof entry.humidity === 'number' ? entry.humidity.toFixed(1) : '-';
        const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleString('uk-UA') : '-';
        const deviceId = entry.device_id || 'Невідомий';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${deviceId}</td>
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
