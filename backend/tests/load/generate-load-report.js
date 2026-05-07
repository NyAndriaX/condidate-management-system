const fs = require('node:fs');
const path = require('node:path');

function percentile(sortedValues, p) {
  if (sortedValues.length === 0) {
    return 0;
  }
  const idx = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(sortedValues.length - 1, idx))];
}

function toMs(value) {
  // k6 emits Trend values in ms for http_req_duration JSON output.
  return Number(value) || 0;
}

function parseK6Json(inputPath) {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const lines = raw.split('\n').filter(Boolean);

  const durations = [];
  let failedCount = 0;
  let totalFailedSamples = 0;
  let requestSamples = 0;

  for (const line of lines) {
    let item;
    try {
      item = JSON.parse(line);
    } catch (_error) {
      continue;
    }

    if (item.type !== 'Point' || !item.metric) {
      continue;
    }

    if (item.metric === 'http_req_duration') {
      durations.push(toMs(item.data?.value));
    }

    if (item.metric === 'http_req_failed') {
      totalFailedSamples += 1;
      if ((item.data?.value || 0) > 0) {
        failedCount += 1;
      }
    }

    if (item.metric === 'http_reqs') {
      requestSamples += 1;
    }
  }

  durations.sort((a, b) => a - b);
  const totalDuration = durations.reduce((acc, value) => acc + value, 0);
  const avg = durations.length > 0 ? totalDuration / durations.length : 0;
  const p95 = percentile(durations, 95);
  const p99 = percentile(durations, 99);
  const errorRate = totalFailedSamples > 0 ? failedCount / totalFailedSamples : 0;

  return {
    samples: durations.length,
    avg,
    p95,
    p99,
    errorRate,
    httpReqsSamples: requestSamples,
  };
}

function generateHtml(metrics) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>K6 Load Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; background: #fafafa; color: #111; }
    h1 { margin-bottom: 8px; }
    .sub { color: #555; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 16px; }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
    .label { color: #666; font-size: 14px; }
    .value { font-size: 24px; font-weight: 700; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>K6 Load Test Report</h1>
  <p class="sub">Generated from JSON output</p>
  <div class="grid">
    <div class="card"><div class="label">Avg response time</div><div class="value">${metrics.avg.toFixed(2)} ms</div></div>
    <div class="card"><div class="label">P95</div><div class="value">${metrics.p95.toFixed(2)} ms</div></div>
    <div class="card"><div class="label">P99</div><div class="value">${metrics.p99.toFixed(2)} ms</div></div>
    <div class="card"><div class="label">Error rate</div><div class="value">${(metrics.errorRate * 100).toFixed(2)}%</div></div>
    <div class="card"><div class="label">http_req_duration samples</div><div class="value">${metrics.samples}</div></div>
    <div class="card"><div class="label">http_reqs samples</div><div class="value">${metrics.httpReqsSamples}</div></div>
  </div>
</body>
</html>`;
}

function main() {
  const inputPath = path.resolve(process.argv[2] || 'load-test-results.json');
  const outputPath = path.resolve(process.argv[3] || 'load-test-report.html');

  const metrics = parseK6Json(inputPath);
  const html = generateHtml(metrics);
  fs.writeFileSync(outputPath, html, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`HTML report generated: ${outputPath}`);
}

main();
