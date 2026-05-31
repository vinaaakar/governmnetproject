import { STATE_REGISTRY } from '../data/stateRegistry';

// Seeded random number generator for consistency (so cards don't constantly jump around randomly every render if not memoized, though we'll also memoize).
// Using a simple deterministic hash based on a string.
const seededRandom = (seed) => {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++)
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  const result = ((h ^ h >>> 16) >>> 0) / 4294967296;
  return result;
};

const URBAN_DISTRICTS = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'];

export const calculateDistrictTelemetry = (districtName) => {
  const districtData = STATE_REGISTRY[districtName];
  if (!districtData) return null;

  const talukCount = districtData.taluks.length;
  const isUrban = URBAN_DISTRICTS.includes(districtName);

  // Deterministic random generators based on district name to keep numbers stable across renders
  const randOfficer = seededRandom(districtName + '_officer');
  const randSla = seededRandom(districtName + '_sla');
  const randLatency = seededRandom(districtName + '_latency');
  const randAvail = seededRandom(districtName + '_avail');

  const officerMultiplier = Math.floor(randOfficer * (40 - 18 + 1)) + 18; // 18-40
  const officerCount = talukCount * officerMultiplier;

  const throughput = isUrban ? officerCount * 180 : officerCount * 90;

  const slaHealth = (92 + (randSla * (99 - 92))).toFixed(1) + '%';
  const latency = Math.floor(12 + (randLatency * (48 - 12))) + 'ms';
  const availability = (99.2 + (randAvail * (99.9 - 99.2))).toFixed(2) + '%';

  return {
    talukCount,
    officerCount,
    throughput: `${(throughput / 1000).toFixed(1)}k`,
    slaHealth,
    latency,
    availability,
    nodesCount: Math.floor(officerCount / 4) // Derived logical metric
  };
};

export const calculateNodeTelemetry = (districtName, talukName, departmentName) => {
  const isUrban = URBAN_DISTRICTS.includes(districtName);
  
  // Seed based on all parameters to guarantee stability for a specific node
  const seed = `${districtName}-${talukName}-${departmentName}`;
  const randOff = seededRandom(seed + '_off');
  const randPanchayat = seededRandom(seed + '_panch');
  const randReg = seededRandom(seed + '_reg');
  const randSla = seededRandom(seed + '_sla');
  const randLat = seededRandom(seed + '_lat');
  const randCap = seededRandom(seed + '_cap');
  
  return {
    activeOfficers: Math.floor(randOff * (isUrban ? 80 : 30)) + (isUrban ? 20 : 5),
    panchayats: isUrban ? Math.floor(randPanchayat * 10) + 2 : Math.floor(randPanchayat * 40) + 15,
    regionalOffices: Math.floor(randReg * 15) + 5,
    slaHealth: (92 + randSla * 7).toFixed(1) + '%',
    latency: Math.floor(12 + randLat * 30) + 'ms',
    complaintCapacity: Math.floor(randCap * 500 + 500) * (isUrban ? 2 : 1)
  };
};
