let data = [];

const friendlyNames = {
    'device_1': 'Теплиця 1',
    'device_2': 'Теплиця 2',
    'ESP_A1': 'Підвал A1',
    'ESP_B2': 'Сарай B2',
};

window.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 10000);

    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    // Також повісити події на інші фільтри, щоб при зміні викликати applyFilters()
    ['deviceFilter', 'tempMin', 'tempMax', 'humMin', 'humMax'].forEach(id => {
        document.getElementById(id).addEventListener('input', applyFilters);
    });
});

async function fetchData() {
    try {
        const res = await fetch('/data'); // або твій реальний API
        data = await res.json();
        populateDeviceFilter();
        applyFilters();
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
    }
}

function populateDeviceFilter() {
    const deviceFilter = document.getElementById('deviceFilter');
    // Видаляємо всі опції, крім "all"
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
    const deviceFilter = document.getElementById('deviceFilter').value;
    const tempMin = parseFloat(document.getElementById('tempMin').value);
    const tempMax = parseFloat(document.getElementById('tempMax').value);
    const humMin = parseFloat(document.getElementById('humMin').value);
    const humMax = parseFloat(document.getElementById('humMax').value);

    let filtered = data.filter(entry => {
        if (deviceFilter !== 'all' && entry.device_id !== deviceFilter) return false;
        if (!isNaN(tempMin) && entry.temperature < tempMin) return false;
        if (!isNaN(tempMax) && entry.temperature > tempMax) return false;
        if (!isNaN(humMin) && entry.humidity < humMin) return false;
        if (!isNaN(humMax) && entry.humidity > humMax) return false;
        return true;
    });

    renderTable(filtered);
}

function renderTable(filteredData) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Дані не знайдені</td></tr>';
        return;
    }

    filteredData.forEach((entry, index) => {
        const temp = entry.temperature !== undefined ? entry.temperature.toFixed(1) : '-';
        const hum = entry.humidity !== undefined ? entry.humidity.toFixed(1) : '-';
        const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '-';
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
