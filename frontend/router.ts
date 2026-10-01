export interface Route {
  path: string;
  title: string;
  icon: string;
  render: () => Promise<void>;
}

const routes: Route[] = [
  { path: '/', title: 'Chat', icon: 'chat', render: () => import('./pages/chat').then(m => m.render()) },
  { path: '/workspace', title: 'Workspace', icon: 'workspace', render: () => import('./pages/workspace').then(m => m.render()) },
  { path: '/playground', title: 'Playground', icon: 'playground', render: () => import('./pages/playground').then(m => m.render()) },
  { path: '/endpoints', title: 'Endpoints', icon: 'endpoints', render: () => import('./pages/endpoints').then(m => m.render()) },
  { path: '/models', title: 'Models', icon: 'models', render: () => import('./pages/models').then(m => m.render()) },
  { path: '/providers', title: 'Providers', icon: 'providers', render: () => import('./pages/providers').then(m => m.render()) },
  { path: '/requests', title: 'Requests', icon: 'requests', render: () => import('./pages/requests').then(m => m.render()) },
  { path: '/files', title: 'Files', icon: 'files', render: () => import('./pages/files').then(m => m.render()) },
  { path: '/prompts', title: 'Prompts', icon: 'prompts', render: () => import('./pages/prompts').then(m => m.render()) },
  { path: '/agents', title: 'Agents', icon: 'agents', render: () => import('./pages/agents').then(m => m.render()) },
  { path: '/tools', title: 'Tools', icon: 'tools', render: () => import('./pages/tools').then(m => m.render()) },
  { path: '/api', title: 'API', icon: 'api', render: () => import('./pages/api-docs').then(m => m.render()) },
  { path: '/usage', title: 'Usage', icon: 'usage', render: () => import('./pages/usage').then(m => m.render()) },
  { path: '/settings', title: 'Settings', icon: 'settings', render: () => import('./pages/settings').then(m => m.render()) },
];

export function getRoutes(): Route[] {
  return routes;
}

export function getCurrentPath(): string {
  return window.location.pathname;
}

function findRoute(path: string): Route | undefined {
  return routes.find(r => r.path === path) || routes.find(r => path.startsWith(r.path) && r.path !== '/');
}

export async function navigate(path: string) {
  history.pushState({}, '', path);
  await handleRoute();
}

async function handleRoute() {
  const path = window.location.pathname;
  const route = findRoute(path);
  const content = document.getElementById('content');
  
  if (!content) return;

  if (route) {
    document.title = `${route.title} - SPDLY AI`;
    content.innerHTML = '<div class="loading">Loading...</div>'; // Simple loading state
    
    // Dispatch route change event
    window.dispatchEvent(new CustomEvent('routechange', { detail: { path, route } }));
    
    try {
      await route.render();
    } catch (err) {
      console.error(`Error rendering route ${path}:`, err);
      content.innerHTML = `
        <div class="error-state">
          <h2>Failed to load page</h2>
          <p>${err instanceof Error ? err.message : String(err)}</p>
        </div>
      `;
    }
  } else {
    document.title = '404 Not Found - SPDLY AI';
    content.innerHTML = `
      <div class="flex-center" style="height:100%;flex-direction:column;gap:1rem">
        <h1 class="text-2xl font-bold">404 - Not Found</h1>
        <p class="text-secondary">The page ${path} does not exist.</p>
        <button class="btn btn-primary" onclick="window.navigate('/')">Go Home</button>
      </div>
    `;
  }
}

export function initRouter() {
  window.addEventListener('popstate', handleRoute);
  
  // Intercept local links
  document.body.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (link && link.href.startsWith(window.location.origin)) {
      e.preventDefault();
      navigate(new URL(link.href).pathname);
    }
  });

  // Attach navigate globally for easy access in handlers
  (window as any).navigate = navigate;

  handleRoute();
}
