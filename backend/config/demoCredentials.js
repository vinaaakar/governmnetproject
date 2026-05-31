/**
 * TN-UCRS Government-Grade Demo Credentials
 * Universal Authentication Policy Active.
 */

const { getUniversalPassword } = require('../utils/passwordPolicyEngine');

const UNIVERSAL_PWD = getUniversalPassword();

const DEMO_OFFICERS = [
  {
    district: 'Chennai',
    taluk: 'Tondiarpet',
    department: 'TANGEDCO',
    email: 'ae.tondiarpet@tneb.tn.gov.in',
    employeeId: 'TNEB-CHENNAI-TONDIARPET-480',
    password: UNIVERSAL_PWD
  },
  {
    district: 'Madurai',
    taluk: 'Melur',
    department: 'Police',
    email: 'si.melur@tnpolice.gov.in',
    employeeId: 'POL-MADURAI-MELUR-480',
    password: UNIVERSAL_PWD
  },
  {
    district: 'Theni',
    taluk: 'Periyakulam',
    department: 'Revenue',
    email: 'rdo.periyakulam@revenue.tn.gov.in',
    employeeId: 'REV-THENI-PERIYAKULAM-480',
    password: UNIVERSAL_PWD
  }
];

module.exports = DEMO_OFFICERS;
