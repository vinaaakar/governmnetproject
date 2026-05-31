/**
 * Tamil Nadu Statewide Officer Registry - Master Configuration
 * Centralized source of truth for all administrative nodes and credential patterns.
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

const CLEARANCE_LEVELS = {
  VILLAGE: 1,
  TALUK: 2,
  DISTRICT: 3,
  REGIONAL: 4,
  STATE: 5
};

const OFFICE_TYPES = {
  EXECUTIVE: 'Executive Office',
  REGIONAL: 'Regional Node',
  DISTRICT: 'District Headquarters',
  TALUK: 'Taluk Office',
  VILLAGE: 'Village Administrative Center'
};

// Simplified State Registry for Backend Use
const DISTRICT_REGISTRY = {
  Ariyalur: ['Ariyalur', 'Sendurai', 'Udayarpalayam', 'Andimadam'],
  Chengalpattu: ['Chengalpattu', 'Tambaram', 'Pallavaram', 'Vandalur', 'Thiruporur', 'Tirukalukundram', 'Madurantakam', 'Cheyyur'],
  Chennai: ['Tondiarpet', 'Purasawalkam', 'Ayanavaram', 'Aminjikarai', 'Egmore', 'Mylapore', 'Mambalam', 'Guindy', 'Velachery', 'Alandur', 'Sholinganallur', 'Perambur', 'Madhavaram', 'Thiruvottiyur', 'Manali', 'Ambattur'],
  Coimbatore: ['Coimbatore North', 'Coimbatore South', 'Mettupalayam', 'Pollachi', 'Sulur', 'Valparai', 'Kinathukadavu', 'Annur', 'Madukkarai', 'Perur', 'Anaimalai'],
  Cuddalore: ['Cuddalore', 'Chidambaram', 'Kattumannarkoil', 'Panruti', 'Kurinjipadi', 'Titakudi', 'Vridhachalam', 'Veppur', 'Bhuvanagiri', 'Srimushnam'],
  Dharmapuri: ['Dharmapuri', 'Palacode', 'Pennagaram', 'Harur', 'Pappireddipatti', 'Karimangalam', 'Nallampalli'],
  Dindigul: ['Dindigul', 'Palani', 'Kodaikanal', 'Oddanchatram', 'Natham', 'Nilakottai', 'Vedasandur', 'Attur', 'Guziliyamparai'],
  Erode: ['Erode', 'Bhavani', 'Gobichettipalayam', 'Perundurai', 'Sathyamangalam', 'Anthiyur', 'Kodumudi', 'Modakkurichi', 'Thalavadi', 'Nambiyur'],
  Kallakurichi: ['Kallakurichi', 'Sankarapuram', 'Chinnasalem', 'Tirukkovilur', 'Ulundurpet', 'Kalvarayan Hills'],
  Kanchipuram: ['Kanchipuram', 'Sriperumbudur', 'Uthiramerur', 'Walajabad', 'Kundrathur'],
  Kanyakumari: ['Agasteeswaram', 'Kalkulam', 'Vilavancode', 'Thovalai', 'Thiruvattar', 'Killiyoor'],
  Karur: ['Karur', 'Aravakurichi', 'Krishnarayapuram', 'Kulithalai', 'Kadavur', 'Pugalur', 'Manmangalam'],
  Krishnagiri: ['Krishnagiri', 'Hosur', 'Pochampalli', 'Uthangarai', 'Denkanikottai', 'Bargur', 'Shoolagiri', 'Anchetti'],
  Madurai: ['Madurai North', 'Madurai South', 'Madurai East', 'Madurai West', 'Melur', 'Thirumangalam', 'Usilampatti', 'Peraiyur', 'Vadipatti', 'Thiruparankundram', 'Kalligudi'],
  Mayiladuthurai: ['Mayiladuthurai', 'Sirkali', 'Tharangambadi', 'Kuthalam'],
  Nagapattinam: ['Nagapattinam', 'Kilvelur', 'Thirukuvalai', 'Vedaranyam'],
  Namakkal: ['Namakkal', 'Rasipuram', 'Tiruchengode', 'Paramathi Velur', 'Kolli Hills', 'Sendamangalam', 'Komarapalayam', 'Mohanur'],
  Nilgiris: ['Udhagamandalam', 'Coonoor', 'Kotagiri', 'Gudalur', 'Pandalur', 'Kundah'],
  Perambalur: ['Perambalur', 'Kunnam', 'Alathur', 'Veppanthattai'],
  Pudukkottai: ['Pudukkottai', 'Alangudi', 'Aranthangi', 'Avadaiyarkoil', 'Gandarvakottai', 'Iluppur', 'Karambakkudi', 'Kulathur', 'Manamelkudi', 'Ponnamaravathi', 'Thirumayam', 'Viralimalai'],
  Ramanathapuram: ['Ramanathapuram', 'Rameswaram', 'Paramakudi', 'Kamuthi', 'Mudukulathur', 'Kadaladi', 'Tiruvadanai', 'R.S. Mangalam', 'Kezhakarai'],
  Ranipet: ['Arakkonam', 'Arcot', 'Walajah', 'Nemili', 'Sholingur', 'Kalavai'],
  Salem: ['Salem', 'Salem South', 'Salem West', 'Attur', 'Edappadi', 'Gangavalli', 'Kadaiyampatti', 'Mettur', 'Omalur', 'Pethanaickenpalayam', 'Sankari', 'Vazhapadi', 'Yercaud'],
  Sivagangai: ['Sivagangai', 'Karaikudi', 'Devakottai', 'Manamadurai', 'Ilayangudi', 'Tirupuvanam', 'Tirupathur', 'Kalaiyarkoil', 'Singampunari'],
  Tenkasi: ['Tenkasi', 'Alangulam', 'Kadayanallur', 'Sankarankoil', 'Shenkottai', 'Sivagiri', 'Thiruvengadam', 'V.K.Pudur'],
  Thanjavur: ['Thanjavur', 'Kumbakonam', 'Papanasam', 'Pattukkottai', 'Peravurani', 'Orathanadu', 'Thiruvidaimarudur', 'Thiruvaiyaru', 'Budalur'],
  Theni: ['Theni', 'Periyakulam', 'Andipatti', 'Uthamapalayam', 'Bodinayakanur'],
  Thoothukudi: ['Thoothukudi', 'Tiruchendur', 'Kovilpatti', 'Ettayapuram', 'Vilathikulam', 'Srivaikuntam', 'Sathankulam', 'Ottapidaram', 'Kayathar', 'Eral'],
  Tiruchirappalli: ['Lalgudi', 'Manachanallur', 'Manapparai', 'Musiri', 'Srirangam', 'Thiruverumbur', 'Tiruchirappalli East', 'Tiruchirappalli West', 'Thuraiyur', 'Marungapuri', 'Illuppur'],
  Tirunelveli: ['Tirunelveli', 'Palayamkottai', 'Ambasamudram', 'Nanguneri', 'Radhapuram', 'Tenkasi', 'Shenkottai', 'Alangulam'],
  Tirupathur: ['Tirupathur', 'Vaniyambadi', 'Ambur', 'Natrampalli'],
  Tiruppur: ['Tiruppur North', 'Tiruppur South', 'Avinashi', 'Palladam', 'Kangeyam', 'Dharapuram', 'Udumalaipettai', 'Madathukulam', 'Uthukuli'],
  Tiruvallur: ['Tiruvallur', 'Avadi', 'Poonamallee', 'Ponneri', 'Gummidipoondi', 'Uthukkottai', 'Tiruttani', 'Pallipattu', 'R.K. Pet'],
  Tiruvannamalai: ['Tiruvannamalai', 'Arni', 'Chengam', 'Polur', 'Vandavasi', 'Cheyyar', 'Thandarampet', 'Kalasapakkam', 'Chetpet', 'Kilpennathur', 'Vembakkam', 'Jamunamarathur'],
  Tiruvarur: ['Tiruvarur', 'Mannargudi', 'Needamangalam', 'Thiruthuraipoondi', 'Nannilam', 'Kodavasal', 'Valangaiman', 'Koothanallur'],
  Vellore: ['Vellore', 'Katpadi', 'Gudiyatham', 'Pernambut', 'Anaicut', 'K.V.Kuppam'],
  Viluppuram: ['Viluppuram', 'Tindivanam', 'Gingee', 'Vanur', 'Marakkanam', 'Vikravandi', 'Kandachipuram', 'Tiruvennainallur', 'Melmalaiyanur'],
  Virudhunagar: ['Virudhunagar', 'Aruppukottai', 'Sivakasi', 'Srivilliputhur', 'Rajapalayam', 'Sathur', 'Kariapatti', 'Tiruchuli', 'Vembakottai', 'Watrap']
};

const { getUniversalPassword } = require('../utils/passwordPolicyEngine');

/**
 * Generates a consistent officer identity based on node parameters.
 */
const generateOfficerIdentity = (district, taluk, departmentName) => {
  const dept = DEPARTMENTS.find(d => d.name === departmentName);
  if (!dept) return null;

  const districtClean = district.toUpperCase();
  const talukSlug = taluk.toLowerCase().replace(/\s+/g, '');
  
  return {
    fullName: `${dept.name} Officer - ${taluk}`,
    email: `${dept.prefix}.${talukSlug}@${dept.domain}`,
    employeeId: `${dept.code}-${districtClean}-${talukSlug.toUpperCase()}-480`,
    password: getUniversalPassword(),
    officeCode: `${districtClean}-${talukSlug.toUpperCase()}-${dept.code}-NODE`,
    clearanceLevel: 2,
    permissions: [
      "ACCESS_NODE",
      "VIEW_COMPLAINTS",
      "MANAGE_ROUTING",
      "ESCALATE_NODE",
      "RESOLVE_COMPLAINTS"
    ],
    status: 'ACTIVE',
    registryStatus: 'SYNCHRONIZED'
  };
};

module.exports = {
  DEPARTMENTS,
  DISTRICT_REGISTRY,
  CLEARANCE_LEVELS,
  OFFICE_TYPES,
  generateOfficerIdentity
};
