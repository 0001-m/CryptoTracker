let cryptoData = [];
let currentView = '24h';
let charts = {};

console.log('Script loaded - Chart.js should be available:', typeof Chart !== 'undefined');

const API_URL = 'https://api.coingecko.com/api/v3';

// Color palette - Crypto theme
const colors = {
    primary: '#00d4ff',
    success: '#10b981',
    danger: '#f87171',
    warning: '#fbbf24',
    chart1: '#00d4ff',
    chart2: '#06b6d4',
    chart3: '#14b8a6',
    chart4: '#10b981',
    chart5: '#6366f1'
};

const chartColors = [
    '#00d4ff',
    '#06b6d4',
    '#14b8a6',
    '#10b981',
    '#6366f1',
    '#8b5cf6',
    '#d946ef',
    '#ec4899'
];

// Mock data for fallback
const mockCryptoData = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 42850, market_cap: 840000000000, price_change_percentage_24h: 2.45 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 2450, market_cap: 294000000000, price_change_percentage_24h: 1.82 },
    { id: 'binancecoin', name: 'Binance Coin', symbol: 'bnb', current_price: 612, market_cap: 93600000000, price_change_percentage_24h: 0.95 },
    { id: 'solana', name: 'Solana', symbol: 'sol', current_price: 189, market_cap: 68040000000, price_change_percentage_24h: 3.21 },
    { id: 'cardano', name: 'Cardano', symbol: 'ada', current_price: 1.08, market_cap: 40200000000, price_change_percentage_24h: -0.54 },
    { id: 'ripple', name: 'XRP', symbol: 'xrp', current_price: 2.15, market_cap: 118500000000, price_change_percentage_24h: 1.23 },
    { id: 'polkadot', name: 'Polkadot', symbol: 'dot', current_price: 7.45, market_cap: 32100000000, price_change_percentage_24h: 2.11 },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge', current_price: 0.38, market_cap: 56000000000, price_change_percentage_24h: 4.32 },
    { id: 'litecoin', name: 'Litecoin', symbol: 'ltc', current_price: 125, market_cap: 18000000000, price_change_percentage_24h: 1.67 },
    { id: 'avalanche-2', name: 'Avalanche', symbol: 'avax', current_price: 35.20, market_cap: 13500000000, price_change_percentage_24h: 2.89 },
    { id: 'chainlink', name: 'Chainlink', symbol: 'link', current_price: 22.50, market_cap: 12100000000, price_change_percentage_24h: 1.45 },
    { id: 'uniswap', name: 'Uniswap', symbol: 'uni', current_price: 18.75, market_cap: 11300000000, price_change_percentage_24h: 0.78 },
    { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'bch', current_price: 425, market_cap: 8100000000, price_change_percentage_24h: 3.12 },
    { id: 'aptos', name: 'Aptos', symbol: 'apt', current_price: 11.80, market_cap: 6300000000, price_change_percentage_24h: -1.23 },
    { id: 'polygon', name: 'Polygon', symbol: 'matic', current_price: 0.95, market_cap: 10200000000, price_change_percentage_24h: 2.56 },
    { id: 'cosmos', name: 'Cosmos', symbol: 'atom', current_price: 12.45, market_cap: 4800000000, price_change_percentage_24h: 1.89 },
    { id: 'stellar', name: 'Stellar', symbol: 'xlm', current_price: 0.35, market_cap: 3200000000, price_change_percentage_24h: 0.92 },
    { id: 'near', name: 'Near Protocol', symbol: 'near', current_price: 6.80, market_cap: 2800000000, price_change_percentage_24h: 2.34 },
    { id: 'filecoin', name: 'Filecoin', symbol: 'fil', current_price: 16.50, market_cap: 1950000000, price_change_percentage_24h: 1.67 },
    { id: 'tezos', name: 'Tezos', symbol: 'xtz', current_price: 1.92, market_cap: 1680000000, price_change_percentage_24h: 0.45 }
];

const mockGlobalData = {
    data: {
        total_market_cap: { usd: 2100000000000 },
        total_volume: { usd: 95000000000 },
        market_cap_change_percentage_24h_usd: 1.23
    }
};

// Format currency
function formatCurrency(value) {
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return '$' + (value / 1e3).toFixed(2) + 'K';
    return '$' + value.toFixed(2);
}

// Show/hide loading
function setLoading(show) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = show ? 'flex' : 'none';
    }
}

// Fetch cryptocurrency data from CoinGecko API
async function loadData() {
    try {
        setLoading(true);

        let data = null;
        let globalData = null;
        let usesMock = false;

        try {
            // Try to fetch from API
            const response = await Promise.race([
                fetch(`${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&price_change_percentage=24h,7d,30d`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            if (response.ok) {
                data = await response.json();
            }

            const globalResponse = await Promise.race([
                fetch(`${API_URL}/global`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            if (globalResponse.ok) {
                globalData = await globalResponse.json();
            }
        } catch (apiError) {
            console.warn('API call failed, using mock data:', apiError.message);
            usesMock = true;
            data = mockCryptoData;
            globalData = mockGlobalData;
        }

        // Fallback to mock if API data is invalid
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn('API returned invalid data, using mock data');
            data = mockCryptoData;
            usesMock = true;
        }

        if (!globalData || !globalData.data) {
            globalData = mockGlobalData;
        }

        cryptoData = data;

        // Update UI
        updateStats(globalData);
        updateTable();
        initCharts();

        if (usesMock) {
            console.log('Dashboard loaded with demo data');
        }

        setLoading(false);
    } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
        // Use mock data on complete failure
        cryptoData = mockCryptoData;
        updateStats(mockGlobalData);
        updateTable();
        initCharts();
    }
}

// Update stat cards
function updateStats(globalData) {
    try {
        // Bitcoin
        const btc = cryptoData[0];
        if (btc) {
            document.getElementById('btcPrice').textContent = formatCurrency(btc.current_price);
            const btcChange = btc.price_change_percentage_24h || 0;
            const btcChangeEl = document.getElementById('btcChange');
            btcChangeEl.textContent = (btcChange >= 0 ? '↑ ' : '↓ ') + Math.abs(btcChange).toFixed(2) + '%';
            btcChangeEl.className = 'stat-change ' + (btcChange >= 0 ? 'positive' : 'negative');
        }

        // Ethereum
        const eth = cryptoData[1];
        if (eth) {
            document.getElementById('ethPrice').textContent = formatCurrency(eth.current_price);
            const ethChange = eth.price_change_percentage_24h || 0;
            const ethChangeEl = document.getElementById('ethChange');
            ethChangeEl.textContent = (ethChange >= 0 ? '↑ ' : '↓ ') + Math.abs(ethChange).toFixed(2) + '%';
            ethChangeEl.className = 'stat-change ' + (ethChange >= 0 ? 'positive' : 'negative');
        }

        // Market Cap
        const marketCap = globalData.data.total_market_cap.usd;
        document.getElementById('marketCap').textContent = formatCurrency(marketCap);
        const marketChange = globalData.data.market_cap_change_percentage_24h_usd || 0;
        const marketChangeEl = document.getElementById('marketChange');
        marketChangeEl.textContent = (marketChange >= 0 ? '↑ ' : '↓ ') + Math.abs(marketChange).toFixed(2) + '%';
        marketChangeEl.className = 'stat-change ' + (marketChange >= 0 ? 'positive' : 'negative');

        // Volume
        const volume = globalData.data.total_volume.usd;
        document.getElementById('volume').textContent = formatCurrency(volume);
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Update cryptocurrency table
function updateTable() {
    try {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';

        cryptoData.slice(0, 20).forEach((crypto, index) => {
            const changePercent = crypto.price_change_percentage_24h || 0;
            const changeClass = changePercent >= 0 ? 'positive' : 'negative';
            const changeArrow = changePercent >= 0 ? '↑' : '↓';

            const row = `
                <tr>
                    <td>#${index + 1}</td>
                    <td>
                        <strong>${crypto.name}</strong>
                        <span style="color: #a0aec0; margin-left: 8px;">${crypto.symbol.toUpperCase()}</span>
                    </td>
                    <td>${formatCurrency(crypto.current_price)}</td>
                    <td>${formatCurrency(crypto.market_cap || 0)}</td>
                    <td class="${changeClass}">${changeArrow} ${Math.abs(changePercent).toFixed(2)}%</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error updating table:', error);
    }
}

// Initialize all charts
function initCharts() {
    try {
        console.log('initCharts called, crypto data length:', cryptoData.length);
        if (cryptoData.length === 0) {
            console.error('No crypto data available');
            return;
        }
        
        const top5 = cryptoData.slice(0, 5);
        const top10 = cryptoData.slice(0, 10);

        console.log('Creating charts with top5 and top10 data');
        createMarketCapChart(top5);
        createPriceChangeChart(top10);
        createDominanceChart(top5);
        createPerformanceChart(top10);
        console.log('All charts created');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Market Cap Chart
function createMarketCapChart(data) {
    try {
        console.log('Creating market cap chart');
        const canvas = document.getElementById('marketCapChart');
        if (!canvas) {
            console.error('marketCapChart canvas not found');
            return;
        }
        console.log('Canvas found:', canvas);

        if (charts.marketCap) {
            charts.marketCap.destroy();
        }

        const ctx = canvas.getContext('2d');
        console.log('Context obtained:', ctx);
        
        charts.marketCap = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(c => c.symbol.toUpperCase()),
                datasets: [{
                    label: 'Market Cap (USD)',
                    data: data.map(c => c.market_cap || 0),
                    backgroundColor: ['#00d4ff', '#10b981', '#f87171', '#fbbf24', '#a78bfa'],
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { 
                            color: '#a0aec0',
                            callback: (value) => '$' + (value / 1e9).toFixed(1) + 'B'
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a0aec0' }
                    }
                }
            }
        });
        console.log('Market cap chart created successfully');
    } catch (error) {
        console.error('Error creating market cap chart:', error);
    }
}

// Price Change Chart
function createPriceChangeChart(data) {
    try {
        console.log('Creating price change chart for period:', currentView);
        const canvas = document.getElementById('priceChangeChart');
        if (!canvas) {
            console.error('priceChangeChart canvas not found');
            return;
        }

        if (charts.priceChange) {
            charts.priceChange.destroy();
        }

        // Get the right price change data based on current view
        let priceChanges;
        let periodLabel = '24h Price Change (%)';
        
        if (currentView === '7d') {
            priceChanges = data.map(c => c.price_change_percentage_7d_in_currency || c.price_change_percentage_24h || 0);
            periodLabel = '7d Price Change (%)';
        } else if (currentView === '30d') {
            priceChanges = data.map(c => c.price_change_percentage_30d_in_currency || c.price_change_percentage_24h || 0);
            periodLabel = '30d Price Change (%)';
        } else {
            priceChanges = data.map(c => c.price_change_percentage_24h || 0);
            periodLabel = '24h Price Change (%)';
        }
        
        const bgColors = priceChanges.map(change => change >= 0 ? '#10b981' : '#f87171');

        const ctx = canvas.getContext('2d');
        charts.priceChange = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(c => c.symbol.toUpperCase()),
                datasets: [{
                    label: periodLabel,
                    data: priceChanges,
                    backgroundColor: bgColors,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a0aec0', callback: (v) => v.toFixed(1) + '%' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a0aec0' }
                    }
                }
            }
        });
        console.log('Price change chart created successfully');
    } catch (error) {
        console.error('Error creating price change chart:', error);
    }
}

// Market Dominance Chart
function createDominanceChart(data) {
    try {
        console.log('Creating dominance chart');
        const canvas = document.getElementById('dominanceChart');
        if (!canvas) {
            console.error('dominanceChart canvas not found');
            return;
        }

        if (charts.dominance) {
            charts.dominance.destroy();
        }

        const total = data.reduce((sum, c) => sum + (c.market_cap || 0), 0);
        const dominances = data.map(c => ((c.market_cap || 0) / total) * 100);

        const ctx = canvas.getContext('2d');
        charts.dominance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(c => c.symbol.toUpperCase()),
                datasets: [{
                    data: dominances,
                    backgroundColor: ['#00d4ff', '#10b981', '#f87171', '#fbbf24', '#a78bfa'],
                    borderColor: '#1a1f2e',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#a0aec0', padding: 15 }
                    }
                }
            }
        });
        console.log('Dominance chart created successfully');
    } catch (error) {
        console.error('Error creating dominance chart:', error);
    }
}

// Performance Chart
function createPerformanceChart(data) {
    try {
        console.log('Creating performance chart for period:', currentView);
        const canvas = document.getElementById('performanceChart');
        if (!canvas) {
            console.error('performanceChart canvas not found');
            return;
        }

        if (charts.performance) {
            charts.performance.destroy();
        }

        // Get the right price change data based on current view
        let priceChanges;
        let periodLabel = '24h Change (%)';
        
        if (currentView === '7d') {
            priceChanges = data.map(c => c.price_change_percentage_7d_in_currency || c.price_change_percentage_24h || 0);
            periodLabel = '7d Change (%)';
        } else if (currentView === '30d') {
            priceChanges = data.map(c => c.price_change_percentage_30d_in_currency || c.price_change_percentage_24h || 0);
            periodLabel = '30d Change (%)';
        } else {
            priceChanges = data.map(c => c.price_change_percentage_24h || 0);
            periodLabel = '24h Change (%)';
        }

        const ctx = canvas.getContext('2d');
        charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(c => c.symbol.toUpperCase()),
                datasets: [{
                    label: periodLabel,
                    data: priceChanges,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#1a1f2e',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#a0aec0' } }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a0aec0', callback: (v) => v.toFixed(1) + '%' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a0aec0' }
                    }
                }
            }
        });
        console.log('Performance chart created successfully');
    } catch (error) {
        console.error('Error creating performance chart:', error);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('%c=== CryptoTracker Initialization ===', 'color: #00d4ff; font-size: 14px; font-weight: bold');
    console.log('Chart library available:', typeof Chart !== 'undefined');
    
    // Check if all canvas elements exist
    const canvases = ['marketCapChart', 'priceChangeChart', 'dominanceChart', 'performanceChart'];
    canvases.forEach(id => {
        const canvas = document.getElementById(id);
        console.log(`Canvas #${id}:`, canvas ? 'EXISTS ✓' : 'MISSING ✗');
        if (canvas) {
            console.log(`  Dimensions: ${canvas.width}x${canvas.height}`);
        }
    });
    
    console.log('Starting data load...');
    loadData();
});

// Auto-refresh every 60 seconds
setInterval(() => {
    loadData();
}, 60000);

// Update stat cards
function updateStats(globalData) {
    const top5 = cryptoData.slice(0, 5);

    // Bitcoin
    const btc = cryptoData[0];
    if (btc) {
        document.getElementById('btcPrice').textContent = formatCurrency(btc.current_price);
        const btcChange = btc.price_change_percentage_24h;
        const btcChangeEl = document.getElementById('btcChange');
        btcChangeEl.textContent = (btcChange >= 0 ? '↑ ' : '↓ ') + Math.abs(btcChange).toFixed(2) + '%';
        btcChangeEl.className = 'stat-change ' + (btcChange >= 0 ? 'positive' : 'negative');
    }

    // Ethereum
    const eth = cryptoData[1];
    if (eth) {
        document.getElementById('ethPrice').textContent = formatCurrency(eth.current_price);
        const ethChange = eth.price_change_percentage_24h;
        const ethChangeEl = document.getElementById('ethChange');
        ethChangeEl.textContent = (ethChange >= 0 ? '↑ ' : '↓ ') + Math.abs(ethChange).toFixed(2) + '%';
        ethChangeEl.className = 'stat-change ' + (ethChange >= 0 ? 'positive' : 'negative');
    }

    // Market Cap
    const marketCap = globalData.data.total_market_cap.usd;
    document.getElementById('marketCap').textContent = formatCurrency(marketCap);
    const marketChange = globalData.data.market_cap_change_percentage_24h_usd;
    const marketChangeEl = document.getElementById('marketChange');
    marketChangeEl.textContent = (marketChange >= 0 ? '↑ ' : '↓ ') + Math.abs(marketChange).toFixed(2) + '%';
    marketChangeEl.className = 'stat-change ' + (marketChange >= 0 ? 'positive' : 'negative');

    // Volume
    const volume = globalData.data.total_volume.usd;
    document.getElementById('volume').textContent = formatCurrency(volume);
}

// Update cryptocurrency table
function updateTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    cryptoData.slice(0, 20).forEach((crypto, index) => {
        const changePercent = crypto.price_change_percentage_24h;
        const changeClass = changePercent >= 0 ? 'positive' : 'negative';
        const changeArrow = changePercent >= 0 ? '↑' : '↓';

        const row = `
            <tr>
                <td>#${index + 1}</td>
                <td>
                    <strong>${crypto.name}</strong>
                    <span style="color: #a0aec0; margin-left: 8px;">${crypto.symbol.toUpperCase()}</span>
                </td>
                <td>${formatCurrency(crypto.current_price)}</td>
                <td>${formatCurrency(crypto.market_cap || 0)}</td>
                <td class="${changeClass}">${changeArrow} ${Math.abs(changePercent).toFixed(2)}%</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Initialize all charts
function initCharts() {
    const top5 = cryptoData.slice(0, 5);
    const top10 = cryptoData.slice(0, 10);

    // Chart 1: Market Cap
    createMarketCapChart(top5);

    // Chart 2: Price Change Distribution
    createPriceChangeChart(top10);

    // Chart 3: Market Dominance
    createDominanceChart(top5);

    // Chart 4: Performance
    createPerformanceChart(top10);
}

// Set view period
function setView(period) {
    currentView = period;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    console.log('View changed to:', period);
    // Reload charts with new period
    initCharts();
}