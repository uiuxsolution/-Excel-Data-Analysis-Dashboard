import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js';
import GraphVisualization from './GraphVisualization';
import { calculateSummaryStats } from '../utils/dataAnalysis';

Chart.register(...registerables);

const CHART_TYPES = [
  'bar', 
  'line', 
  'pie', 
  'scatter', 
  'radar', 
  'doughnut'
];

function App() {
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [graphConfigs, setGraphConfigs] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target?.result, { 
        type: 'binary',
        cellDates: true 
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false,
        defval: null 
      });
      
      const columns = Object.keys(data[0] || {});
      const numericColumns = columns.filter(key => 
        data.some(row => !isNaN(Number(row[key])))
      );

      const results = {
        totalRows: data.length,
        columns,
        numericColumns,
        summaryStats: calculateSummaryStats(data)
      };

      setFileData(data);
      setAnalysisResults(results);
      
      setGraphConfigs([{
        xAxis: results.columns[0] || null,
        yAxis: results.numericColumns[0] || null,
        chartType: 'bar'
      }]);
    };
    
    reader.readAsBinaryString(file);
  };

  const addGraphConfig = () => {
    setGraphConfigs(prev => [...prev, {
      xAxis: analysisResults?.columns[0] || null,
      yAxis: analysisResults?.numericColumns[0] || null,
      chartType: 'bar'
    }]);
  };

  const updateGraphConfig = (index: number, updates: any) => {
    setGraphConfigs(prev => 
      prev.map((config, i) => 
        i === index ? { ...config, ...updates } : config
      )
    );
  };

  const removeGraphConfig = (index: number) => {
    setGraphConfigs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container">
      <h1>📊 Excel Data Analysis Dashboard</h1>
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileUpload} 
      />
      
      {analysisResults && (
        <div className="dashboard">
          <h2>Analysis Results</h2>
          <div className="stats">
            <div>Total Rows: {analysisResults.totalRows}</div>
            <div>Columns: {analysisResults.columns.join(", ")}</div>
            <div>Numeric Columns: {analysisResults.numericColumns.join(", ")}</div>
          </div>
          
          <button onClick={addGraphConfig} className="add-graph-btn">
            + Add Graph
          </button>

          <div className="graphs-container">
            {graphConfigs.map((config, index) => (
              <div key={index} className="graph-config">
                <div className="graph-controls">
                  <select 
                    value={config.xAxis || ''} 
                    onChange={(e) => updateGraphConfig(index, { xAxis: e.target.value })}
                  >
                    <option value="">Select X-Axis</option>
                    {analysisResults.columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>

                  <select 
                    value={config.yAxis || ''} 
                    onChange={(e) => updateGraphConfig(index, { yAxis: e.target.value })}
                  >
                    <option value="">Select Y-Axis</option>
                    {analysisResults.numericColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>

                  <select 
                    value={config.chartType} 
                    onChange={(e) => updateGraphConfig(index, { chartType: e.target.value })}
                  >
                    {CHART_TYPES.map(type => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>

                  <button onClick={() => removeGraphConfig(index)}>🗑️</button>
                </div>

                {config.xAxis && config.yAxis && (
                  <GraphVisualization 
                    data={fileData || []} 
                    xAxis={config.xAxis} 
                    yAxis={config.yAxis} 
                    chartType={config.chartType}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="summary">
            <h3>Summary Statistics</h3>
            {Object.entries(analysisResults.summaryStats).map(([key, value]) => (
              <div key={key}>
                {key}: {JSON.stringify(value)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
