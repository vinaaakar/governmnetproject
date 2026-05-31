/**
 * Statewide Administrative Registry - Pure Infrastructure Layer
 * Decoupled from React/UI dependencies to prevent circular deadlocks.
 */

export const STATIC_DEPARTMENTS = [
  { id: 'eb', name: 'TANGEDCO', desc: 'Electricity distribution and outage management.', coverage: '38 Districts', iconName: 'Zap' },
  { id: 'water', name: 'TWAD Board', desc: 'Water supply and drainage administration.', coverage: 'Urban + Rural Water Infrastructure', iconName: 'Droplets' },
  { id: 'corp', name: 'Greater Chennai Corporation', desc: 'Urban sanitation and civic administration.', coverage: 'Zones & Wards', iconName: 'Building2' },
  { id: 'pwd', name: 'Public Works Department', desc: 'Roads, bridges and public infrastructure.', coverage: 'Statewide', iconName: 'Hammer' },
  { id: 'revenue', name: 'Revenue Department', desc: 'Land, taluk and certificate administration.', coverage: '312 Taluks', iconName: 'Coins' },
  { id: 'police', name: 'Police Department', desc: 'Public safety and law enforcement routing.', coverage: '1,500+ Stations', iconName: 'Shield' },
  { id: 'health', name: 'Health Department', desc: 'Hospitals and public healthcare management.', coverage: 'District Hospitals', iconName: 'Stethoscope' },
  { id: 'rural', name: 'Rural Development', desc: 'Village panchayat and rural welfare systems.', coverage: '12,524 Panchayats', iconName: 'Home' },
];

export const ALL_DISTRICTS = [
  { id: 'CHN', name: 'Chennai', code: 'CHN', taluks: 15, offices: 210, officers: 482, region: 'North' },
  { id: 'CBE', name: 'Coimbatore', code: 'CBE', taluks: 11, offices: 145, officers: 312, region: 'West' },
  { id: 'MDU', name: 'Madurai', code: 'MDU', taluks: 13, offices: 142, officers: 238, region: 'South' },
  { id: 'SLM', name: 'Salem', code: 'SLM', taluks: 13, offices: 112, officers: 194, region: 'West' },
  { id: 'TRY', name: 'Tiruchirappalli', code: 'TRY', taluks: 11, offices: 108, officers: 182, region: 'Central' },
  { id: 'TNV', name: 'Tirunelveli', code: 'TNV', taluks: 8, offices: 94, officers: 156, region: 'South' }
];

export const TALUK_FALLBACK_DATA = {
  'Chennai': [
    { _id: 't1', name: 'Tondiarpet', code: 'CHN-TDP', status: 'ACTIVE' },
    { _id: 't2', name: 'Ambattur', code: 'CHN-AMB', status: 'ACTIVE' },
    { _id: 't5', name: 'Guindy', code: 'CHN-GDY', status: 'ACTIVE' }
  ],
  'Madurai': [
    { _id: 'm1', name: 'Melur', code: 'MDU-MLR', status: 'ACTIVE' },
    { _id: 'm5', name: 'Madurai North', code: 'MDU-NRH', status: 'ACTIVE' }
  ]
};
