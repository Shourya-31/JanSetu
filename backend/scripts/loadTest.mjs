import autocannon from 'autocannon';

const url = process.env.LOAD_TEST_URL || 'http://127.0.0.1:3000/health';
const connections = Number(process.env.LOAD_TEST_CONNECTIONS || 5);
const duration = Number(process.env.LOAD_TEST_DURATION || 15);

console.log(JSON.stringify({ url, connections, durationSeconds: duration }));
const result = await autocannon({ url, connections, duration, pipelining: 1 });
console.log(JSON.stringify({
  requestsPerSecond: result.requests.average,
  totalRequests: result.requests.total,
  errors: result.errors,
  timeouts: result.timeouts,
  statusCodes: result.statusCodeStats,
  latencyMs: {
    average: result.latency.average,
    median: result.latency.p50,
    p95: result.latency.p95,
    p99: result.latency.p99
  }
}, null, 2));
