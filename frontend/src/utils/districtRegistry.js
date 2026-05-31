/**
 * Statewide District Registry - Dynamic Infrastructure Layer
 * Synchronized with the Single Source of Truth: stateRegistry.js
 */
import { STATE_REGISTRY } from '../data/stateRegistry';
import { calculateDistrictTelemetry } from './telemetryEngine';

// Dynamically generate the TAMIL_NADU_DISTRICTS array from the central registry
export const TAMIL_NADU_DISTRICTS = Object.entries(STATE_REGISTRY).map(([name, data]) => {
  const telemetry = calculateDistrictTelemetry(name);
  return {
    name,
    code: name.toUpperCase(), // Using full name for unique identifier
    cluster: data.cluster.split(' ')[0], 
    taluks: telemetry.talukCount,
    officers: telemetry.officerCount,
    nodes: telemetry.nodesCount,
    sla: telemetry.slaHealth,
    capacity: telemetry.throughput,
    latency: telemetry.latency,
    availability: telemetry.availability,
    fullCluster: data.cluster // "North Cluster Node"
  };
});

export const getDistrictMetadata = (name) => {
  return TAMIL_NADU_DISTRICTS.find(d => d.name === name) || TAMIL_NADU_DISTRICTS[0];
};

export const getClusterColor = (cluster) => {
  switch (cluster) {
    case 'North': return 'from-blue-600 to-indigo-700';
    case 'South': return 'from-emerald-600 to-teal-700';
    case 'West': return 'from-amber-600 to-orange-700';
    case 'East': return 'from-rose-600 to-pink-700';
    case 'Central': return 'from-purple-600 to-violet-700';
    default: return 'from-slate-600 to-slate-700';
  }
};
