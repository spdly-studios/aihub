import { dbGet, dbPut, dbDelete, dbGetAll, dbSearch, dbClear } from './db';
import { STORES } from './index';

export interface UsageRecord {
  id: string;
  timestamp: string;
  provider: string;
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latency: number;
  streaming: boolean;
  status: 'success' | 'error';
  errorType?: string;
}

export interface ProviderUsage {
  requests: number;
  tokens: number;
}
export interface ModelUsage {
  requests: number;
  tokens: number;
}
export interface DayUsage {
  requests: number;
  tokens: number;
}

export interface UsageSummary {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  averageLatency: number;
  streamingRequests: number;
  errors: number;
  byProvider: Record<string, ProviderUsage>;
  byModel: Record<string, ModelUsage>;
  byDay: Record<string, DayUsage>;
}

export async function recordUsage(record: UsageRecord): Promise<void> {
  await dbPut(STORES.usage, record);
}

export async function getUsageSummary(startDate?: string, endDate?: string): Promise<UsageSummary> {
  let records = await dbGetAll<UsageRecord>(STORES.usage);
  
  if (startDate || endDate) {
    records = records.filter(r => {
      const ts = new Date(r.timestamp).getTime();
      if (startDate && ts < new Date(startDate).getTime()) return false;
      if (endDate && ts > new Date(endDate).getTime()) return false;
      return true;
    });
  }
  
  const summary: UsageSummary = {
    totalRequests: records.length,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    averageLatency: 0,
    streamingRequests: 0,
    errors: 0,
    byProvider: {},
    byModel: {},
    byDay: {}
  };
  
  let totalLatency = 0;
  
  records.forEach(r => {
    summary.totalInputTokens += r.promptTokens || 0;
    summary.totalOutputTokens += r.completionTokens || 0;
    summary.totalTokens += r.totalTokens || 0;
    if (r.latency) totalLatency += r.latency;
    if (r.streaming) summary.streamingRequests++;
    if (r.status === 'error') summary.errors++;
    
    // byProvider
    if (!summary.byProvider[r.provider]) summary.byProvider[r.provider] = { requests: 0, tokens: 0 };
    summary.byProvider[r.provider].requests++;
    summary.byProvider[r.provider].tokens += r.totalTokens || 0;
    
    // byModel
    if (!summary.byModel[r.model]) summary.byModel[r.model] = { requests: 0, tokens: 0 };
    summary.byModel[r.model].requests++;
    summary.byModel[r.model].tokens += r.totalTokens || 0;
    
    // byDay
    const day = r.timestamp.split('T')[0];
    if (!summary.byDay[day]) summary.byDay[day] = { requests: 0, tokens: 0 };
    summary.byDay[day].requests++;
    summary.byDay[day].tokens += r.totalTokens || 0;
  });
  
  if (records.length > 0) {
    summary.averageLatency = totalLatency / records.length;
  }
  
  return summary;
}

export async function getUsageByProvider(provider: string): Promise<UsageRecord[]> {
  return await dbSearch<UsageRecord>(STORES.usage, r => r.provider === provider);
}

export async function getUsageByModel(model: string): Promise<UsageRecord[]> {
  return await dbSearch<UsageRecord>(STORES.usage, r => r.model === model);
}

export async function getUsageByDay(day: string): Promise<UsageRecord[]> {
  return await dbSearch<UsageRecord>(STORES.usage, r => r.timestamp.startsWith(day));
}

export async function clearUsage(): Promise<void> {
  await dbClear(STORES.usage);
}

export async function exportUsage(): Promise<string> {
  const records = await dbGetAll(STORES.usage);
  return JSON.stringify(records, null, 2);
}
