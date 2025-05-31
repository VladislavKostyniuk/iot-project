const sampleData = [
    { id: "1", device: "Sensor A", temperature: 22.5, humidity: 45, timestamp: "2025-05-30 12:00" },
    { id: "2", device: "Sensor B", temperature: 25.1, humidity: 50, timestamp: "2025-05-30 12:01" },
    { id: "3", device: "Sensor A", temperature: 23.8, humidity: 42, timestamp: "2025-05-30 12:02" },
    { id: "4", device: "Sensor C", temperature: 21.4, humidity: 48, timestamp: "2025-05-30 12:03" },
    { id: "5", device: "Sensor B", temperature: 24.0, humidity: 47, timestamp: "2025-05-30 12:04" }
];

const tableBody = document.querySelector("#dataTable tbody");
const deviceFilter = document.getElementById("deviceFilter");
const idFilter = document.getElementById("idFilter");

function populateFilters() {
    const devices = [...new Set(sampleData.map(row => row.device))];
    const ids = [...new Set(sampleData.map(row => row.id))];

    devices.forEach(device => {
        const option = document.createElement("option");
        option.value = device;
        option.textContent = device;
        deviceFilter.appendChild(option);
    });

    ids.forEach(id => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = id;
        idFilter.appendChild(option);
    });
}

function renderTable() {
    const selectedDevice = deviceFilter.value;
    const selectedId = idFilter.value;

    tableBody.innerHTML = "";

    const filteredData = sampleData.filter(row => {
        const matchDevice = !selectedDevice || row.device === selectedDevice;
        const matchId = !selectedId || row.id === selectedId;
        return matchDevice && matchId;
    });

    filteredData.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${row.id}</td>
        <td>${row.device}</td>
        <td>${row.temperature}</td>
        <td>${row.humidity}</td>
        <td>${row.timestamp}</td>
      `;
        tableBody.appendChild(tr);
    });
}

deviceFilter.addEventListener("change", renderTable);
idFilter.addEventListener("change", renderTable);

populateFilters();
renderTable();
  