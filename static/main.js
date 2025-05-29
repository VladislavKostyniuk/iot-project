let data = [];

const friendlyNames = {
    'device_1': 'Кухня',
    'device_2': 'Вітальня',
    'device_3': 'Балкон',
    'device_4': 'Спальня',
    'device_5': 'Серверна',
};

window.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 10000);

    document.getElementById('deviceFilter').addEventListener('change', applyFilters);
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
    deviceFilter.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());

    const deviceIds = [...new Set(data.map(entry => entry.device_id))];
    deviceIds.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = friendlyNames[id] || id;
        deviceFilter.appendChild(option);
    });
}

function applyFilters() {
    const deviceFilterValue = document.getElementById('deviceFilter').value;
    const tempMin = parseFloat(document.getElementById('tempMin').value);
    const tempMax = parseFloat(document.getElementById('tempMax').value);
    const humMin = parseFloat(document.getElementById('humMin').value);
    const humMax = parseFloat(document.getElementById('humMax').value);

    let filtered = data;
    if (deviceFilterValue !== 'all') {
        filtered = filtered.filter(entry => entry.device_id === deviceFilterValue);
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
        const timeStr = new Date().toLocaleTimeString(); // Актуальний час на клієнті

        const deviceName = friendlyNames[entry.device_id] || entry.device_id;

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
    document.getElementById('deviceFilter').value = 'all';
    document.getElementById('tempMin').value = '';
    document.getElementById('tempMax').value = '';
    document.getElementById('humMin').value = '';
    document.getElementById('humMax').value = '';
    applyFilters();
}
