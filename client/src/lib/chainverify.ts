// Must match server/locations.js; the server rejects any location not listed there.
export const LOCATIONS = [
  'Tokyo',
  'London',
  'New York',
  'Mumbai',
  'Dubai',
  'Paris',
  'Singapore',
  'Sydney',
  'San Francisco',
  'Toronto',
  'Berlin',
  'Geneva',
  'California',
  'Texas',
] as const;

export interface ScanEvent {
  index: number;
  hash: string;
  timestamp: string;
  type: 'MINT' | 'SCAN';
  location: string;
  stage: string;
  aiResult: { trustScore: number; isAuthentic: boolean; anomalies: string[] } | null;
}

export interface ProductHistory {
  productId: string;
  name: string;
  image?: string;
  events: ScanEvent[];
}

// Reads a JSON response and throws the server's error message on failure
export async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || `Request failed (${response.status})`);
  }
  return body as T;
}

export const STAGES = ['Factory', 'Warehouse', 'Distributor', 'Retailer', 'Consumer'] as const;

// Same coordinates as server/locations.js, used to place cities on the network map
export const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Dubai: { lat: 25.2048, lon: 55.2708 },
  London: { lat: 51.5074, lon: -0.1278 },
  'New York': { lat: 40.7128, lon: -74.006 },
  Tokyo: { lat: 35.6762, lon: 139.6503 },
  Paris: { lat: 48.8566, lon: 2.3522 },
  Singapore: { lat: 1.3521, lon: 103.8198 },
  Sydney: { lat: -33.8688, lon: 151.2093 },
  'San Francisco': { lat: 37.7749, lon: -122.4194 },
  Toronto: { lat: 43.651, lon: -79.347 },
  Berlin: { lat: 52.52, lon: 13.405 },
  Geneva: { lat: 46.2044, lon: 6.1432 },
  California: { lat: 36.7783, lon: -119.4179 },
  Texas: { lat: 31.9686, lon: -99.9018 },
};

export interface AIResult {
  trustScore: number;
  isAuthentic: boolean;
  anomalies: string[];
}

export interface BlockData {
  type?: 'MINT' | 'SCAN';
  productId?: string;
  location?: string;
  stage?: string;
  image?: string;
  aiResult?: AIResult;
  tampered?: boolean;
  message?: string;
}

export interface Block {
  index: number;
  timestamp: string;
  data: BlockData;
  previousHash: string;
  hash: string;
}

export interface ChainResponse {
  chain: Block[];
  isValid: boolean;
  invalidBlock: number;
}

export interface Alert {
  id: number;
  timestamp: string;
  productId: string;
  location: string;
  anomalies: string[];
  trustScore: number;
}

export type ProductMap = Record<string, { name: string; image?: string }>;

// The three rules in server/AIEngine.js, keyed by the prefix of the anomaly text they produce
export const RULES = [
  {
    key: 'Geospatial Velocity',
    name: 'Impossible travel',
    detail: 'Two scans more than 3,000 miles apart within 60 minutes.',
    penalty: 50,
  },
  {
    key: 'Scan Frequency',
    name: 'Scan flooding',
    detail: '20 or more scans of the same product within one hour.',
    penalty: 40,
  },
  {
    key: 'Supply Chain Order',
    name: 'Stage out of order',
    detail: 'A scan at an earlier stage after a later one, such as Factory after Distributor.',
    penalty: 30,
  },
] as const;

export function ruleFor(anomaly: string) {
  return RULES.find((r) => anomaly.startsWith(r.key));
}

// Strips the "Rule Name Anomaly: " prefix so the explanation reads on its own
export function anomalyDetail(anomaly: string) {
  const i = anomaly.indexOf(': ');
  return i === -1 ? anomaly : anomaly.slice(i + 2);
}

export function shortHash(hash: string, size = 10) {
  return hash.length <= size * 2 ? hash : `${hash.slice(0, size)}…${hash.slice(-6)}`;
}

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.max(s, 0)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
