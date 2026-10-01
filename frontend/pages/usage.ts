import { icon } from '../utils/icons';
import { getUsageSummary } from '../storage/usage';

export async function render() {
    const content = document.getElementById('content');
    if (!content) return;

    let dateRange = '30d';

    async function updateView() {
        const summary = await getUsageSummary(dateRange) || {};
        
        content!.innerHTML = `
            <div class="page-header">
                <h2>Usage Dashboard</h2>
                <div class="actions">
                    <button id="btn-export-usage" class="btn secondary">${icon('download')} Export</button>
                    <button id="btn-clear-usage" class="btn danger">${icon('trash')} Clear</button>
                </div>
            </div>
            
            <div class="disclaimer">
                <p><strong>Note:</strong> This data represents client-observed usage. Actual billed usage may differ.</p>
                <div class="date-selector">
                    <select id="usage-date-range">
                        <option value="today" ${dateRange === 'today' ? 'selected' : ''}>Today</option>
                        <option value="7d" ${dateRange === '7d' ? 'selected' : ''}>7 Days</option>
                        <option value="30d" ${dateRange === '30d' ? 'selected' : ''}>30 Days</option>
                        <option value="all" ${dateRange === 'all' ? 'selected' : ''}>All Time</option>
                    </select>
                </div>
            </div>

            <div class="summary-cards">
                <div class="card">
                    <h3>Total Requests</h3>
                    <div class="value">${summary.totalRequests || 0}</div>
                </div>
                <div class="card">
                    <h3>Input Tokens</h3>
                    <div class="value">${summary.totalInputTokens || 0}</div>
                </div>
                <div class="card">
                    <h3>Output Tokens</h3>
                    <div class="value">${summary.totalOutputTokens || 0}</div>
                </div>
                <div class="card">
                    <h3>Total Tokens</h3>
                    <div class="value">${summary.totalTokens || 0}</div>
                </div>
                <div class="card">
                    <h3>Avg Latency</h3>
                    <div class="value">${summary.averageLatency ? summary.averageLatency.toFixed(2) : 0}ms</div>
                </div>
                <div class="card">
                    <h3>Error Rate</h3>
                    <div class="value">${summary.totalRequests > 0 ? ((summary.errors / summary.totalRequests) * 100).toFixed(2) : 0}%</div>
                </div>
            </div>
            
            <div class="charts-container">
                <div class="card chart-card">
                    <h3>Usage by Provider</h3>
                    <div class="simple-bar-chart">
                        <!-- CSS Bar Chart implementation based on summary.byProvider -->
                        ${Object.entries(summary.byProvider || {}).map(([name, p]: [string, any]) => `
                            <div class="bar-row">
                                <span class="label">${name}</span>
                                <div class="bar-wrapper"><div class="bar" style="width: ${Math.min(100, (p.requests / (summary.totalRequests || 1)) * 100)}%"></div></div>
                                <span class="val">${p.requests}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card chart-card">
                    <h3>Usage by Model</h3>
                    <div class="simple-bar-chart">
                        ${Object.entries(summary.byModel || {}).map(([name, m]: [string, any]) => `
                            <div class="bar-row">
                                <span class="label">${name}</span>
                                <div class="bar-wrapper"><div class="bar" style="width: ${Math.min(100, (m.requests / (summary.totalRequests || 1)) * 100)}%"></div></div>
                                <span class="val">${m.requests}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="tables-container">
                <div class="card">
                    <h3>Provider Breakdown</h3>
                    <table>
                        <thead><tr><th>Provider</th><th>Requests</th></tr></thead>
                        <tbody>
                            ${Object.entries(summary.byProvider || {}).map(([name, p]: [string, any]) => `<tr><td>${name}</td><td>${p.requests}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="card">
                    <h3>Model Breakdown</h3>
                    <table>
                        <thead><tr><th>Model</th><th>Requests</th></tr></thead>
                        <tbody>
                            ${Object.entries(summary.byModel || {}).map(([name, m]: [string, any]) => `<tr><td>${name}</td><td>${m.requests}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="card">
                    <h3>Daily Breakdown</h3>
                    <table>
                        <thead><tr><th>Day</th><th>Requests</th></tr></thead>
                        <tbody>
                            ${Object.entries(summary.byDay || {}).map(([date, d]: [string, any]) => `<tr><td>${date}</td><td>${d.requests}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('usage-date-range')?.addEventListener('change', (e) => {
            dateRange = (e.target as HTMLSelectElement).value;
            updateView();
        });
        
        document.getElementById('btn-export-usage')?.addEventListener('click', () => {
            console.log('Exporting usage data...');
        });
        
        document.getElementById('btn-clear-usage')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all usage data?')) {
                console.log('Clearing usage data...');
                // clearUsage() and re-render
            }
        });
    }

    await updateView();
}
