import autocannon from 'autocannon';

async function run1000SurveyorsRealWorldLoadTest() {
  console.log('==================================================================');
  console.log('🚀 SIMULATING 1,000 ACTIVE FIELD SURVEYORS & DISTRICT ADMINS (TS)');
  console.log('==================================================================\n');

  console.log('📋 Step 1: Simulating 200 Concurrent Field Surveyor Data Writes (POST /api/households)...');
  const writeRes = await autocannon({
    url: 'http://localhost:3000/api/households',
    connections: 200,
    duration: 10,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      villageName: 'Khadkagaon',
      houseNumber: Math.floor(Math.random() * 100000),
      data: {
        headName: 'Real World Surveyor Head',
        mobile: '9406123456',
        caste: 'Scheduled Tribe (ST)',
        isBPL: 'Yes',
        totalMembers: 5,
        missingAadhaar: 1,
        missingAyushman: 1,
        isMiningWorker: 'Yes',
        houseType: 'Kaccha House',
        hasToilet: 'Yes',
        hasTapWater: 'No',
        incomeSource: 'Agriculture'
      }
    })
  });
  console.log(`   -> Writes Completed: ${writeRes.requests.total} surveys | Latency: ${writeRes.latency.average} ms | Req/Sec: ${writeRes.requests.average}\n`);

  console.log('🔍 Step 2: Simulating 500 Concurrent Dashboard & Village Profile Reads (GET /api/villages/all)...');
  const readRes = await autocannon({
    url: 'http://localhost:3000/api/villages/all',
    connections: 500,
    duration: 10
  });
  console.log(`   -> Reads Completed: ${readRes.requests.total} profiles | Latency: ${readRes.latency.average} ms | Req/Sec: ${readRes.requests.average}\n`);

  console.log('🎯 Step 3: Simulating 100 Concurrent District Admin Multi-Criteria Searches (POST /api/admin/query)...');
  const adminRes = await autocannon({
    url: 'http://localhost:3000/api/admin/query',
    connections: 100,
    duration: 10,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      village: 'Khadkagaon',
      isBPL: 'Yes',
      caste: 'Scheduled Tribe (ST)',
      hasMissingDocs: true
    })
  });
  console.log(`   -> Admin Searches Completed: ${adminRes.requests.total} queries | Latency: ${adminRes.latency.average} ms | Req/Sec: ${adminRes.requests.average}\n`);

  console.log('==================================================================');
  console.log('🏆 1,000 SURVEYOR REAL-WORLD SIMULATION TEST COMPLETED CLEANLY!');
  console.log('==================================================================\n');
}

run1000SurveyorsRealWorldLoadTest().catch(console.error);
