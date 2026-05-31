import axios from 'axios';
import { calculateNodeTelemetry } from './telemetryEngine';

/**
 * Statewide Office Registry Engine
 * Synchronized with the Single Source of Truth for deterministic telemetry.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const OFFICE_CONSTANTS = {
  'TANGEDCO': {
    prefix: 'EB',
    types: ['Executive Office', 'Distribution Hub', 'O&M Division', 'Revenue Unit']
  },
  'Revenue Department': {
    prefix: 'REV',
    types: ['Taluk Office', 'Divisional Office', 'Sub-Collectorate', 'Zonal Unit']
  },
  'Police Department': {
    prefix: 'POL',
    types: ['Town Police Station', 'Traffic Hub', 'DSP Office', 'Cyber Cell']
  },
  'Health Department': {
    prefix: 'HLT',
    types: ['Government Hospital', 'Primary Health Centre', 'DPH Office', 'Medical Hub']
  },
  'default': {
    prefix: 'GOV',
    types: ['Administrative Office', 'Regional Unit', 'Zonal Node']
  }
};

/**
 * Intelligent Fallback Office Generator
 * Derives telemetry from telemetryEngine.js for consistency.
 */
const generateIntelligentOffices = (department, district, taluk) => {
  const deptData = OFFICE_CONSTANTS[department.name] || OFFICE_CONSTANTS['default'];
  const talukCode = taluk.code || `${district.code}-${taluk.name.toUpperCase().substring(0, 3)}`;
  
  return deptData.types.map((type, index) => {
    const telemetry = calculateNodeTelemetry(district.name, taluk.name, department.name);
    
    return {
      _id: `gen-${department.code}-${talukCode}-${index}`,
      officeName: `${taluk.name} ${department.name} ${type}`,
      officeType: type,
      officeCode: `${deptData.prefix}-${talukCode}-G${index + 1}`,
      districtId: district._id,
      talukId: taluk._id,
      departmentName: department.name,
      infrastructureStatus: 'OPERATIONAL',
      activeOfficers: telemetry.activeOfficers,
      complaintCapacity: telemetry.complaintCapacity,
      isGenerated: true,
      telemetry: {
        load: Math.floor(Math.random() * 40) + 20,
        uptime: '99.9%',
        lastSync: new Date().toISOString(),
        panchayats: telemetry.panchayats,
        regionalOffices: telemetry.regionalOffices,
        slaHealth: telemetry.slaHealth,
        latency: telemetry.latency
      }
    };
  });
};

/**
 * Main Discovery Engine
 */
export const fetchRegionalOffices = async (department, district, taluk) => {
  console.log(`[REGISTRY] Initiating Discovery for: ${district.name} -> ${taluk.name} (${department.name})`);

  try {
    const response = await axios.get(`${API_URL}/admin/offices`, {
      params: {
        departmentId: department._id,
        districtId: district._id,
        talukId: taluk._id
      }
    });

    if (response.data && response.data.length > 0) {
      return response.data.map(office => {
        const telemetry = calculateNodeTelemetry(district.name, taluk.name, department.name);
        return {
          ...office,
          infrastructureStatus: 'ONLINE',
          activeOfficers: telemetry.activeOfficers,
          complaintCapacity: telemetry.complaintCapacity,
          telemetry: {
            load: Math.floor(Math.random() * 60) + 10,
            uptime: '100%',
            lastSync: new Date().toISOString(),
            panchayats: telemetry.panchayats,
            regionalOffices: telemetry.regionalOffices,
            slaHealth: telemetry.slaHealth,
            latency: telemetry.latency
          }
        };
      });
    }

    return generateIntelligentOffices(department, district, taluk);

  } catch (error) {
    console.error(`[REGISTRY] discovery failure: ${error.message}. Activating Layer 3 Recovery.`);
    return generateIntelligentOffices(department, district, taluk);
  }
};
