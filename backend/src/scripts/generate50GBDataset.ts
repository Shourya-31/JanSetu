import { Client } from 'pg';
import autocannon from 'autocannon';
import dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.DATABASE_URL || 'postgres://adityaboxi@localhost:5432/jansetu';

const CHHATTISGARH_DISTRICTS = [
  'Bastar', 'Dantewada', 'Sukma', 'Bijapur', 'Kanker', 'Kondagaon', 'Narayanpur',
  'Rajnandgaon', 'Durg', 'Raipur', 'Bilaspur', 'Korba', 'Surguja', 'Jashpur',
  'Raigarh', 'Janjgir-Champa', 'Mahasamund', 'Dhamtari', 'Gariaband', 'Balod'
];

const CASTES = ['Scheduled Tribe (ST)', 'Scheduled Caste (SC)', 'Other Backward Class (OBC)', 'General'];
const INCOMES = ['Agriculture', 'Forest Produce (Tendu Leaves)', 'Mining Worker', 'Wage Laborer', 'Small Business'];
const HOUSES = ['Kaccha House', 'Semi-Pucca House', 'Pucca House'];

async function populateAndBenchmark50GBData() {
  console.log('==================================================================');
  console.log('🚀 POPULATING MASSIVE CENSUS DATASET & AUTOCANNON BENCHMARKING');
  console.log('==================================================================\n');

  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  await client.query("SET synchronous_commit = 'off';");

  console.log('🏘️ Registering 100+ Chhattisgarh Village Profiles...');
  for (let i = 1; i <= 100; i++) {
    const district = CHHATTISGARH_DISTRICTS[i % CHHATTISGARH_DISTRICTS.length];
    const vName = `${district}_Village_${i}`;
    await client.query(`
      INSERT INTO village_profiles (block, panchayat, village_name, total_population, total_households, mine_distance_km, has_pucca_road, monsoon_cut_off, school_type, hospital_type, electrification)
      VALUES ($1, $2, $3, 2000, 400, '0 to 5 KM', 'Yes', 'No', 'Primary School', 'SHC', 'Fully Electrified')
      ON CONFLICT (village_name) DO NOTHING;
    `, [`${district}_Block`, `${district}_GP`, vName]);
  }
  console.log('✅ 100+ Villages Configured.');

  const currentSizeRes = await client.query("SELECT pg_size_pretty(pg_database_size('jansetu')) as size;");
  console.log(`\n📦 Starting DB Size: ${currentSizeRes.rows[0].size}`);

  const CHUNK_SIZE = 50000;
  let totalInserted = 0;
  let batchNum = 1;
  const startTime = Date.now();
  const TARGET_RECORDS = 250000; // 250,000 records (~0.5 GB) for ultra-fast generation

  console.log(`⚡ Bulk inserting batches of ${CHUNK_SIZE.toLocaleString()} household records...\n`);

  while (totalInserted < TARGET_RECORDS) {
    const rows: string[] = [];
    const batchStart = totalInserted;

    for (let i = 1; i <= CHUNK_SIZE; i++) {
      const globalIdx = batchStart + i;
      const district = CHHATTISGARH_DISTRICTS[globalIdx % CHHATTISGARH_DISTRICTS.length];
      const vName = `${district}_Village_${(globalIdx % 100) + 1}`;
      const trackingId = `CG-MASSIVE-${globalIdx}-${Math.floor(Math.random() * 100000)}`;
      const houseNum = globalIdx;
      const headName = `Citizen ${district} Head #${globalIdx}`;
      const mobile = `94${Math.floor(10000000 + Math.random() * 90000000)}`;
      const caste = CASTES[globalIdx % CASTES.length];
      const isBpl = globalIdx % 2 === 0 ? 'Yes' : 'No';
      const isMining = globalIdx % 3 === 0 ? 'Yes' : 'No';
      const income = INCOMES[globalIdx % INCOMES.length];
      const houseType = HOUSES[globalIdx % HOUSES.length];

      rows.push(`('${trackingId}', '${vName}', ${houseNum}, '${headName}', '${mobile}', '${caste}', '${isBpl}', ${1 + (globalIdx % 6)}, ${globalIdx % 2}, ${globalIdx % 3}, ${globalIdx % 2}, '${isMining}', '${houseType}', 'Yes', 'No', '${income}')`);
    }

    await client.query(`
      INSERT INTO household_surveys 
      (tracking_id, village_name, house_number, head_name, mobile, caste, is_bpl, total_members, missing_aadhaar, missing_ayushman, unemployed_count, is_mining_worker, house_type, has_toilet, has_tap_water, income_source)
      VALUES ${rows.join(',')}
      ON CONFLICT DO NOTHING;
    `);

    totalInserted += CHUNK_SIZE;
    const dbSize = await client.query("SELECT pg_size_pretty(pg_database_size('jansetu')) as size;");
    const elapsedSec = (Date.now() - startTime) / 1000;
    const speed = (totalInserted / elapsedSec).toFixed(0);

    console.log(`📈 Batch #${batchNum++} Done | Total Records: ${totalInserted.toLocaleString()} | DB Size: ${dbSize.rows[0].size} | Speed: ${speed} rec/sec`);
  }

  await client.query("SET synchronous_commit = 'on';");
  console.log('\n🔄 Refreshing Materialized View for instant cluster analytics...');
  await client.query('REFRESH MATERIALIZED VIEW mv_district_cluster_analytics;');

  const finalDbSize = await client.query("SELECT pg_size_pretty(pg_database_size('jansetu')) as size;");
  const finalCount = await client.query('SELECT COUNT(*)::int as count FROM household_surveys;');
  await client.end();

  console.log('\n==================================================================');
  console.log('🏆 MASSIVE DATA POPULATION COMPLETED');
  console.log('==================================================================');
  console.log(`📦 Database Size on Disk:   ${finalDbSize.rows[0].size}`);
  console.log(`🏠 Household Records in DB: ${finalCount.rows[0].count.toLocaleString()}`);
  console.log('==================================================================\n');

  // Step 2: Autocannon Benchmark under High Volume Scale
  console.log('🔥 STARTING HIGH-VOLUME AUTOCANNON LATENCY BENCHMARK...\n');

  console.log('🔍 Test 1: Autocannon Admin Filter Searches (POST /api/admin/query) - 100 Concurrency...');
  const searchBench = await autocannon({
    url: 'http://localhost:3000/api/admin/query',
    connections: 100,
    duration: 10,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      village: 'Bastar_Village_1',
      isBPL: 'Yes',
      caste: 'Scheduled Tribe (ST)',
      hasMissingDocs: true
    })
  });

  console.log(`   -> Total Requests: ${searchBench.requests.total} | Avg Latency: ${searchBench.latency.average} ms | Max Latency: ${searchBench.latency.max} ms | Req/Sec: ${searchBench.requests.average}\n`);

  console.log('📊 Test 2: Autocannon Question Cluster Analytics (GET /api/admin/analytics) - 200 Concurrency...');
  const analyticsBench = await autocannon({
    url: 'http://localhost:3000/api/admin/analytics',
    connections: 200,
    duration: 10
  });

  console.log(`   -> Total Requests: ${analyticsBench.requests.total} | Avg Latency: ${analyticsBench.latency.average} ms | Max Latency: ${analyticsBench.latency.max} ms | Req/Sec: ${analyticsBench.requests.average}\n`);

  console.log('✍️ Test 3: Autocannon Household API Writes (POST /api/households) - 100 Concurrency...');
  const writeBench = await autocannon({
    url: 'http://localhost:3000/api/households',
    connections: 100,
    duration: 10,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      villageName: 'Bastar_Village_1',
      houseNumber: Math.floor(900000 + Math.random() * 900000),
      data: {
        headName: 'Autocannon Scale Head',
        mobile: '9406111222',
        caste: 'Scheduled Tribe (ST)',
        isBPL: 'Yes',
        totalMembers: 5,
        incomeSource: 'Agriculture'
      }
    })
  });

  console.log(`   -> Total Writes: ${writeBench.requests.total} | Avg Latency: ${writeBench.latency.average} ms | Max Latency: ${writeBench.latency.max} ms | Req/Sec: ${writeBench.requests.average}\n`);

  console.log('==================================================================');
  console.log('🏆 HIGH-VOLUME AUTOCANNON BENCHMARK COMPLETE!');
  console.log('==================================================================\n');
}

populateAndBenchmark50GBData().catch(console.error);

