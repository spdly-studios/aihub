export async function render(): Promise<void> {
    const content = document.getElementById('content')!;
    content.innerHTML = `
        <div class="page-container agents-page">
            <div class="page-header">
                <h2>Agents <span class="badge warning">Experimental</span></h2>
                <button class="btn primary" id="new-agent-btn">New Agent</button>
            </div>
            
            <div class="agents-grid" id="agents-grid">
                <div class="agent-card">
                    <div class="card-header">
                        <h3>Research Assistant</h3>
                        <span class="status-badge status-idle">Idle</span>
                    </div>
                    <p class="description">Searches the web and summarizes findings systematically.</p>
                    <div class="meta">Model: gpt-4o</div>
                    <div class="actions">
                        <button class="btn sm edit-agent-btn">Edit</button>
                        <button class="btn sm run-agent-btn">Run</button>
                        <button class="btn sm">Duplicate</button>
                        <button class="btn sm">Delete</button>
                    </div>
                </div>
            </div>

            <!-- Agent Editor Modal -->
            <div class="modal-overlay hidden" id="agent-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Configure Agent</h3>
                        <button class="close-btn" id="close-agent-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Agent Name</label>
                            <input type="text" class="full-width" placeholder="e.g., Data Analyst" />
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea class="full-width" rows="2" placeholder="What does this agent do?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>System Prompt</label>
                            <textarea class="full-width" rows="5" placeholder="You are an expert..."></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label>Endpoint</label>
                                <select class="full-width"><option>OpenAI</option></select>
                            </div>
                            <div class="form-group half">
                                <label>Model</label>
                                <select class="full-width"><option>gpt-4o</option></select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Temperature (0-2)</label>
                            <input type="range" min="0" max="2" step="0.1" value="0.7" class="full-width" />
                        </div>
                        <div class="form-group">
                            <label>Maximum Steps</label>
                            <input type="number" min="1" max="50" value="10" class="full-width" />
                        </div>
                        <div class="form-group">
                            <label>Available Tools</label>
                            <div class="tools-checkboxes">
                                <label><input type="checkbox" checked /> HTTP Request</label>
                                <label><input type="checkbox" checked /> Calculator</label>
                                <label><input type="checkbox" /> Web Search</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Attached Files</label>
                            <input type="file" multiple />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-agent-btn">Cancel</button>
                        <button class="btn primary">Save Agent</button>
                    </div>
                </div>
            </div>

            <!-- Agent Runner Panel -->
            <div class="agent-runner-panel hidden" id="agent-runner">
                <div class="runner-header">
                    <h3>Running: Research Assistant</h3>
                    <button class="close-btn" id="close-runner-btn">&times;</button>
                </div>
                <div class="runner-body">
                    <div class="chat-history" id="agent-chat-log">
                        <div class="message system">Agent initialized. Ready for task.</div>
                    </div>
                    <div class="runner-input">
                        <textarea placeholder="Enter task for agent..." rows="3" class="full-width"></textarea>
                        <div class="runner-actions">
                            <button class="btn primary" id="start-run-btn">Run Task</button>
                            <button class="btn danger hidden" id="stop-run-btn">Stop</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modal = content.querySelector('#agent-modal') as HTMLElement;
    const runner = content.querySelector('#agent-runner') as HTMLElement;

    content.querySelector('#new-agent-btn')?.addEventListener('click', () => modal.classList.remove('hidden'));
    content.querySelector('#close-agent-modal')?.addEventListener('click', () => modal.classList.add('hidden'));
    content.querySelector('#cancel-agent-btn')?.addEventListener('click', () => modal.classList.add('hidden'));
    
    content.querySelector('.run-agent-btn')?.addEventListener('click', () => runner.classList.remove('hidden'));
    content.querySelector('#close-runner-btn')?.addEventListener('click', () => runner.classList.add('hidden'));
}
