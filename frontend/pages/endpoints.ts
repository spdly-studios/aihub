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
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-lg, 24px);
            }
            .title {
                font-size: var(--font-size-xl, 24px);
                font-weight: 600;
                margin: 0;
            }
            button {
                padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                background: var(--bg-primary, #007bff);
                color: var(--text-inverse, white);
                border: none;
                border-radius: var(--radius-md, 4px);
                cursor: pointer;
                font-weight: 500;
            }
            button:hover {
                opacity: 0.9;
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
                align-items: flex-start;
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
            .badge.online { background: #d4edda; color: #155724; }
            .badge.offline { background: #f8d7da; color: #721c24; }
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
                background: var(--bg-secondary, #e9ecef);
                color: var(--text-primary, #333);
                font-size: var(--font-size-sm, 14px);
            }
            
            /* Modal Styles */
            .modal-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1000;
                align-items: center;
                justify-content: center;
            }
            .modal-overlay.active { display: flex; }
            .modal {
                background: var(--bg-surface, #fff);
                border-radius: var(--radius-lg, 8px);
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            .modal-header {
                padding: var(--spacing-md, 16px);
                border-bottom: 1px solid var(--border-color, #e0e0e0);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-header h2 { margin: 0; font-size: 20px; }
            .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
            .modal-body {
                padding: var(--spacing-md, 16px);
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .form-group label { font-weight: 500; font-size: 14px; }
            .form-group input, .form-group select, .form-group textarea {
                padding: 8px;
                border: 1px solid var(--border-color, #ccc);
                border-radius: 4px;
                font-family: inherit;
            }
            .modal-footer {
                padding: var(--spacing-md, 16px);
                border-top: 1px solid var(--border-color, #e0e0e0);
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
        </style>
        
        <div class="header">
            <h1 class="title">Endpoints</h1>
            <button id="add-btn">Add Endpoint</button>
        </div>
        
        <div class="grid" id="endpoints-grid">
            <!-- Endpoint cards will be injected here -->
        </div>

        <!-- Add/Edit Modal -->
        <div class="modal-overlay" id="edit-modal">
            <div class="modal">
                <div class="modal-header">
                    <h2 id="modal-title">Add Endpoint</h2>
                    <button class="close-btn" id="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <h3>Basic Info</h3>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="ep-name" placeholder="My Endpoint">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="ep-desc" rows="2"></textarea>
                    </div>
                    
                    <h3>Connection</h3>
                    <div class="form-group">
                        <label>Base URL</label>
                        <input type="url" id="ep-url" required>
                    </div>
                    <div class="form-group">
                        <label>Protocol</label>
                        <select id="ep-protocol">
                            <option value="openai">OpenAI-compatible</option>
                            <option value="rest">REST</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    
                    <h3>Authentication</h3>
                    <div class="form-group">
                        <label>Auth Type</label>
                        <select id="ep-auth-type">
                            <option value="none">None</option>
                            <option value="bearer">Bearer</option>
                            <option value="api-key-header">API Key Header</option>
                        </select>
                    </div>
                    <div class="form-group" id="auth-key-group">
                        <label>API Key / Token</label>
                        <input type="password" id="ep-auth-key">
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="test-conn-btn" style="background: #28a745; margin-right: auto;">Test Connection</button>
                    <button id="cancel-btn" style="background: #6c757d;">Cancel</button>
                    <button id="save-btn">Save</button>
                </div>
            </div>
        </div>
    `;

    renderEndpoints();
    setupEventListeners();
}

async function getEndpoints() {
    return new Promise(resolve => {
        const req = indexedDB.open('SpDlyDB', 1);
        req.onupgradeneeded = (e: any) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('endpoints')) {
                db.createObjectStore('endpoints', { keyPath: 'id' });
            }
        };
        req.onsuccess = (e: any) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('endpoints')) {
                resolve([]);
                return;
            }
            const tx = db.transaction('endpoints', 'readonly');
            const store = tx.objectStore('endpoints');
            const getReq = store.getAll();
            getReq.onsuccess = () => resolve(getReq.result || []);
            getReq.onerror = () => resolve([]);
        };
        req.onerror = () => resolve([]);
    });
}

async function renderEndpoints() {
    const content = document.getElementById('content')!;
    const grid = content.querySelector('#endpoints-grid');
    if (!grid) return;
    
    const endpoints: any = await getEndpoints();
    if (endpoints.length === 0) {
        grid.innerHTML = '<p>No endpoints configured. Click "Add Endpoint" to create one.</p>';
        return;
    }

    grid.innerHTML = endpoints.map((ep: any) => `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${ep.name}</h3>
                <span class="badge ${ep.status === 'online' ? 'online' : 'offline'}">${ep.status || 'unknown'}</span>
            </div>
            <div class="details">
                <p><strong>URL:</strong> ${ep.url}</p>
                <p><strong>Protocol:</strong> ${ep.protocol}</p>
                <p><strong>Auth:</strong> ${ep.authType}</p>
            </div>
            <div class="actions">
                <button class="edit-btn" data-id="${ep.id}">Edit</button>
                <button class="test-btn" data-id="${ep.id}">Test</button>
                <button class="del-btn" data-id="${ep.id}">Delete</button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => openEditModal((e.target as any).dataset.id)));
    grid.querySelectorAll('.del-btn').forEach(btn => btn.addEventListener('click', (e) => deleteEndpoint((e.target as any).dataset.id)));
}

function setupEventListeners() {
    const content = document.getElementById('content')!;
    content.querySelector('#add-btn')?.addEventListener('click', () => openEditModal());
    content.querySelector('#close-modal')?.addEventListener('click', () => closeModal());
    content.querySelector('#cancel-btn')?.addEventListener('click', () => closeModal());
    content.querySelector('#save-btn')?.addEventListener('click', () => saveEndpoint());
}

function openEditModal(id?: string) {
    const content = document.getElementById('content')!;
    const modal = content.querySelector('#edit-modal');
    if (modal) modal.classList.add('active');
    // If id provided, load data. Else clear form.
}

function closeModal() {
    const content = document.getElementById('content')!;
    const modal = content.querySelector('#edit-modal');
    if (modal) modal.classList.remove('active');
}

async function saveEndpoint() {
    const content = document.getElementById('content')!;
    const name = (document.getElementById('ep-name') as HTMLInputElement).value;
    const url = (document.getElementById('ep-url') as HTMLInputElement).value;
    const protocol = (document.getElementById('ep-protocol') as unknown as HTMLSelectElement).value;
    const authType = (document.getElementById('ep-auth-type') as unknown as HTMLSelectElement).value;

    const endpoint = {
        id: Date.now().toString(),
        name,
        url,
        protocol,
        authType,
        status: 'unknown'
    };

    const req = indexedDB.open('SpDlyDB', 1);
    req.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction('endpoints', 'readwrite');
        const store = tx.objectStore('endpoints');
        store.put(endpoint);
        tx.oncomplete = () => {
            closeModal();
            renderEndpoints();
        };
    };
}

async function deleteEndpoint(id: string) {
    const req = indexedDB.open('SpDlyDB', 1);
    req.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction('endpoints', 'readwrite');
        const store = tx.objectStore('endpoints');
        store.delete(id);
        tx.oncomplete = () => renderEndpoints();
    };
}
