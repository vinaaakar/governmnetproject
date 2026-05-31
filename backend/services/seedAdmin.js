const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { District, Taluk, Village } = require('./models/AdminHierarchy');
const Department = require('./models/Department');
const Officer = require('./models/Officer');
const GovernmentOffice = require('./models/GovernmentOffice');

dotenv.config();

const districtsData = [
  { name: 'Ariyalur', code: 'ALR', region: 'Central', taluks: ['Ariyalur', 'Sendurai', 'Udayarpalayam', 'Andimadam'] },
  { name: 'Chengalpattu', code: 'CGL', region: 'North', taluks: ['Chengalpattu', 'Maduranthakam', 'Tambaram', 'Pallavaram', 'Tirukalukundram'] },
  { name: 'Chennai', code: 'CHN', region: 'North', taluks: ['Anna Nagar', 'Teynampet', 'Kodambakkam', 'Royapuram', 'Ambattur', 'Adayar'] },
  { name: 'Coimbatore', code: 'CBE', region: 'West', taluks: ['Coimbatore North', 'Coimbatore South', 'Pollachi', 'Mettupalayam', 'Sulur', 'Valparai'] },
  { name: 'Cuddalore', code: 'CUD', region: 'Central', taluks: ['Cuddalore', 'Chidambaram', 'Panruti', 'Vridhachalam'] },
  { name: 'Dharmapuri', code: 'DPI', region: 'West', taluks: ['Dharmapuri', 'Palacode', 'Pennagaram', 'Harur'] },
  { name: 'Dindigul', code: 'DGL', region: 'South', taluks: ['Dindigul West', 'Dindigul East', 'Palani', 'Kodaikanal', 'Natham'] },
  { name: 'Erode', code: 'ERD', region: 'West', taluks: ['Erode', 'Perundurai', 'Bhavani', 'Gobichettipalayam'] },
  { name: 'Kallakurichi', code: 'KLK', region: 'Central', taluks: ['Kallakurichi', 'Sankarapuram', 'Tirukkoyilur'] },
  { name: 'Kanchipuram', code: 'KPM', region: 'North', taluks: ['Kanchipuram', 'Sriperumbudur', 'Walajabad'] },
  { name: 'Kanyakumari', code: 'KKM', region: 'South', taluks: ['Agastheeswaram', 'Thovalai', 'Kalkulam', 'Vilavancode'] },
  { name: 'Karur', code: 'KRR', region: 'Central', taluks: ['Karur', 'Aravakurichi', 'Kulithalai'] },
  { name: 'Krishnagiri', code: 'KGI', region: 'West', taluks: ['Krishnagiri', 'Hosur', 'Denkanikottai', 'Bargur'] },
  { name: 'Madurai', code: 'MDU', region: 'South', taluks: ['Melur', 'Usilampatti', 'Tirumangalam', 'Vadipatti', 'Peraiyur', 'Madurai North', 'Madurai South'] },
  { name: 'Mayiladuthurai', code: 'MYL', region: 'Central', taluks: ['Mayiladuthurai', 'Sirkazhi', 'Kuthalam'] },
  { name: 'Nagapattinam', code: 'NGP', region: 'Central', taluks: ['Nagapattinam', 'Kilvelur', 'Thirukkuvalai'] },
  { name: 'Namakkal', code: 'NMK', region: 'West', taluks: ['Namakkal', 'Rasipuram', 'Tiruchengode', 'Paramathi Velur'] },
  { name: 'Nilgiris', code: 'NIL', region: 'West', taluks: ['Udhagamandalam', 'Coonoor', 'Kotagiri', 'Gudalur'] },
  { name: 'Perambalur', code: 'PBL', region: 'Central', taluks: ['Perambalur', 'Veppanthattai', 'Kunnam'] },
  { name: 'Pudukkottai', code: 'PDK', region: 'Central', taluks: ['Pudukkottai', 'Alangudi', 'Aranthangi', 'Illuppur'] },
  { name: 'Ramanathapuram', code: 'RAM', region: 'South', taluks: ['Ramanathapuram', 'Paramakudi', 'Rameswaram', 'Tiruvadanai'] },
  { name: 'Ranipet', code: 'RPT', region: 'North', taluks: ['Ranipet', 'Walajah', 'Arakkonam', 'Arcot'] },
  { name: 'Salem', code: 'SLM', region: 'West', taluks: ['Salem', 'Attur', 'Mettur', 'Omalur', 'Sankari'] },
  { name: 'Sivaganga', code: 'SVG', region: 'South', taluks: ['Sivaganga', 'Karaikudi', 'Devakottai', 'Manamadurai'] },
  { name: 'Tenkasi', code: 'TKS', region: 'South', taluks: ['Tenkasi', 'Sankarankovil', 'Sengottai', 'Alangulam'] },
  { name: 'Thanjavur', code: 'TNJ', region: 'Central', taluks: ['Thanjavur', 'Kumbakonam', 'Pattukkottai', 'Orathanadu'] },
  { name: 'Theni', code: 'THN', region: 'South', taluks: ['Theni', 'Periyakulam', 'Bodinayakanur', 'Uthamapalayam'] },
  { name: 'Thoothukudi', code: 'TUT', region: 'South', taluks: ['Thoothukudi', 'Srivaikuntam', 'Tiruchendur', 'Kovilpatti'] },
  { name: 'Tiruchirappalli', code: 'TRY', region: 'Central', taluks: ['Tiruchirappalli', 'Srirangam', 'Manapparai', 'Lalgudi', 'Musiri'] },
  { name: 'Tirunelveli', code: 'TNV', region: 'South', taluks: ['Tirunelveli', 'Palayamkottai', 'Ambasamudram', 'Nanguneri'] },
  { name: 'Tirupathur', code: 'TPT', region: 'North', taluks: ['Tirupathur', 'Vaniyambadi', 'Ambur', 'Natrampalli'] },
  { name: 'Tiruppur', code: 'TPR', region: 'West', taluks: ['Tiruppur', 'Avinashi', 'Dharapuram', 'Udumalaipettai'] },
  { name: 'Tiruvallur', code: 'TVL', region: 'North', taluks: ['Tiruvallur', 'Avadi', 'Ponneri', 'Gummidipoondi'] },
  { name: 'Tiruvannamalai', code: 'TVM', region: 'North', taluks: ['Tiruvannamalai', 'Arni', 'Chengam', 'Polur', 'Vandavasi'] },
  { name: 'Tiruvarur', code: 'TVR', region: 'Central', taluks: ['Tiruvarur', 'Mannargudi', 'Thiruthuraipoondi', 'Nannilam'] },
  { name: 'Vellore', code: 'VEL', region: 'North', taluks: ['Vellore', 'Katpadi', 'Gudiyatham', 'Anaicut'] },
  { name: 'Viluppuram', code: 'VLP', region: 'North', taluks: ['Viluppuram', 'Gingee', 'Tindivanam', 'Vanur'] },
  { name: 'Virudhunagar', code: 'VRD', region: 'South', taluks: ['Virudhunagar', 'Aruppukkottai', 'Sivakasi', 'Rajapalayam', 'Srivilliputhur'] }
];

const seedStateData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ucrs';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Administrative Seeding...');

    // 1. Clear existing data
    await Promise.all([
      District.deleteMany(),
      Taluk.deleteMany(),
      Village.deleteMany(),
      Department.deleteMany(),
      Officer.deleteMany(),
      GovernmentOffice.deleteMany()
    ]);

    // 2. Seed Departments
    const depts = await Department.create([
      { name: 'TANGEDCO (Electricity Board)', name_ta: 'தமிழ்நாடு மின்சார வாரியம்', category: 'Utility', routingKeywords: ['power', 'current', 'eb', 'light'] },
      { name: 'TWAD Board (Water Supply)', name_ta: 'தமிழ்நாடு குடிநீர் வழங்கல் வாரியம்', category: 'Utility', routingKeywords: ['water', 'tap', 'leak'] },
      { name: 'Greater Chennai Corporation', name_ta: 'சென்னை மாநகராட்சி', category: 'Admin', routingKeywords: ['garbage', 'drainage', 'pothole'] }
    ]);

    // 3. Seed All 38 Districts and their Taluks
    for (const d of districtsData) {
      const district = await District.create({
        name: d.name,
        code: d.code,
        region: d.region,
        totalTaluks: d.taluks.length,
        totalVillages: d.taluks.length * 20,
        totalGovernmentOffices: d.taluks.length * 15,
        status: 'ONLINE'
      });

      for (const tName of d.taluks) {
        const taluk = await Taluk.create({
          districtId: district._id,
          name: tName,
          code: `${district.code}-${tName.substring(0, 3).toUpperCase()}`,
          villagesCount: 20,
          officesCount: 15,
          status: 'ACTIVE',
          headquarters: tName
        });

        // Seed 1 sample office for each taluk + department to ensure dynamic loading works
        for (const dept of depts) {
          // Skip Chennai Corporation for non-Chennai districts
          if (dept.name.includes('Chennai Corporation') && district.name !== 'Chennai') continue;

          await GovernmentOffice.create({
            officeName: `${tName} ${dept.name.split(' ')[0]} Office`,
            officeType: 'Section Office',
            departmentId: dept._id,
            districtId: district._id,
            talukId: taluk._id,
            location: { type: 'Point', coordinates: [80 + Math.random(), 13 + Math.random()] },
            serviceRadiusKm: 15,
            officeCode: `${district.code}-${dept.name.substring(0, 2).toUpperCase()}-${tName.substring(0, 3).toUpperCase()}-01`
          });
        }
      }
    }

    console.log(`Successfully seeded all ${districtsData.length} districts, ${districtsData.reduce((acc, d) => acc + d.taluks.length, 0)} taluks and hierarchical state administrative infrastructure.`);
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedStateData();
