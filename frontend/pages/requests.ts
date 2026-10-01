export async function render(): Promise<void> {
    const content = document.getElementById('content')!;
    content.innerHTML = `
        <div class="page-container requests-page">
            <div class="page-header">
                <h2>Request History</h2>
                <button class="btn secondary danger">Clear History</button>
            </div>
            
            <div class="filter-bar">
                <select class="filter-select"><option>All Endpoints</option><option>OpenAI</option></select>
                <select class="filter-select"><option>All Models</option><option>gpt-4o</option></select>
                <select class="filter-select"><option>All Status</option><option>200 OK</option><option>Errors</option></select>
                <input type="date" class="filter-date" />
            </div>
            
            <div class="requests-layout">
                <div class="requests-table-container">
                    <table class="requests-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Method</th>
                                <th>Endpoint</th>
                                <th>Model</th>
                                <th>Status</th>
                                <th>Duration</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="request-row active">
                                <td>10:42:05 AM</td>
                                <td><span class="badge method-post">POST</span></td>
                                <td>OpenAI (/v1/chat)</td>
                                <td>gpt-4o</td>
                                <td><span class="badge status-200">200 OK</span></td>
                                <td>1450ms</td>
                                <td>
                                    <button class="btn icon-btn" title="Delete">🗑️</button>
                                </td>
                            </tr>
                            <tr class="request-row">
                                <td>10:35:12 AM</td>
                                <td><span class="badge method-post">POST</span></td>
                                <td>Anthropic (/v1/messages)</td>
                                <td>claude-3-sonnet</td>
                                <td><span class="badge status-400">400 Bad Request</span></td>
                                <td>320ms</td>
                                <td>
                                    <button class="btn icon-btn" title="Delete">🗑️</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="request-detail-panel">
                    <div class="detail-header">
                        <h3>Request Details</h3>
                        <div class="actions">
                            <button class="btn sm">Copy cURL</button>
                            <button class="btn sm primary">Resend in Playground</button>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Overview</h4>
                        <div class="info-grid">
                            <div class="info-item"><span class="label">URL:</span> https://api.openai.com/v1/chat/completions</div>
                            <div class="info-item"><span class="label">Duration:</span> 1.45s</div>
                            <div class="info-item"><span class="label">Streaming:</span> <span class="badge">Yes</span></div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Request Header</h4>
                        <pre><code class="language-json">{
  "Content-Type": "application/json",
  "Authorization": "Bearer sk-..."
}</code></pre>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Request Body</h4>
                        <pre><code class="language-json">{
  "model": "gpt-4o",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": true
}</code></pre>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Response Status: 200 OK</h4>
                        <pre><code class="language-json">{
  "id": "chatcmpl-123",
  "object": "chat.completion.chunk",
  "choices": [...]
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Row selection logic
    const rows = content.querySelectorAll('.request-row');
    rows.forEach(row => {
        row.addEventListener('click', () => {
            rows.forEach(r => r.classList.remove('active'));
            row.classList.add('active');
        });
    });
}
