export async function render(): Promise<void> {
    const content = document.getElementById('content')!;
    content.innerHTML = `
        <div class="page-container tools-page">
            <div class="page-header">
                <h2>Tools Registry</h2>
                <button class="btn primary" id="register-tool-btn">Register Tool</button>
            </div>
            
            <div class="tools-list">
                <!-- Built-in Tools -->
                <div class="tool-item">
                    <div class="tool-info">
                        <h3>HTTP Request</h3>
                        <p class="desc">Make HTTP requests with URL validation</p>
                        <div class="meta">
                            <span class="tag">Built-in</span>
                            <span class="tag">Network</span>
                        </div>
                    </div>
                    <div class="tool-actions">
                        <label class="toggle-switch"><input type="checkbox" checked><span class="slider"></span></label>
                        <button class="btn sm edit-tool-btn">Edit</button>
                        <button class="btn sm test-tool-btn">Test</button>
                    </div>
                </div>
                
                <div class="tool-item">
                    <div class="tool-info">
                        <h3>JSON Transform</h3>
                        <p class="desc">Extract/transform JSON data using path expressions</p>
                        <div class="meta">
                            <span class="tag">Built-in</span>
                            <span class="tag">Data</span>
                        </div>
                    </div>
                    <div class="tool-actions">
                        <label class="toggle-switch"><input type="checkbox" checked><span class="slider"></span></label>
                        <button class="btn sm edit-tool-btn">Edit</button>
                        <button class="btn sm test-tool-btn">Test</button>
                    </div>
                </div>

                <div class="tool-item">
                    <div class="tool-info">
                        <h3>Calculator</h3>
                        <p class="desc">Basic math operations</p>
                        <div class="meta">
                            <span class="tag">Built-in</span>
                            <span class="tag">Math</span>
                        </div>
                    </div>
                    <div class="tool-actions">
                        <label class="toggle-switch"><input type="checkbox" checked><span class="slider"></span></label>
                        <button class="btn sm edit-tool-btn">Edit</button>
                        <button class="btn sm test-tool-btn">Test</button>
                    </div>
                </div>
            </div>

            <!-- Tool Editor Modal -->
            <div class="modal-overlay hidden" id="tool-modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>Edit Tool</h3>
                        <button class="close-btn" id="close-tool-modal">&times;</button>
                    </div>
                    <div class="modal-body tool-editor-layout">
                        <div class="form-group">
                            <label>Tool Name</label>
                            <input type="text" class="full-width" value="HTTP Request" />
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea class="full-width" rows="2">Make HTTP requests with URL validation</textarea>
                        </div>
                        
                        <div class="schema-editors">
                            <div class="schema-editor">
                                <label>Input Schema (JSON)</label>
                                <textarea class="code-editor" rows="8">{
  "type": "object",
  "properties": {
    "url": { "type": "string" },
    "method": { "type": "string", "default": "GET" }
  },
  "required": ["url"]
}</textarea>
                            </div>
                            <div class="schema-editor">
                                <label>Output Schema (JSON)</label>
                                <textarea class="code-editor" rows="8">{
  "type": "object",
  "properties": {
    "status": { "type": "number" },
    "data": { "type": "string" }
  }
}</textarea>
                            </div>
                        </div>
                        
                        <div class="test-panel">
                            <h4>Test Tool</h4>
                            <div class="test-layout">
                                <div class="test-input">
                                    <label>Input JSON</label>
                                    <textarea class="code-editor" rows="4">{"url": "https://api.github.com"}</textarea>
                                </div>
                                <div class="test-actions">
                                    <button class="btn secondary">Run Test</button>
                                </div>
                                <div class="test-output">
                                    <label>Output</label>
                                    <textarea class="code-editor" rows="4" readonly></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-tool-btn">Cancel</button>
                        <button class="btn primary">Save Tool</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modal = content.querySelector('#tool-modal') as HTMLElement;
    
    content.querySelectorAll('.edit-tool-btn').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('hidden'));
    });
    
    content.querySelector('#close-tool-modal')?.addEventListener('click', () => modal.classList.add('hidden'));
    content.querySelector('#cancel-tool-btn')?.addEventListener('click', () => modal.classList.add('hidden'));
}
