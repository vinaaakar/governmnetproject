/**
 * TN-UCRS Officer Identity Synchronization Utility
 * This logic MUST match backend/data/statewideOfficerRegistry.js exactly.
 */

const DEPARTMENTS = [
  { id: 'tangedco', name: 'TANGEDCO', domain: 'tneb.tn.gov.in', prefix: 'ae', code: 'TNEB' },
  { id: 'twad', name: 'TWAD', domain: 'twad.tn.gov.in', prefix: 'ee', code: 'TWAD' },
  { id: 'revenue', name: 'Revenue', domain: 'revenue.tn.gov.in', prefix: 'rdo', code: 'REV' },
  { id: 'police', name: 'Police', domain: 'tnpolice.gov.in', prefix: 'si', code: 'POL' },
  { id: 'transport', name: 'Transport', domain: 'tnrtc.tn.gov.in', prefix: 'rto', code: 'RTO' },
  { id: 'health', name: 'Health', domain: 'tnhealth.org.in', prefix: 'mo', code: 'MED' },
  { id: 'rural', name: 'Rural Development', domain: 'tnrd.gov.in', prefix: 'bdo', code: 'RRD' },
  { id: 'municipal', name: 'Municipal Administration', domain: 'tnma.gov.in', prefix: 'comm', code: 'MUN' },
  { id: 'agri', name: 'Agriculture', domain: 'tnagrisnet.tn.gov.in', prefix: 'ao', code: 'AGR' },
  { id: 'edu', name: 'Education', domain: 'tnschools.gov.in', prefix: 'ceo', code: 'EDU' }
];

const UNIVERSAL_PASSWORD = "admin1234$";

/**
 * Generates an officer identity that is guaranteed to exist in the synchronized registry.
 */
export const generateOfficerIdentity = (district, taluk, department) => {
  if (!district || !taluk || !department) return null;

  const deptName = typeof department === 'string' ? department : department.name;
  const districtName = typeof district === 'string' ? district : district.name;
  const talukName = typeof taluk === 'string' ? taluk : taluk.name;

  let cleanDeptName = deptName;
  if (deptName === 'TWAD Board') cleanDeptName = 'TWAD';
  else if (deptName === 'Revenue Department') cleanDeptName = 'Revenue';
  else if (deptName === 'Police Department') cleanDeptName = 'Police';
  else if (deptName === 'Health Department') cleanDeptName = 'Health';
  else if (deptName === 'Rural Development') cleanDeptName = 'Rural Development';
  else if (deptName === 'Municipal Administration') cleanDeptName = 'Municipal Administration';

  const dept = DEPARTMENTS.find(d => d.name === cleanDeptName);
  if (!dept) return null;

  const districtClean = districtName.toUpperCase();
  const talukSlug = talukName.toLowerCase().replace(/\s+/g, '');
  
  const seedSuffix = "480"; // Standardized for synchronization

  return {
    fullName: `${dept.name} Officer - ${talukName}`,
    email: `${dept.prefix}.${talukSlug}@${dept.domain}`,
    employeeId: `${dept.code}-${districtClean}-${talukSlug.toUpperCase()}-${seedSuffix}`,
    defaultPassword: UNIVERSAL_PASSWORD,
    officeCode: `${districtClean}-${talukSlug.toUpperCase()}-${dept.code}-NODE`,
    clearanceLevel: 2,
    registryStatus: 'SYNCHRONIZED'
  };
};
