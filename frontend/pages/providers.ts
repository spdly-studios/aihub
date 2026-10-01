export async function render(): Promise<void> {
    const content = document.getElementById('content')!;

    const providers = [
        { name: 'NVIDIA NIM', url: 'https://integrate.api.nvidia.com/v1', auth: 'Bearer', configured: false },
        { name: 'Cerebras', url: 'https://api.cerebras.ai/v1', auth: 'Bearer', configured: false },
        { name: 'Google AI Studio', url: 'https://generativelanguage.googleapis.com/v1beta', auth: 'API Key Header', configured: false },
        { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1', auth: 'Bearer', configured: false },
        { name: 'Hugging Face', url: 'https://api-inference.huggingface.co/models', auth: 'Bearer', configured: false }
    ];

    content.innerHTML = `
        <style>
            :host {
                display: block;
                padding: var(--spacing-lg, 24px);
                color: var(--text-primary, #333);
                font-family: var(--font-family, system-ui, sans-serif);
            }
            .header {
                margin-bottom: var(--spacing-lg, 24px);
            }
            .title {
                font-size: var(--font-size-xl, 24px);
                font-weight: 600;
                margin: 0;
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: var(--spacing-md, 16px);
            }
            .card {
                background: var(--bg-surface, #fff);
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: var(--radius-lg, 8px);
                padding: var(--spacing-md, 16px);
                box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));
            }
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-sm, 8px);
            }
            .card-title {
                font-weight: 600;
                font-size: var(--font-size-lg, 18px);
                margin: 0;
            }
            .badge {
                font-size: var(--font-size-xs, 12px);
                padding: 2px 6px;
                border-radius: 12px;
                background: var(--bg-secondary, #e9ecef);
                color: var(--text-secondary, #495057);
            }
            .badge.configured { background: #d4edda; color: #155724; }
            .details {
                font-size: var(--font-size-sm, 14px);
                color: var(--text-secondary, #666);
                margin-bottom: var(--spacing-md, 16px);
            }
            .details p { margin: 4px 0; }
            .actions {
                display: flex;
                gap: var(--spacing-sm, 8px);
            }
            .actions button {
                background: var(--bg-primary, #007bff);
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                cursor: pointer;
                font-size: 14px;
            }
            .actions button:hover { opacity: 0.9; }
            .actions button.secondary {
                background: var(--bg-secondary, #e9ecef);
                color: var(--text-primary, #333);
            }
        </style>
        
        <div class="header">
            <h1 class="title">Providers</h1>
            <p>Configure built-in API providers</p>
        </div>
        
        <div class="grid">
            ${providers.map(p => `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">${p.name}</h3>
                        <span class="badge ${p.configured ? 'configured' : ''}">${p.configured ? 'Configured' : 'Not Configured'}</span>
                    </div>
                    <div class="details">
                        <p><strong>Base URL:</strong> ${p.url}</p>
                        <p><strong>Auth:</strong> ${p.auth}</p>
                    </div>
                    <div class="actions">
                        <button class="config-btn">Configure</button>
                        <button class="secondary test-btn">Test</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
