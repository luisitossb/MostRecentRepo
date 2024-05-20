const chartTypes = ['bar', 'line', 'stackedBar', 'histogram'];
let currentChartIndex = 0;
let chartInstance;
let currentPage = 0;
const itemsPerPage = 20;
let allData = [];
let filteredData = [];

async function fetchData() {
    try {
        const response = await fetch('https://datavizbackendfromphp.onrender.com/data');
        const rawData = await response.json();
        allData = rawData;
        applyFilters();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function parseCsvData(rawData, aspect) {
    if (aspect === 'release_year') {
        const groupedData = rawData.reduce((acc, record) => {
            const key = record.release_year;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(groupedData);
        const values = Object.values(groupedData);

        return { labels, values };
    }

    if (aspect === 'rating') {
        const validRatings = ["G", "PG", "PG-13", "R", "NC-17", "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA", "NR"];
        const groupedData = rawData.reduce((acc, record) => {
            const key = record.rating;
            if (validRatings.includes(key)) {
                acc[key] = (acc[key] || 0) + 1;
            }
            return acc;
        }, {});

        const labels = Object.keys(groupedData);
        const values = Object.values(groupedData);

        return { labels, values };
    }

    if (aspect === 'genre') {
        const groupedData = rawData.reduce((acc, record) => {
            const genres = record.listed_in.split(',').map(genre => genre.trim());
            genres.forEach(genre => {
                acc[genre] = (acc[genre] || 0) + 1;
            });
            return acc;
        }, {});

        const labels = Object.keys(groupedData);
        const values = Object.values(groupedData);

        return { labels, values };
    }

    return { labels: [], values: [] };
}


function initializeChart(chartType, data) {
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    if (chartType === 'stackedBar') {
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Count',
                    data: data.values,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Chart Type: Stacked Bar Chart`
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
    } else if (chartType === 'histogram') {
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Count',
                    data: data.values,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Chart Type: Histogram`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        chartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Count',
                    data: data.values,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Chart Type: ${chartType.charAt(0).toUpperCase() + chartType.slice(1)}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        display: chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'radar'
                    }
                }
            }
        });
    }
}

function applyFilters() {
    const aspectSelect = document.getElementById('aspectSelect').value;

    filteredData = allData;

    currentPage = 0;
    updateChart(aspectSelect);
}

function updateChart(aspect) {
    const data = parseCsvData(filteredData, aspect);
    initializeChart(chartTypes[currentChartIndex], data);
}

document.getElementById('swapViewButton').addEventListener('click', function() {
    currentChartIndex = (currentChartIndex + 1) % chartTypes.length;
    const aspectSelect = document.getElementById('aspectSelect').value;
    updateChart(aspectSelect);
});

document.getElementById('aspectSelect').addEventListener('change', function() {
    const aspectSelect = document.getElementById('aspectSelect').value;
    applyFilters();
});

window.addEventListener('load', fetchData);
