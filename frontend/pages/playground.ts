import { generateCode, CodeGenRequest } from './playground-codegen.js';

let method: string = 'GET';
let url: string = '';
let params: Array<{key: string, value: string, active: boolean}> = [{key: '', value: '', active: true}];
let headersList: Array<{key: string, value: string, active: boolean}> = [{key: '', value: '', active: true}];
let bodyContent: string = '';
let authType: string = 'None';
let authValue: string = '';
let isStreaming: boolean = false;

let responseStatus: number | null = null;
let responseStatusText: string = '';
let responseTime: number = 0;
let responseSize: number = 0;
let responseBody: string = '';
let responseHeaders: Record<string, string> = {};
let streamContent: string = '';

let activeReqTab: string = 'Params';
let activeResTab: string = 'Body';

let abortController: AbortController | null = null;

let showCodeModal: boolean = false;
let selectedCodeLang: string = 'curl';

function getComputedHeaders(): Record<string, string> {
    const computed: Record<string, string> = {};
    headersList.forEach(h => {
        if (h.active && h.key.trim() !== '') {
            computed[h.key] = h.value;
        }
    });
    
    if (authType === 'Bearer' && authValue) {
        computed['Authorization'] = `Bearer ${authValue}`;
    } else if (authType === 'API Key' && authValue) {
        computed['x-api-key'] = authValue;
        computed['Authorization'] = `Bearer ${authValue}`; // common dual usage
    }
    
    if (bodyContent && !computed['Content-Type'] && method !== 'GET' && method !== 'HEAD') {
        try {
            JSON.parse(bodyContent);
            computed['Content-Type'] = 'application/json';
        } catch {
            // not JSON
        }
    }
    
    return computed;
}

function getComputedUrl(): string {
    try {
        const urlObj = new URL(url || 'http://localhost');
        params.forEach(p => {
            if (p.active && p.key.trim() !== '') {
                urlObj.searchParams.append(p.key, p.value);
            }
        });
        return urlObj.toString();
    } catch {
        return url;
    }
}

async function sendRequest(streamBtn: boolean = false) {
    if (abortController) {
        abortController.abort();
    }
    
    abortController = new AbortController();
    const start = performance.now();
    
    responseStatus = null;
    responseTime = 0;
    responseSize = 0;
    responseBody = '';
    streamContent = '';
    responseHeaders = {};
    activeResTab = streamBtn || isStreaming ? 'Stream' : 'Body';
    
    renderUI();
    
    const fullUrl = getComputedUrl();
    const headers = getComputedHeaders();
    const options: RequestInit = {
        method: method,
        headers,
        signal: abortController.signal
    };
    
    if (method !== 'GET' && method !== 'HEAD' && bodyContent) {
        options.body = bodyContent;
    }

    try {
        const response = await fetch(fullUrl, options);
        responseStatus = response.status;
        responseStatusText = response.statusText;
        
        response.headers.forEach((val, key) => {
            responseHeaders[key] = val;
        });
        
        if (streamBtn || isStreaming) {
            if (response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let bytes = 0;
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    bytes += value.length;
                    responseSize = bytes;
                    
                    const text = decoder.decode(value, { stream: true });
                    streamContent += text;
                    renderUI();
                }
            }
        } else {
            const blob = await response.blob();
            responseSize = blob.size;
            const text = await blob.text();
            
            try {
                responseBody = JSON.stringify(JSON.parse(text), null, 2);
            } catch {
                responseBody = text;
            }
        }
    } catch (err: any) {
        if (err.name === 'AbortError') {
            responseBody = 'Request cancelled.';
        } else {
            responseBody = `Error: ${err.message}`;
        }
    } finally {
        responseTime = Math.round(performance.now() - start);
        abortController = null;
        renderUI();
    }
}

function cancelRequest() {
    if (abortController) {
        abortController.abort();
        abortController = null;
        renderUI();
    }
}

function setTemplate(type: string) {
    if (type === 'chat') {
        method = 'POST';
        url = 'http://localhost:8080/v1/chat/completions';
        headersList = [
            {key: 'Content-Type', value: 'application/json', active: true}
        ];
        bodyContent = JSON.stringify({
            model: "default-model",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Hello!" }
            ]
        }, null, 2);
    } else if (type === 'models') {
        method = 'GET';
        url = 'http://localhost:8080/v1/models';
        bodyContent = '';
    }
    renderUI();
}

function highlightJSON(jsonStr: string) {
    if (!jsonStr) return '';
    return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}

function renderKVEditor(listName: 'params' | 'headersList') {
    const list = listName === 'params' ? params : headersList;
    return `
        <div>
            ${list.map((item, i) => `
                <div class="kv-row">
                    <input type="checkbox" ${item.active ? 'checked' : ''} data-list="${listName}" data-idx="${i}" class="kv-check">
                    <input type="text" placeholder="Key" value="${item.key}" data-list="${listName}" data-idx="${i}" class="kv-key">
                    <input type="text" placeholder="Value" value="${item.value}" data-list="${listName}" data-idx="${i}" class="kv-val">
                    <button class="danger kv-del" data-list="${listName}" data-idx="${i}">X</button>
                </div>
            `).join('')}
            <button class="secondary kv-add" data-list="${listName}">Add Row</button>
        </div>
    `;
}

function renderUI() {
    const content = document.getElementById('content');
    if (!content) return;
    
    const req: CodeGenRequest = {
        method: method,
        url: getComputedUrl(),
        headers: getComputedHeaders(),
        body: bodyContent,
        streaming: isStreaming
    };

    const generatedCode = showCodeModal ? generateCode(req, selectedCodeLang) : '';

    content.innerHTML = `
        <style>
            .playground-page {
                display: block;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                height: 100%;
                background: var(--bg-color, #1e1e1e);
                color: var(--text-color, #d4d4d4);
            }
            .playground-page .container {
                display: flex;
                flex-direction: column;
                height: 100vh;
                padding: 20px;
                box-sizing: border-box;
                gap: 20px;
            }
            .playground-page .header-actions {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
            }
            .playground-page button {
                background: #007acc;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .playground-page button:hover { background: #005f9e; }
            .playground-page button.secondary { background: #333; }
            .playground-page button.secondary:hover { background: #444; }
            .playground-page button.danger { background: #d16969; }
            .playground-page button.danger:hover { background: #a14e4e; }
            
            .playground-page .split-panel {
                display: flex;
                flex: 1;
                gap: 20px;
                min-height: 0;
            }
            .playground-page .panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: #252526;
                border: 1px solid #333;
                border-radius: 8px;
                overflow: hidden;
            }
            .playground-page .url-bar {
                display: flex;
                padding: 10px;
                background: #2d2d2d;
                gap: 10px;
                border-bottom: 1px solid #333;
            }
            .playground-page select, .playground-page input {
                background: #3c3c3c;
                color: #fff;
                border: 1px solid #555;
                padding: 8px;
                border-radius: 4px;
            }
            .playground-page input.url { flex: 1; }
            
            .playground-page .tabs {
                display: flex;
                background: #2d2d2d;
                border-bottom: 1px solid #333;
            }
            .playground-page .tab {
                padding: 10px 20px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
            }
            .playground-page .tab.active {
                border-bottom-color: #007acc;
                color: #fff;
            }
            
            .playground-page .tab-content {
                flex: 1;
                overflow: auto;
                padding: 15px;
            }
            
            .playground-page .kv-row {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
            }
            .playground-page .kv-row input { flex: 1; }
            
            .playground-page textarea {
                width: 100%;
                height: 100%;
                background: #1e1e1e;
                color: #d4d4d4;
                border: 1px solid #333;
                padding: 10px;
                font-family: monospace;
                box-sizing: border-box;
                resize: none;
            }
            
            .playground-page .status-bar {
                display: flex;
                padding: 10px;
                background: #2d2d2d;
                border-bottom: 1px solid #333;
                gap: 15px;
                font-size: 13px;
            }
            .playground-page .badge {
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: bold;
            }
            .playground-page .badge.ok { background: #23d160; color: #fff; }
            .playground-page .badge.warn { background: #ffdd57; color: #000; }
            .playground-page .badge.err { background: #ff3860; color: #fff; }
            
            .playground-page pre { margin: 0; white-space: pre-wrap; font-family: monospace; }
            .playground-page .string { color: #ce9178; }
            .playground-page .number { color: #b5cea8; }
            .playground-page .boolean, .playground-page .null { color: #569cd6; }
            .playground-page .key { color: #9cdcfe; }

            .playground-page .modal-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
            }
            .playground-page .modal {
                background: #252526;
                border: 1px solid #333;
                border-radius: 8px;
                width: 800px;
                max-width: 90vw;
                height: 600px;
                display: flex;
                flex-direction: column;
            }
            .playground-page .modal-header {
                padding: 15px;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .playground-page .modal-body {
                flex: 1;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                overflow: hidden;
            }
        </style>
        
        <div class="playground-page">
            <div class="container">
                <div class="header-actions">
                    <button class="secondary" id="btn-chat-tpl">Chat Completion</button>
                    <button class="secondary" id="btn-models-tpl">List Models</button>
                    <button class="secondary" id="btn-code">Generate Code</button>
                </div>
                
                <div class="split-panel">
                    <!-- Request Panel -->
                    <div class="panel">
                        <div class="url-bar">
                            <select id="method-select">
                                ${['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].map(m => 
                                    `<option value="${m}" ${method === m ? 'selected' : ''}>${m}</option>`
                                ).join('')}
                            </select>
                            <input type="text" class="url" id="url-input" value="${url}" placeholder="https://api.example.com/v1/...">
                            <button id="btn-send">Send</button>
                            <button class="secondary" id="btn-stream">Send & Stream</button>
                            ${abortController ? '<button class="danger" id="btn-cancel">Cancel</button>' : ''}
                        </div>
                        
                        <div class="tabs">
                            ${['Params', 'Headers', 'Auth', 'Body'].map(t => 
                                `<div class="tab ${activeReqTab === t ? 'active' : ''}" data-tab="${t}">${t}</div>`
                            ).join('')}
                            <label style="margin-left: auto; display: flex; align-items: center; padding: 0 10px;">
                                <input type="checkbox" id="stream-toggle" ${isStreaming ? 'checked' : ''}> Stream
                            </label>
                        </div>
                        
                        <div class="tab-content">
                            ${activeReqTab === 'Params' ? renderKVEditor('params') : ''}
                            ${activeReqTab === 'Headers' ? renderKVEditor('headersList') : ''}
                            ${activeReqTab === 'Auth' ? `
                                <div>
                                    <select id="auth-type">
                                        ${['None','Bearer','API Key'].map(a => `<option ${authType===a?'selected':''}>${a}</option>`).join('')}
                                    </select>
                                    <div style="margin-top: 15px;">
                                        ${authType !== 'None' ? `<input type="password" style="width: 100%" id="auth-val" value="${authValue}" placeholder="Token / Key">` : ''}
                                    </div>
                                </div>
                            ` : ''}
                            ${activeReqTab === 'Body' ? `
                                <textarea id="body-input" placeholder="{ \\"key\\": \\"value\\" }">${bodyContent}</textarea>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Response Panel -->
                    <div class="panel">
                        <div class="status-bar">
                            ${responseStatus ? `
                                <span class="badge ${responseStatus < 300 ? 'ok' : responseStatus < 500 ? 'warn' : 'err'}">
                                    ${responseStatus} ${responseStatusText}
                                </span>
                                <span>${responseTime} ms</span>
                                <span>${responseSize} B</span>
                            ` : '<span>No response yet</span>'}
                        </div>
                        
                        <div class="tabs">
                            ${['Body', 'Headers', 'Stream'].map(t => 
                                `<div class="tab ${activeResTab === t ? 'active' : ''}" data-restab="${t}">${t}</div>`
                            ).join('')}
                        </div>
                        
                        <div class="tab-content" style="background: #1e1e1e;">
                            ${activeResTab === 'Body' ? `
                                <pre>${highlightJSON(responseBody)}</pre>
                            ` : ''}
                            ${activeResTab === 'Stream' ? `
                                <pre>${streamContent}</pre>
                            ` : ''}
                            ${activeResTab === 'Headers' ? `
                                <table style="width: 100%; text-align: left; border-collapse: collapse;">
                                    ${Object.entries(responseHeaders).map(([k, v]) => 
                                        `<tr>
                                            <th style="padding: 5px; border-bottom: 1px solid #333;">${k}</th>
                                            <td style="padding: 5px; border-bottom: 1px solid #333;">${v}</td>
                                        </tr>`
                                    ).join('')}
                                </table>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>

            ${showCodeModal ? `
                <div class="modal-overlay" id="modal-bg">
                    <div class="modal" id="modal">
                        <div class="modal-header">
                            <h3>Generate Code</h3>
                            <button class="secondary" id="btn-close-modal">Close</button>
                        </div>
                        <div class="tabs">
                            ${['curl', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Java', 'C#', 'PHP'].map(l => 
                                `<div class="tab ${selectedCodeLang === l ? 'active' : ''}" data-lang="${l}">${l}</div>`
                            ).join('')}
                        </div>
                        <div class="modal-body">
                            <textarea readonly style="flex: 1; font-family: monospace;">${generatedCode}</textarea>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    attachEvents();
}

function attachEvents() {
    const content = document.getElementById('content');
    if (!content) return;

    content.querySelector('#method-select')?.addEventListener('change', (e) => {
        method = (e.target as HTMLSelectElement).value;
    });
    content.querySelector('#url-input')?.addEventListener('input', (e) => {
        url = (e.target as HTMLInputElement).value;
    });
    content.querySelector('#body-input')?.addEventListener('input', (e) => {
        bodyContent = (e.target as HTMLTextAreaElement).value;
    });
    
    content.querySelector('#btn-send')?.addEventListener('click', () => sendRequest(false));
    content.querySelector('#btn-stream')?.addEventListener('click', () => sendRequest(true));
    content.querySelector('#btn-cancel')?.addEventListener('click', () => cancelRequest());

    content.querySelector('#btn-chat-tpl')?.addEventListener('click', () => setTemplate('chat'));
    content.querySelector('#btn-models-tpl')?.addEventListener('click', () => setTemplate('models'));
    content.querySelector('#btn-code')?.addEventListener('click', () => { showCodeModal = true; renderUI(); });
    
    content.querySelector('#btn-close-modal')?.addEventListener('click', () => { showCodeModal = false; renderUI(); });
    content.querySelector('#modal-bg')?.addEventListener('click', (e) => {
        if (e.target === content.querySelector('#modal-bg')) {
            showCodeModal = false;
            renderUI();
        }
    });

    content.querySelectorAll('.tab[data-tab]').forEach(el => {
        el.addEventListener('click', (e) => {
            activeReqTab = (e.target as HTMLElement).dataset.tab!;
            renderUI();
        });
    });
    content.querySelectorAll('.tab[data-restab]').forEach(el => {
        el.addEventListener('click', (e) => {
            activeResTab = (e.target as HTMLElement).dataset.restab!;
            renderUI();
        });
    });
    content.querySelectorAll('.tab[data-lang]').forEach(el => {
        el.addEventListener('click', (e) => {
            selectedCodeLang = (e.target as HTMLElement).dataset.lang!;
            renderUI();
        });
    });
    
    content.querySelector('#stream-toggle')?.addEventListener('change', (e) => {
        isStreaming = (e.target as HTMLInputElement).checked;
    });

    content.querySelector('#auth-type')?.addEventListener('change', (e) => {
        authType = (e.target as HTMLSelectElement).value;
        renderUI();
    });
    content.querySelector('#auth-val')?.addEventListener('input', (e) => {
        authValue = (e.target as HTMLInputElement).value;
    });

    // KV Editors
    const updateKV = (e: Event, field: 'key' | 'value' | 'active') => {
        const target = e.target as HTMLInputElement;
        const listName = target.dataset.list as 'params' | 'headersList';
        const idx = parseInt(target.dataset.idx!);
        const list = listName === 'params' ? params : headersList;
        if (field === 'active') {
            list[idx].active = target.checked;
        } else {
            list[idx][field] = target.value;
        }
    };

    content.querySelectorAll('.kv-key').forEach(el => el.addEventListener('input', (e) => updateKV(e, 'key')));
    content.querySelectorAll('.kv-val').forEach(el => el.addEventListener('input', (e) => updateKV(e, 'value')));
    content.querySelectorAll('.kv-check').forEach(el => el.addEventListener('change', (e) => updateKV(e, 'active')));
    
    content.querySelectorAll('.kv-add').forEach(el => {
        el.addEventListener('click', (e) => {
            const listName = (e.target as HTMLElement).dataset.list as 'params' | 'headersList';
            const list = listName === 'params' ? params : headersList;
            list.push({key: '', value: '', active: true});
            renderUI();
        });
    });
    
    content.querySelectorAll('.kv-del').forEach(el => {
        el.addEventListener('click', (e) => {
            const listName = (e.target as HTMLElement).dataset.list as 'params' | 'headersList';
            const idx = parseInt((e.target as HTMLElement).dataset.idx!);
            const list = listName === 'params' ? params : headersList;
            list.splice(idx, 1);
            renderUI();
        });
    });
}

export async function render(): Promise<void> {
    renderUI();
}
