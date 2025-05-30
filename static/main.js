let data = [];
let filteredData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    document.getElementById('idFilter').addEventListener('input', () => {
        filterData();
        renderTable();
    });

    // Оновлення часу в таблиці щосекунди
    setInterval(updateTimes, 1000);
});

function fetchData() {
    fetch('/data')
        .then(res => res.json())
        .then(res => {
            if (res.status === 'ok') {
                data = res.data;
                filteredData = data;
                renderTable();
            } else {
                console.error('Помилка завантаження даних');
            }
        })
        .catch(err => console.error('Помилка fetch:', err));
}

function filterData() {
    const search = document.getElementById('idFilter').value.toLowerCase();
    if (!search) {
        filteredData = data;
    } else {
        filteredData = data.filter(item => item._id.toLowerCase().includes(search));
    }
}

function renderTable() {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    filteredData.forEach((item, idx) => {
        const temp = item.temperature !== undefined ? item.temperature.toFixed(1) : '-';
        const hum = item.humidity !== undefined ? item.humidity.toFixed(1) : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${item._id}</td>
      <td>${item.device_id || '-'}</td>
      <td>${temp}</td>
      <td>${hum}</td>
      <td id="time-${idx}">${formatTime(item.timestamp)}</td>
    `;
        tbody.appendChild(tr);
    });
}

function updateTimes() {
    filteredData.forEach((item, idx) => {
        const el = document.getElementById(`time-${idx}`);
        if (el) {
            el.textContent = formatTime(item.timestamp);
        }
    });
}

function formatTime(timestamp) {
    if (!timestamp) return '-';

    const date = new Date(timestamp);
    return date.toLocaleString();
}
