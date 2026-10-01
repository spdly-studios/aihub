export interface Workspace {
  id: string;
  name: string;
  description: string;
  defaultModel?: string;
  defaultEndpoint?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export async function render(): Promise<void> {
    const content = document.getElementById('content')!;
    content.innerHTML = `
        <div class="page-container workspace-page">
            <div class="page-header">
                <h2>Workspaces</h2>
                <button class="btn primary" id="new-workspace-btn">New Workspace</button>
            </div>
            
            <div class="workspace-grid">
                <div class="workspace-card" style="border-top: 4px solid #3b82f6;">
                    <div class="card-header">
                        <h3>Default Workspace</h3>
                        <span class="badge">Default</span>
                    </div>
                    <p class="description">Main workspace for general chat and exploration.</p>
                    <div class="stats">
                        <div class="stat"><span class="icon">💬</span> 12 Conversations</div>
                        <div class="stat"><span class="icon">📄</span> 5 Files</div>
                    </div>
                    <div class="meta">Last active: 2 hours ago</div>
                    <div class="actions">
                        <button class="btn primary full-width">Open Chat</button>
                        <button class="btn secondary edit-workspace-btn">Edit</button>
                    </div>
                </div>
                
                <div class="workspace-card" style="border-top: 4px solid #10b981;">
                    <div class="card-header">
                        <h3>Project Alpha</h3>
                    </div>
                    <p class="description">Development tasks for Alpha project.</p>
                    <div class="stats">
                        <div class="stat"><span class="icon">💬</span> 3 Conversations</div>
                        <div class="stat"><span class="icon">📄</span> 12 Files</div>
                    </div>
                    <div class="meta">Last active: Yesterday</div>
                    <div class="actions">
                        <button class="btn primary full-width">Open Chat</button>
                        <button class="btn secondary edit-workspace-btn">Edit</button>
                        <button class="btn danger">Delete</button>
                    </div>
                </div>
            </div>

            <!-- Workspace Editor Modal -->
            <div class="modal-overlay hidden" id="workspace-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="workspace-modal-title">Edit Workspace</h3>
                        <button class="close-btn" id="close-workspace-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" class="full-width" value="Default Workspace" />
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea class="full-width" rows="2">Main workspace for general chat and exploration.</textarea>
                        </div>
                        <div class="form-group">
                            <label>Color Tag</label>
                            <div class="color-picker">
                                <div class="color-swatch active" style="background: #3b82f6;"></div>
                                <div class="color-swatch" style="background: #10b981;"></div>
                                <div class="color-swatch" style="background: #f59e0b;"></div>
                                <div class="color-swatch" style="background: #ef4444;"></div>
                                <div class="color-swatch" style="background: #8b5cf6;"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Default Endpoint</label>
                            <select class="full-width">
                                <option>System Default</option>
                                <option>OpenAI</option>
                                <option>Anthropic</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Default Model</label>
                            <select class="full-width">
                                <option>System Default</option>
                                <option>gpt-4o</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-workspace-btn">Cancel</button>
                        <button class="btn primary">Save Workspace</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modal = content.querySelector('#workspace-modal') as HTMLElement;
    
    content.querySelector('#new-workspace-btn')?.addEventListener('click', () => {
        (content.querySelector('#workspace-modal-title') as HTMLElement).textContent = 'New Workspace';
        modal.classList.remove('hidden');
    });
    
    content.querySelectorAll('.edit-workspace-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            (content.querySelector('#workspace-modal-title') as HTMLElement).textContent = 'Edit Workspace';
            modal.classList.remove('hidden');
        });
    });
    
    content.querySelector('#close-workspace-modal')?.addEventListener('click', () => modal.classList.add('hidden'));
    content.querySelector('#cancel-workspace-btn')?.addEventListener('click', () => modal.classList.add('hidden'));
}
