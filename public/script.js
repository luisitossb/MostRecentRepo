const chartTypes = ['line', 'bar'];
let currentReleaseYearChartIndex = 0;
let currentGenreChartIndex = 0;
let currentAgeRangeChartIndex = 0;
let releaseYearChart, genreChart, ageRangeChart;
let allData = [];

async function fetchData() {
    try {
        const response = await fetch('https://datavizbackendfromphp.onrender.com/data'); // Update this to your backend URL
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        allData = rawData;
        updateAllCharts();
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

function parseCsvData(rawData, aspect) {
    const validRatings = ["G", "PG", "PG-13", "R", "NC-17", "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA", "NR"];
    switch (aspect) {
        case 'release_year':
            return rawData.reduce((acc, record) => {
                acc[record.release_year] = (acc[record.release_year] || 0) + 1;
                return acc;
            }, {});
        case 'rating':
            return rawData.reduce((acc, record) => {
                if (validRatings.includes(record.rating)) {
                    acc[record.rating] = (acc[record.rating] || 0) + 1;
                }
                return acc;
            }, {});
        case 'genre':
            return rawData.reduce((acc, record) => {
                record.listed_in.split(',').forEach(genre => {
                    genre = genre.trim();
                    acc[genre] = (acc[genre] || 0) + 1;
                });
                return acc;
            }, {});
        default:
            return {};
    }
}

function initializeChart(chartType, data, canvasId, aspect) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (!data || !Object.keys(data).length) {
        console.error('Invalid data for chart initialization');
        return;
    }

    if (aspect === 'release_year' && releaseYearChart) {
        releaseYearChart.destroy();
    } else if (aspect === 'genre' && genreChart) {
        genreChart.destroy();
    } else if (aspect === 'rating' && ageRangeChart) {
        ageRangeChart.destroy();
    }

    const colors = {
        backgroundColor: 'rgba(229, 9, 20, 0.2)', // Light, transparent Netflix red
        borderColor: 'rgba(229, 9, 20, 0.8)' // Darker, semi-transparent Netflix red for the border
    };

    const chartOptions = {
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
            x: {
                ticks: {
                    autoSkip: chartType === 'line' && aspect === 'release_year',
                    maxTicksLimit: chartType === 'line' && aspect === 'release_year' ? Math.floor(Object.keys(data).length / 2) : undefined
                }
            },
            y: {
                beginAtZero: true
            }
        }
    };

    const newChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Count',
                data: Object.values(data),
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                borderWidth: 1
            }]
        },
        options: chartOptions
    });

    if (aspect === 'release_year') {
        releaseYearChart = newChart;
    } else if (aspect === 'genre') {
        genreChart = newChart;
    } else if (aspect === 'rating') {
        ageRangeChart = newChart;
    }
}

function updateChart(aspect, canvasId, currentChartIndex) {
    const data = parseCsvData(allData, aspect);
    const chartType = chartTypes[currentChartIndex];
    initializeChart(chartType, data, canvasId, aspect);
}

function updateAllCharts() {
    updateChart('release_year', 'chartCanvasReleaseYear', currentReleaseYearChartIndex);
    updateChart('genre', 'chartCanvasGenre', currentGenreChartIndex);
    updateChart('rating', 'chartCanvasAgeRange', currentAgeRangeChartIndex);
}

document.getElementById('swapViewButtonReleaseYear').addEventListener('click', function() {
    currentReleaseYearChartIndex = (currentReleaseYearChartIndex + 1) % chartTypes.length;
    updateChart('release_year', 'chartCanvasReleaseYear', currentReleaseYearChartIndex);
});

document.getElementById('swapViewButtonGenre').addEventListener('click', function() {
    currentGenreChartIndex = (currentGenreChartIndex + 1) % chartTypes.length;
    updateChart('genre', 'chartCanvasGenre', currentGenreChartIndex);
});

document.getElementById('swapViewButtonAgeRange').addEventListener('click', function() {
    currentAgeRangeChartIndex = (currentAgeRangeChartIndex + 1) % chartTypes.length;
    updateChart('rating', 'chartCanvasAgeRange', currentAgeRangeChartIndex);
});

window.addEventListener('load', fetchData);
