export async function render(): Promise<void> {
    const content = document.getElementById('content')!;
    content.innerHTML = `
        <div class="page-container prompts-page">
            <div class="page-header">
                <h2>Prompts</h2>
                <button class="btn primary" id="new-prompt-btn">New Prompt</button>
            </div>
            
            <div class="search-filter-bar">
                <input type="text" placeholder="Search prompts..." class="search-input" id="prompt-search" />
                <div class="filter-tags">
                    <span class="tag active">All</span>
                    <span class="tag">#system</span>
                    <span class="tag">#coding</span>
                    <span class="tag">#writing</span>
                </div>
            </div>
            
            <div class="prompts-grid" id="prompts-grid">
                <!-- Prompt cards will be injected here -->
            </div>

            <!-- Prompt Editor Modal -->
            <div class="modal-overlay hidden" id="prompt-modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3 id="modal-title">New Prompt</h3>
                        <button class="close-btn" id="close-modal-btn">&times;</button>
                    </div>
                    <div class="modal-body editor-layout">
                        <div class="editor-main">
                            <div class="form-group">
                                <input type="text" id="prompt-title" placeholder="Prompt Title" class="full-width title-input" />
                            </div>
                            <div class="form-group">
                                <textarea id="prompt-desc" placeholder="Description" rows="2" class="full-width"></textarea>
                            </div>
                            <div class="form-group">
                                <input type="text" id="prompt-tags" placeholder="Tags (comma separated)" class="full-width" />
                            </div>
                            
                            <div class="editor-tabs">
                                <button class="tab active" data-tab="system">System</button>
                                <button class="tab" data-tab="context">Context</button>
                                <button class="tab" data-tab="instructions">Instructions</button>
                                <button class="tab" data-tab="examples">Examples</button>
                                <button class="tab" data-tab="user-input">User Input</button>
                                <button class="tab" data-tab="output">Output Req</button>
                            </div>
                            
                            <div class="tab-content">
                                <textarea id="prompt-content" class="full-prompt-editor full-width" rows="15" placeholder="Enter prompt content here... Use {{variable}} for variables."></textarea>
                            </div>
                        </div>
                        
                        <div class="editor-sidebar">
                            <div class="variables-panel panel-section">
                                <h4>Variables</h4>
                                <div id="variables-list">
                                    <div class="empty-state">No variables detected. Use {{name}} in your prompt.</div>
                                </div>
                            </div>
                            
                            <div class="preview-panel panel-section">
                                <h4>Preview</h4>
                                <div id="prompt-preview" class="preview-box"></div>
                            </div>
                            
                            <div class="meta-panel panel-section">
                                <div class="token-estimate" id="token-estimate">Token estimate: ~0</div>
                                <div class="version-history">Version: <span id="prompt-version">1.0</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-prompt-btn">Cancel</button>
                        <button class="btn secondary" id="use-prompt-btn">Use in Chat</button>
                        <button class="btn primary" id="save-prompt-btn">Save Prompt</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Dummy data and logic
    const promptsGrid = content.querySelector('#prompts-grid') as HTMLElement;
    const renderPrompts = () => {
        promptsGrid.innerHTML = `
            <div class="prompt-card">
                <div class="card-header">
                    <h3>Code Reviewer</h3>
                    <span class="star-icon active">★</span>
                </div>
                <p class="description">Acts as an expert code reviewer checking for best practices.</p>
                <div class="tags"><span class="tag">#coding</span></div>
                <div class="version">v1.2</div>
                <div class="actions">
                    <button class="btn sm edit-prompt-btn">Edit</button>
                    <button class="btn sm">Duplicate</button>
                    <button class="btn sm">Delete</button>
                </div>
            </div>
        `;
    };

    renderPrompts();

    const modal = content.querySelector('#prompt-modal') as HTMLElement;
    content.querySelector('#new-prompt-btn')?.addEventListener('click', () => modal.classList.remove('hidden'));
    content.querySelector('#close-modal-btn')?.addEventListener('click', () => modal.classList.add('hidden'));
    content.querySelector('#cancel-prompt-btn')?.addEventListener('click', () => modal.classList.add('hidden'));

    const contentEditor = content.querySelector('#prompt-content') as HTMLTextAreaElement;
    const tokenEstimate = content.querySelector('#token-estimate') as HTMLElement;
    
    contentEditor?.addEventListener('input', (e) => {
        const text = (e.target as HTMLTextAreaElement).value;
        tokenEstimate.textContent = `Token estimate: ~${Math.ceil(text.length / 4)}`;
    });
}
