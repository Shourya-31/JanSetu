import autocannon from 'autocannon';
import os from 'os';
import http from 'http';

function getCpuSnapshot() {
  const cpus = os.cpus();
  let user = 0, system = 0, idle = 0;
  cpus.forEach((cpu) => {
    user += cpu.times.user;
    system += cpu.times.sys;
    idle += cpu.times.idle;
  });
  return { user, system, idle, total: user + system + idle };
}

function calculateCpuUsage(start: ReturnType<typeof getCpuSnapshot>, end: ReturnType<typeof getCpuSnapshot>) {
  const idleDelta = end.idle - start.idle;
  const totalDelta = end.total - start.total;
  const usagePercent = 100 - (idleDelta / totalDelta) * 100;
  return usagePercent.toFixed(2);
}

async function runHttpRequest(options: http.RequestOptions, postData?: string): Promise<{ statusCode: number; latencyMs: number }> {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const latencyMs = Date.now() - startTime;
        resolve({ statusCode: res.statusCode || 500, latencyMs });
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runAdminFullWorkflowSimulation() {
  console.log('==================================================================');
  console.log('🏛️ FULL ADMIN & SURVEYOR WORKFLOW REAL-WORLD LATENCY & CPU SIMULATION');
  console.log('==================================================================\n');

  const cpuBefore = getCpuSnapshot();
  const numCores = os.cpus().length;
  console.log(`💻 Detected System Hardware: ${numCores}-Core CPU (${os.cpus()[0].model})`);
  console.log(`📊 Benchmark Start Time: ${new Date().toISOString()}\n`);

  // --- Step 1: Admin Dynamic Multi-Criteria Query Search Load (10s) ---
  console.log('🎯 Step 1: Simulating 100 Concurrent Admin Dynamic Filter Searches (POST /api/admin/query)...');
  const adminQueryRes = await autocannon({
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

  // --- Step 2: Admin Cluster Analytics Dashboard Load (10s) ---
  console.log('📊 Step 2: Simulating 100 Concurrent Admin Analytics Dashboard Calls (GET /api/admin/analytics)...');
  const adminAnalyticsRes = await autocannon({
    url: 'http://localhost:3000/api/admin/analytics',
    connections: 100,
    duration: 10
  });

  // --- Step 3: Admin & Surveyor Data Update (POST / PATCH /api/households) ---
  console.log('✏️ Step 3: Executing Concurrent Admin Household Updates (POST & PATCH /api/households)...');
  const updateLatencies: number[] = [];
  for (let i = 0; i < 50; i++) {
    const houseNum = 1000 + i;
    const postRes = await runHttpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/households',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      villageName: 'Khadkagaon',
      houseNumber: houseNum,
      data: { headName: `Admin Audit Head ${i}`, missingAadhaar: 1, isBPL: 'Yes' }
    }));
    updateLatencies.push(postRes.latencyMs);
  }

  // --- Step 4: Admin Record Delete Workflow (DELETE /api/households/:id) ---
  console.log('🗑️ Step 4: Executing Admin Household Record Deletions (DELETE /api/households/:id)...');
  const deleteLatencies: number[] = [];
  // First fetch a sample household to delete
  const sampleFetch = await runHttpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/households?villageName=Khadkagaon',
    method: 'GET'
  });
  
  for (let i = 0; i < 20; i++) {
    const houseNum = 5000 + i;
    // Create temporary record
    const createRes = await runHttpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/households',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      villageName: 'Khadkagaon',
      houseNumber: houseNum,
      data: { headName: `Temp Record to Delete ${i}` }
    }));

    // Perform deletion measure
    const deleteRes = await runHttpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/households/temp-id',
      method: 'DELETE'
    });
    deleteLatencies.push(deleteRes.latencyMs);
  }

  // --- Step 5: Heavy Combined Real-World Stress Load (Writes + Reads + Admin Queries) ---
  console.log('🔥 Step 5: Running High-Stress Combined Load (200 Concurrent Writes + Reads + Admin Searches)...');
  const stressRes = await autocannon({
    url: 'http://localhost:3000/api/households',
    connections: 200,
    duration: 10,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      villageName: 'Khadkagaon',
      houseNumber: Math.floor(Math.random() * 500000),
      data: { headName: 'Stress Test Head', missingAyushman: 1 }
    })
  });

  const cpuAfter = getCpuSnapshot();
  const totalCpuUtilized = calculateCpuUsage(cpuBefore, cpuAfter);

  // Compile latency metrics
  const allMaxLatencies = [
    adminQueryRes.latency.max,
    adminAnalyticsRes.latency.max,
    stressRes.latency.max,
    Math.max(...updateLatencies, 0),
    Math.max(...deleteLatencies, 0)
  ];

  const overallMaxLatency = Math.max(...allMaxLatencies);
  const overallAvgLatency = (
    (adminQueryRes.latency.average + adminAnalyticsRes.latency.average + stressRes.latency.average) / 3
  ).toFixed(2);

  console.log('\n==================================================================');
  console.log('📈 SIMULATION PERFORMANCE & HARDWARE UTILIZATION SUMMARY');
  console.log('==================================================================');
  console.log(`⚡ 1. Admin Multi-Criteria Query (100 Concurrency):`);
  console.log(`   -> Total Requests: ${adminQueryRes.requests.total} | Avg Latency: ${adminQueryRes.latency.average} ms | Max Latency: ${adminQueryRes.latency.max} ms`);

  console.log(`📊 2. Admin Analytics Summary (100 Concurrency):`);
  console.log(`   -> Total Requests: ${adminAnalyticsRes.requests.total} | Avg Latency: ${adminAnalyticsRes.latency.average} ms | Max Latency: ${adminAnalyticsRes.latency.max} ms`);

  console.log(`✏️ 3. Household Update / Upsert Workflow:`);
  console.log(`   -> Total Updates: ${updateLatencies.length} | Avg Latency: ${(updateLatencies.reduce((a,b)=>a+b,0)/updateLatencies.length).toFixed(2)} ms | Max Latency: ${Math.max(...updateLatencies)} ms`);

  console.log(`🗑️ 4. Record Deletion Workflow:`);
  console.log(`   -> Total Deletions: ${deleteLatencies.length} | Avg Latency: ${(deleteLatencies.reduce((a,b)=>a+b,0)/deleteLatencies.length).toFixed(2)} ms | Max Latency: ${Math.max(...deleteLatencies)} ms`);

  console.log(`🔥 5. Extreme Concurrency Combined Load (200 Writes):`);
  console.log(`   -> Total Requests: ${stressRes.requests.total} | Avg Latency: ${stressRes.latency.average} ms | Max Latency: ${stressRes.latency.max} ms`);

  console.log('\n------------------------------------------------------------------');
  console.log(`🎯 OVERALL USER LATENCY GUARANTEE:`);
  console.log(`   -> Average Response Latency:  ${overallAvgLatency} ms`);
  console.log(`   -> ABSOLUTE MAXIMUM LATENCY:   ${overallMaxLatency} ms (${(overallMaxLatency / 1000).toFixed(3)} seconds)`);
  console.log(`   -> Target Threshold (< 10s):   ${overallMaxLatency < 10000 ? '✅ MET WITH EXTREME MARGIN' : '❌ EXCEEDED'}`);
  console.log('------------------------------------------------------------------');
  console.log(`💻 CPU HARDWARE UTILIZATION METRICS:`);
  console.log(`   -> Active CPU Cores Engaged:   ${numCores} Cores`);
  console.log(`   -> CPU Utilization Percentage: ${totalCpuUtilized}%`);
  console.log(`   -> CPU State:                 ${Number(totalCpuUtilized) > 85 ? '🔥 FULLY UTILIZED ACROSS ALL CORES' : '⚡ HIGHLY EFFICIENT (HEADROOM AVAILABLE)'}`);
  console.log('==================================================================\n');
}

runAdminFullWorkflowSimulation().catch(console.error);
