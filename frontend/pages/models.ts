export async function render(): Promise<void> {
    const content = document.getElementById('content')!;
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
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .title {
                font-size: var(--font-size-xl, 24px);
                font-weight: 600;
                margin: 0;
            }
            .search-bar {
                width: 300px;
                padding: 8px 12px;
                border: 1px solid var(--border-color, #ccc);
                border-radius: 20px;
            }
            .filters {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
            }
            .pill {
                padding: 4px 12px;
                border-radius: 16px;
                background: var(--bg-secondary, #e9ecef);
                font-size: 14px;
                cursor: pointer;
            }
            .pill:hover { background: #d3d9df; }
            
            table {
                width: 100%;
                border-collapse: collapse;
                background: var(--bg-surface, #fff);
                box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));
                border-radius: 8px;
                overflow: hidden;
            }
            th, td {
                padding: 12px 16px;
                text-align: left;
                border-bottom: 1px solid var(--border-color, #e0e0e0);
            }
            th {
                background: var(--bg-secondary, #f8f9fa);
                font-weight: 600;
            }
            .badge {
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 12px;
                background: #e9ecef;
                color: #495057;
            }
            .actions button {
                background: none;
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 4px 8px;
                cursor: pointer;
                margin-right: 4px;
            }
            .actions button:hover { background: #f8f9fa; }
        </style>
        
        <div class="header">
            <h1 class="title">Models</h1>
            <input type="text" class="search-bar" placeholder="Search models...">
        </div>
        
        <div class="filters">
            <span class="pill">Provider: All</span>
            <span class="pill">Capability: All</span>
            <span class="pill">Status: Enabled</span>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Model ID</th>
                    <th>Provider</th>
                    <th>Context Length</th>
                    <th>Capabilities</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>llama3-8b-8192</td>
                    <td><span class="badge">Groq</span></td>
                    <td>8192</td>
                    <td><span class="badge">Streaming</span></td>
                    <td class="actions">
                        <button>Favorite</button>
                        <button>Alias</button>
                    </td>
                </tr>
                <tr>
                    <td>gpt-4o</td>
                    <td><span class="badge">OpenAI</span></td>
                    <td>128k</td>
                    <td><span class="badge">Vision</span> <span class="badge">Streaming</span></td>
                    <td class="actions">
                        <button>Favorite</button>
                        <button>Alias</button>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
}
