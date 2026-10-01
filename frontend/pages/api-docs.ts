import { copyToClipboard } from '../utils/helpers';
import { icon } from '../utils/icons';

export async function render() {
    const content = document.getElementById('content');
    if (!content) return;

    let currentLang = 'curl';

    const renderContent = () => `
        <div class="api-docs-container">
            <aside class="sidebar">
                <nav class="toc">
                    <ul>
                        <li><a href="#overview">Overview</a></li>
                        <li><a href="#authentication">Authentication</a></li>
                        <li><a href="#list-models">List Models</a></li>
                        <li><a href="#chat-completions">Chat Completions</a></li>
                        <li><a href="#model-aliases">Model Aliases</a></li>
                        <li><a href="#error-handling">Error Handling</a></li>
                        <li><a href="#health">Health</a></li>
                    </ul>
                </nav>
            </aside>
            <main class="content-body">
                <section id="overview">
                    <h2>Overview</h2>
                    <p>The SpDly AI API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes.</p>
                </section>
                
                <section id="authentication">
                    <h2>Authentication</h2>
                    <p>Authenticate your requests by including your secret API key in the Authorization header.</p>
                    <div class="code-block-container">
                        <div class="code-block">
                            <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
                            <button class="btn-copy" data-copy="Authorization: Bearer YOUR_API_KEY">${icon('copy')}</button>
                        </div>
                    </div>
                </section>

                <section id="list-models">
                    <h2>List Models</h2>
                    <p>Retrieves a list of currently available models.</p>
                    <div class="endpoint"><code>GET /v1/models</code></div>
                    <div class="language-tabs">
                        <button class="lang-tab ${currentLang === 'curl' ? 'active' : ''}" data-lang="curl">cURL</button>
                        <button class="lang-tab ${currentLang === 'python' ? 'active' : ''}" data-lang="python">Python</button>
                        <button class="lang-tab ${currentLang === 'js' ? 'active' : ''}" data-lang="js">JavaScript</button>
                        <button class="lang-tab ${currentLang === 'ts' ? 'active' : ''}" data-lang="ts">TypeScript</button>
                        <button class="lang-tab ${currentLang === 'openai' ? 'active' : ''}" data-lang="openai">OpenAI SDK</button>
                    </div>
                    <div class="code-block-container">
                        ${getExampleCode('list-models', currentLang)}
                    </div>
                </section>

                <section id="chat-completions">
                    <h2>Chat Completions</h2>
                    <p>Creates a model response for the given chat conversation.</p>
                    <div class="endpoint"><code>POST /v1/chat/completions</code></div>
                    <div class="code-block-container">
                        ${getExampleCode('chat-completions', currentLang)}
                    </div>
                </section>

                <section id="model-aliases">
                    <h2>Model Aliases</h2>
                    <p>You can use custom aliases configured in Settings instead of direct model IDs.</p>
                </section>
                
                <section id="error-handling">
                    <h2>Error Handling</h2>
                    <p>The API returns standard HTTP response codes to indicate the success or failure of an API request.</p>
                </section>
                
                <section id="health">
                    <h2>Health</h2>
                    <p>Check the health status of the API.</p>
                    <div class="endpoint"><code>GET /health</code></div>
                </section>
            </main>
        </div>
    `;

    function getExampleCode(endpoint: string, lang: string) {
        let code = '';
        if (endpoint === 'list-models') {
            if (lang === 'curl') code = 'curl http://localhost:3000/v1/models \\n  -H "Authorization: Bearer YOUR_API_KEY"';
            else if (lang === 'python') code = 'import requests\\nresponse = requests.get("http://localhost:3000/v1/models", headers={"Authorization": "Bearer YOUR_API_KEY"})';
            else if (lang === 'js') code = 'fetch("http://localhost:3000/v1/models", {\\n  headers: { "Authorization": "Bearer YOUR_API_KEY" }\\n})';
            else if (lang === 'ts') code = 'const res = await fetch("http://localhost:3000/v1/models", {\\n  headers: { "Authorization": "Bearer YOUR_API_KEY" }\\n});';
            else if (lang === 'openai') code = 'import OpenAI from "openai";\\nconst openai = new OpenAI({ baseURL: "http://localhost:3000/v1", apiKey: "YOUR_API_KEY" });\\nconst models = await openai.models.list();';
        } else if (endpoint === 'chat-completions') {
            if (lang === 'curl') code = 'curl http://localhost:3000/v1/chat/completions \\n  -H "Authorization: Bearer YOUR_API_KEY" \\n  -H "Content-Type: application/json" \\n  -d \'{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}\'';
            else code = '// Example code for chat completions in ' + lang;
        }

        return `
            <div class="code-block">
                <pre><code>${code.replace(/\\n/g, '\n')}</code></pre>
                <button class="btn-copy" data-copy="${code.replace(/\\n/g, '\n').replace(/"/g, '&quot;')}">${icon('copy')}</button>
            </div>
        `;
    }

    const attachListeners = () => {
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const text = target.getAttribute('data-copy');
                if (text) {
                    copyToClipboard(text);
                    const originalIcon = target.innerHTML;
                    target.innerHTML = icon('check');
                    setTimeout(() => { target.innerHTML = originalIcon; }, 2000);
                }
            });
        });

        document.querySelectorAll('.lang-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                currentLang = target.getAttribute('data-lang') || 'curl';
                
                // Re-render
                content.innerHTML = renderContent();
                attachListeners();
            });
        });
    };

    content.innerHTML = renderContent();
    attachListeners();
}
