import { ProviderAdapter } from '../providers/types';

export type RoutingStrategy = 'fixed' | 'round-robin' | 'random' | 'lowest-latency';

// Simple latency tracker
const latencyMap: Record<string, number[]> = {};

export function recordLatency(endpointId: string, latency: number) {
    if (!latencyMap[endpointId]) {
        latencyMap[endpointId] = [];
    }
    latencyMap[endpointId].push(latency);
    if (latencyMap[endpointId].length > 10) {
        latencyMap[endpointId].shift(); // keep last 10
    }
}

export function getAverageLatency(endpointId: string): number {
    const latencies = latencyMap[endpointId];
    if (!latencies || latencies.length === 0) return 0;
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
}

export async function routeToEndpoint(
    endpoints: ProviderAdapter[], 
    strategy: RoutingStrategy = 'fixed'
): Promise<ProviderAdapter> {
    if (!endpoints || endpoints.length === 0) {
        throw new Error('No endpoints provided');
    }

    if (endpoints.length === 1) {
        return endpoints[0];
    }

    switch (strategy) {
        case 'random':
            return endpoints[Math.floor(Math.random() * endpoints.length)];
        
        case 'lowest-latency':
            return endpoints.sort((a, b) => getAverageLatency(a.id) - getAverageLatency(b.id))[0];
            
        case 'round-robin':
        case 'fixed':
        default:
            return endpoints[0]; 
    }
}
