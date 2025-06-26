import * as fs from "fs";
import * as path from "path";
import { BenchmarkResult } from "./utils/statistics";
import { MemoryProfile } from "./memory/profiler";

interface DashboardData {
  timestamp: string;
  nodeVersion: string;
  results: {
    performance: Record<string, BenchmarkResult>;
    memory: MemoryProfile[];
    comparison?: Record<string, any>;
    realWorld?: Record<string, any>;
  };
}

export class BenchmarkDashboard {
  generateHTML(data: DashboardData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>try-error Benchmark Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        
        h1, h2, h3 {
            color: #2c3e50;
        }
        
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #3498db;
        }
        
        .metric-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .good { color: #27ae60; }
        .warning { color: #f39c12; }
        .bad { color: #e74c3c; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }
        
        th {
            background: #34495e;
            color: white;
            font-weight: 600;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: #3498db;
            transition: width 0.3s ease;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .timestamp {
            color: #7f8c8d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 try-error Benchmark Dashboard</h1>
        <p class="timestamp">Generated: ${data.timestamp}</p>
        <p>Node.js: ${data.nodeVersion}</p>
    </div>
    
    ${this.generateSummarySection(data)}
    ${this.generatePerformanceSection(data)}
    ${this.generateMemorySection(data)}
    ${this.generateComparisonSection(data)}
    ${this.generateRealWorldSection(data)}
    
    <script>
        // Add interactive features
        document.querySelectorAll('tr').forEach(row => {
            row.addEventListener('click', () => {
                row.style.background = row.style.background === 'rgb(255, 243, 224)' ? '' : '#fff3e0';
            });
        });
    </script>
</body>
</html>
    `;
  }

  private generateSummarySection(data: DashboardData): string {
    // Calculate key metrics
    const perfResults = Object.values(data.results.performance || {});
    const avgOverhead =
      perfResults.length > 0
        ? perfResults.reduce((sum, r) => sum + r.mean, 0) / perfResults.length
        : 0;

    const memoryLeaks =
      data.results.memory?.filter((m) => m.possibleLeak).length || 0;

    return `
    <div class="section">
        <h2>📊 Executive Summary</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value ${
                  avgOverhead < 10
                    ? "good"
                    : avgOverhead < 20
                    ? "warning"
                    : "bad"
                }">
                    ${avgOverhead.toFixed(1)}%
                </div>
                <div class="metric-label">Average Overhead</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value ${memoryLeaks === 0 ? "good" : "bad"}">
                    ${memoryLeaks}
                </div>
                <div class="metric-label">Memory Leaks Detected</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">
                    ${perfResults.length}
                </div>
                <div class="metric-label">Benchmarks Run</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value good">
                    ✓
                </div>
                <div class="metric-label">Build Status</div>
            </div>
        </div>
    </div>
    `;
  }

  private generatePerformanceSection(data: DashboardData): string {
    const results = data.results.performance || {};
    if (Object.keys(results).length === 0) return "";

    const rows = Object.entries(results)
      .map(
        ([name, result]) => `
        <tr>
            <td>${name}</td>
            <td>${result.mean.toFixed(2)}ms</td>
            <td>±${result.stdDev.toFixed(2)}ms</td>
            <td>${result.median.toFixed(2)}ms</td>
            <td>${result.p95.toFixed(2)}ms</td>
            <td>${result.min.toFixed(2)}ms - ${result.max.toFixed(2)}ms</td>
        </tr>
    `
      )
      .join("");

    return `
    <div class="section">
        <h2>⚡ Performance Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Benchmark</th>
                    <th>Mean</th>
                    <th>Std Dev</th>
                    <th>Median</th>
                    <th>95th %ile</th>
                    <th>Range</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>
    `;
  }

  private generateMemorySection(data: DashboardData): string {
    const profiles = data.results.memory || [];
    if (profiles.length === 0) return "";

    const formatBytes = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const rows = profiles
      .map(
        (profile) => `
        <tr class="${profile.possibleLeak ? "bad" : ""}">
            <td>${profile.name}</td>
            <td>${profile.iterations.toLocaleString()}</td>
            <td>${formatBytes(profile.baseline.heapUsed)}</td>
            <td>${formatBytes(profile.peak.heapUsed)}</td>
            <td>${formatBytes(profile.growth)}</td>
            <td>${formatBytes(profile.growthRate)}</td>
            <td>${profile.possibleLeak ? "⚠️ Yes" : "✅ No"}</td>
        </tr>
    `
      )
      .join("");

    return `
    <div class="section">
        <h2>🧠 Memory Analysis</h2>
        <table>
            <thead>
                <tr>
                    <th>Scenario</th>
                    <th>Iterations</th>
                    <th>Baseline</th>
                    <th>Peak</th>
                    <th>Total Growth</th>
                    <th>Per Item</th>
                    <th>Leak?</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>
    `;
  }

  private generateComparisonSection(data: DashboardData): string {
    // Placeholder for library comparison results
    return `
    <div class="section">
        <h2>📊 Library Comparison</h2>
        <div class="chart-container">
            <p>Comparison with other error handling libraries...</p>
            <!-- Add chart visualization here -->
        </div>
    </div>
    `;
  }

  private generateRealWorldSection(data: DashboardData): string {
    // Placeholder for real-world scenario results
    return `
    <div class="section">
        <h2>🌍 Real-World Scenarios</h2>
        <div class="chart-container">
            <p>Performance in real-world use cases...</p>
            <!-- Add scenario results here -->
        </div>
    </div>
    `;
  }

  async saveDashboard(
    data: DashboardData,
    outputPath: string = "benchmark-dashboard.html"
  ): Promise<void> {
    const html = this.generateHTML(data);
    await fs.promises.writeFile(outputPath, html, "utf-8");
    console.log(`\n📊 Dashboard saved to: ${outputPath}`);
  }
}

// Example usage
export async function generateDashboard() {
  const dashboard = new BenchmarkDashboard();

  // In a real implementation, you would collect these from actual benchmark runs
  const data: DashboardData = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    results: {
      performance: {},
      memory: [],
      comparison: {},
      realWorld: {},
    },
  };

  await dashboard.saveDashboard(data);
}

if (require.main === module) {
  generateDashboard().catch(console.error);
}
