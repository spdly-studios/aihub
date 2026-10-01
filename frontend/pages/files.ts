export async function render(): Promise<void> {
    const content = document.getElementById('content')!;
    content.innerHTML = `
        <div class="page-container files-page">
            <div class="page-header">
                <h2>Files Workspace</h2>
                <div class="header-actions">
                    <button class="btn primary" id="upload-btn">Upload File</button>
                </div>
            </div>
            
            <div class="files-layout">
                <div class="files-main">
                    <div class="upload-zone" id="drop-zone">
                        <div class="upload-icon">📁</div>
                        <p>Drag and drop files here or click to upload</p>
                        <p class="warning-text">Recommend < 5MB per file</p>
                        <input type="file" id="file-input" multiple class="hidden-input" accept=".txt,.md,.json,.csv,.js,.ts,.py,.html,.css,.xml,.yaml,.yml,.pdf,.png,.jpg,.gif,.svg" />
                    </div>
                    
                    <div class="files-list">
                        <div class="list-header">
                            <div class="col name">Name</div>
                            <div class="col size">Size</div>
                            <div class="col date">Date Added</div>
                            <div class="col status">Privacy</div>
                            <div class="col actions">Actions</div>
                        </div>
                        
                        <div class="file-item">
                            <div class="col name">
                                <span class="icon">📄</span> script.ts
                            </div>
                            <div class="col size">2.4 KB</div>
                            <div class="col date">Oct 1, 2026</div>
                            <div class="col status"><span class="badge privacy-local" title="Stored in IndexedDB">LOCAL</span></div>
                            <div class="col actions">
                                <button class="btn sm preview-btn">Preview</button>
                                <button class="btn sm">Attach</button>
                                <button class="btn sm danger">Delete</button>
                            </div>
                        </div>
                        
                        <div class="file-item">
                            <div class="col name">
                                <span class="icon">🖼️</span> architecture.png
                            </div>
                            <div class="col size">145 KB</div>
                            <div class="col date">Oct 1, 2026</div>
                            <div class="col status"><span class="badge privacy-local">LOCAL</span></div>
                            <div class="col actions">
                                <button class="btn sm preview-btn">Preview</button>
                                <button class="btn sm">Attach</button>
                                <button class="btn sm danger">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="preview-panel hidden" id="preview-panel">
                    <div class="preview-header">
                        <h3 id="preview-title">script.ts</h3>
                        <button class="close-btn" id="close-preview">&times;</button>
                    </div>
                    <div class="preview-content">
                        <pre><code class="language-typescript">
function helloWorld() {
    console.log("Hello from file!");
}
                        </code></pre>
                    </div>
                    <div class="preview-footer">
                        <div class="warning-banner">
                            ⚠️ If attached to chat, this file will be SENT TO PROVIDER.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const dropZone = content.querySelector('#drop-zone') as HTMLElement;
    const fileInput = content.querySelector('#file-input') as HTMLInputElement;
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-active');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
        // Handle files...
    });

    const previewPanel = content.querySelector('#preview-panel') as HTMLElement;
    
    content.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', () => previewPanel.classList.remove('hidden'));
    });
    
    content.querySelector('#close-preview')?.addEventListener('click', () => previewPanel.classList.add('hidden'));
}
