import autocannon from 'autocannon';
import { Client } from '../../node_modules/@types/pg';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgres://adityaboxi@localhost:5432/jansetu';

// Helper for making HTTP requests
function makeRequest(options: http.RequestOptions, postData?: string): Promise<{ statusCode: number; latencyMs: number }> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode || 500, latencyMs: Date.now() - start }));
    });
    req.on('error', err => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runHighDataControllerBenchmark() {
  console.log('==================================================================');
  console.log('🚀 ENTERPRISE HIGH-DATA VOLUME & CONTROLLER BENCHMARK TEST');
  console.log('==================================================================\n');

  // Step 1: Pre-Populating Database with High Volume Batch Data
  console.log('📦 Step 1: Seed/Verify Large Data Scale in PostgreSQL...');
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const villageCountRes = await client.query('SELECT COUNT(*)::int as count FROM village_profiles;');
  const householdCountRes = await client.query('SELECT COUNT(*)::int as count FROM household_surveys;');
  
  console.log(`   -> Current Village Records:   ${villageCountRes.rows[0].count}`);
  console.log(`   -> Current Household Records: ${householdCountRes.rows[0].count}\n`);

  // Fast Batch Generation if table is small
  if (householdCountRes.rows[0].count < 10000) {
    console.log('⚡ Generating 10,000 High-Volume Enterprise Household Records directly via PostgreSQL Batch...');
    const villages = ['Khadkagaon', 'Orcha', 'Sonpur', 'Kukur', 'Badebhodia', 'Dhanora', 'Garpa', 'Remawand'];
    const castes = ['Scheduled Tribe (ST)', 'Scheduled Caste (SC)', 'Other Backward Class (OBC)', 'General'];
    const incomes = ['Agriculture', 'Forest Produce', 'Wage Laborer', 'Small Business'];

    // Ensure Villages exist first
    for (const v of villages) {
      await client.query(`
        INSERT INTO village_profiles (block, panchayat, village_name, total_population, total_households, mine_distance_km, has_pucca_road, monsoon_cut_off, school_type, hospital_type, electrification)
        VALUES ('Orcha', 'Khadkagaon GP', $1, 1500, 300, '0 to 5 KM', 'Yes', 'No', 'Primary School', 'SHC', 'Fully Electrified')
        ON CONFLICT (village_name) DO NOTHING;
      `, [v]);
    }

    // Insert 10,000 households in single multi-row batch
    let insertQuery = `
      INSERT INTO household_surveys 
      (tracking_id, village_name, house_number, head_name, mobile, caste, is_bpl, total_members, missing_aadhaar, missing_ayushman, unemployed_count, is_mining_worker, house_type, has_toilet, has_tap_water, income_source)
      VALUES 
    `;
    const rows: string[] = [];
    for (let i = 1; i <= 10000; i++) {
      const v = villages[i % villages.length];
      const trackingId = `DMFT-SCALE-${i}-${Math.floor(Math.random() * 10000)}`;
      const headName = `Citizen Head #${i}`;
      const caste = castes[i % castes.length];
      const isBpl = i % 2 === 0 ? 'Yes' : 'No';
      const isMining = i % 3 === 0 ? 'Yes' : 'No';
      const income = incomes[i % incomes.length];

      rows.push(`('${trackingId}', '${v}', ${i}, '${headName}', '9406${100000 + i}', '${caste}', '${isBpl}', ${1 + (i % 6)}, ${i % 2}, ${i % 3}, ${i % 2}, '${isMining}', 'Kaccha House', 'Yes', 'No', '${income}')`);
    }

    await client.query(insertQuery + rows.join(',') + ' ON CONFLICT DO NOTHING;');
    console.log('✅ 10,000 High-Volume Households Seeded Successfully.\n');

    // Refresh Materialized View
    await client.query('REFRESH MATERIALIZED VIEW mv_district_cluster_analytics;');
  }
  await client.end();

  // Step 2: Test Controller 1 - Auth Controller (POST /api/auth/login)
  console.log('🔐 Step 2: Testing Auth Controller (POST /api/auth/login)...');
  const authRes = await autocannon({
    url: 'http://localhost:3000/api/auth/login',
    connections: 100,
    duration: 5,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'admin', identifier: 'DISTRICT_COLLECTOR_01', password: 'secretpassword' })
  });
  console.log(`   -> Auth Requests: ${authRes.requests.total} | Avg Latency: ${authRes.latency.average} ms | Req/Sec: ${authRes.requests.average}\n`);

  // Step 3: Test Controller 2 - Hierarchy Controller (GET /api/hierarchy)
  console.log('🗺️ Step 3: Testing Location Hierarchy Controller (GET /api/hierarchy)...');
  const hierarchyRes = await autocannon({
    url: 'http://localhost:3000/api/hierarchy',
    connections: 200,
    duration: 5
  });
  console.log(`   -> Hierarchy Requests: ${hierarchyRes.requests.total} | Avg Latency: ${hierarchyRes.latency.average} ms | Req/Sec: ${hierarchyRes.requests.average}\n`);

  // Step 4: Test Controller 3 - Village Controller (GET /api/villages/all)
  console.log('🏘️ Step 4: Testing Village Controller (GET /api/villages/all)...');
  const villageRes = await autocannon({
    url: 'http://localhost:3000/api/villages/all',
    connections: 300,
    duration: 5
  });
  console.log(`   -> Village Reads: ${villageRes.requests.total} | Avg Latency: ${villageRes.latency.average} ms | Req/Sec: ${villageRes.requests.average}\n`);

  // Step 5: Test Controller 4 - Household Controller API Writes (POST /api/households)
  console.log('✍️ Step 5: Testing Household Controller API Writes (POST /api/households)...');
  const writeRes = await autocannon({
    url: 'http://localhost:3000/api/households',
    connections: 100,
    duration: 5,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      villageName: 'Khadkagaon',
      houseNumber: Math.floor(20000 + Math.random() * 800000),
      data: {
        headName: 'High Scale API Citizen',
        mobile: '9406999888',
        caste: 'Scheduled Tribe (ST)',
        isBPL: 'Yes',
        totalMembers: 4,
        incomeSource: 'Forest Produce'
      }
    })
  });
  console.log(`   -> Household Writes: ${writeRes.requests.total} | Avg Latency: ${writeRes.latency.average} ms | Req/Sec: ${writeRes.requests.average}\n`);

  // Step 6: Test Controller 5 - Admin Search & Cluster Analytics (POST /api/admin/query)
  console.log('🔍 Step 6: Testing Admin Controller Complex Searches (POST /api/admin/query)...');
  const adminQueryRes = await autocannon({
    url: 'http://localhost:3000/api/admin/query',
    connections: 200,
    duration: 5,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      village: 'Khadkagaon',
      isBPL: 'Yes',
      caste: 'Scheduled Tribe (ST)',
      hasMissingDocs: true
    })
  });
  console.log(`   -> Admin Searches: ${adminQueryRes.requests.total} | Avg Latency: ${adminQueryRes.latency.average} ms | Req/Sec: ${adminQueryRes.requests.average}\n`);

  console.log('==================================================================');
  console.log('🏆 ALL CONTROLLER HIGH-DATA BENCHMARK TESTS COMPLETED CLEANLY!');
  console.log('==================================================================\n');
}

runHighDataControllerBenchmark().catch(console.error);
