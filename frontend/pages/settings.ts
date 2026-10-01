import { icon } from '../utils/icons';
import { getSetting, setSetting } from '../storage/settings';
import { exportAll, importAll } from '../storage/export-import';

export async function render() {
    const content = document.getElementById('content');
    if (!content) return;

    // Load settings using single argument getSetting
    const theme = getSetting('theme');
    const defaultModel = getSetting('defaultModel');
    const modelAliases = getSetting('modelAliases');
    const failoverEnabled = getSetting('failoverEnabled');
    const loadBalancingStrategy = getSetting('loadBalancingStrategy');
    const capiKey = getSetting('capiKey');

    content.innerHTML = `
        <div class="page-header">
            <h2>Settings</h2>
            <div class="actions">
                <button id="btn-export-settings" class="btn secondary">${icon('download')} Export</button>
                <button id="btn-import-settings" class="btn secondary">${icon('upload')} Import</button>
            </div>
        </div>

        <div class="settings-grid">
            <section class="card">
                <h3>General</h3>
                <div class="form-group">
                    <label>Theme</label>
                    <select id="setting-theme">
                        <option value="light" ${theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${theme === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="system" ${theme === 'system' ? 'selected' : ''}>System</option>
                    </select>
                </div>
            </section>
            
            <section class="card">
                <h3>AI Defaults</h3>
                <div class="form-group">
                    <label>Default Model</label>
                    <input type="text" id="setting-default-model" value="${defaultModel || ''}">
                </div>
            </section>

            <section class="card">
                <h3>Model Aliases</h3>
                <div class="form-group">
                    <textarea id="setting-aliases" rows="4">${JSON.stringify(modelAliases || {}, null, 2)}</textarea>
                </div>
            </section>

            <section class="card">
                <h3>Failover & Load Balancing</h3>
                <div class="form-group">
                    <label class="toggle-label">
                        <input type="checkbox" id="setting-failover" ${failoverEnabled ? 'checked' : ''}>
                        Enable Failover
                    </label>
                </div>
                <div class="form-group">
                    <label>Load Balancing Strategy</label>
                    <select id="setting-load-balancing">
                        <option value="fixed" ${loadBalancingStrategy === 'fixed' ? 'selected' : ''}>Fixed</option>
                        <option value="round-robin" ${loadBalancingStrategy === 'round-robin' ? 'selected' : ''}>Round Robin</option>
                        <option value="random" ${loadBalancingStrategy === 'random' ? 'selected' : ''}>Random</option>
                        <option value="lowest-latency" ${loadBalancingStrategy === 'lowest-latency' ? 'selected' : ''}>Lowest Latency</option>
                    </select>
                </div>
            </section>

            <section class="card">
                <h3>API Auth</h3>
                <div class="form-group">
                    <label>CAPI Key</label>
                    <input type="password" id="setting-api-key" value="${capiKey || ''}">
                </div>
            </section>

            <section class="card">
                <h3>Privacy & Data</h3>
                <div class="form-group">
                    <button class="btn danger" id="btn-clear-data">Clear All Local Data</button>
                </div>
            </section>
            
            <section class="card">
                <h3>About</h3>
                <p>SpDly AI version 1.0.0</p>
            </section>
        </div>
    `;

    // Event listeners for saving settings
    document.getElementById('setting-theme')?.addEventListener('change', (e) => {
        setSetting('theme', (e.target as HTMLSelectElement).value as any);
    });

    document.getElementById('setting-default-model')?.addEventListener('change', (e) => {
        setSetting('defaultModel', (e.target as HTMLInputElement).value);
    });
    
    document.getElementById('setting-failover')?.addEventListener('change', (e) => {
        setSetting('failoverEnabled', (e.target as HTMLInputElement).checked);
    });

    document.getElementById('setting-load-balancing')?.addEventListener('change', (e) => {
        setSetting('loadBalancingStrategy', (e.target as HTMLSelectElement).value as any);
    });

    document.getElementById('setting-api-key')?.addEventListener('change', (e) => {
        setSetting('capiKey', (e.target as HTMLInputElement).value);
    });

    document.getElementById('btn-export-settings')?.addEventListener('click', async () => {
        const data = await exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spdly-ai-export.json';
        a.click();
    });

    document.getElementById('btn-import-settings')?.addEventListener('click', () => {
        // Implement import flow if needed
    });
}
