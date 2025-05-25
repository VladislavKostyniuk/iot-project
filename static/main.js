let latestData = [];

function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(result => {
            if (result.status === 'ok') {
                latestData = result.data.reverse(); // найновіші знизу
                updateTable(latestData);
                updateCharts(latestData);
            }
        });
}

function updateTable(data) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    data.forEach(entry => {
        const row = `<tr>
            <td>${entry._id}</td>
            <td>${entry.device_id}</td>
            <td>${entry.temperature}</td>
            <td>${entry.humidity}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

let tempChart, humChart;

function updateCharts(data) {
    const labels = data.map((_, index) => index + 1);
    const tempData = data.map(entry => entry.temperature);
    const humData = data.map(entry => entry.humidity);

    if (tempChart) tempChart.destroy();
    if (humChart) humChart.destroy();

    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    const ctxHum = document.getElementById('humChart').getContext('2d');

    tempChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Температура',
                data: tempData,
                borderColor: 'red',
                fill: false
            }]
        }
    });

    humChart = new Chart(ctxHum, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Вологість',
                data: humData,
                borderColor: 'blue',
                fill: false
            }]
        }
    });
}

function applyTemperatureFilter() {
    const minTemp = parseFloat(document.getElementById('minTemp').value);
    const maxTemp = parseFloat(document.getElementById('maxTemp').value);

    const filtered = latestData.filter(entry => {
        const temp = parseFloat(entry.temperature);
        if (!isNaN(minTemp) && temp < minTemp) return false;
        if (!isNaN(maxTemp) && temp > maxTemp) return false;
        return true;
    });

    updateTable(filtered);
    updateCharts(filtered);
}

function resetFilter() {
    document.getElementById('minTemp').value = '';
    document.getElementById('maxTemp').value = '';
    updateTable(latestData);
    updateCharts(latestData);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setInterval(fetchData, 5000);
});
