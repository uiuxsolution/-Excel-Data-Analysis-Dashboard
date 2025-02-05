import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';

const CHART_COLORS = [
  'rgba(75, 192, 192, 0.6)',
  'rgba(255, 99, 132, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(153, 102, 255, 0.6)'
];

interface GraphVisualizationProps {
  data: any[];
  xAxis: string;
  yAxis: string;
  chartType: string;
}

function GraphVisualization({ 
  data, 
  xAxis, 
  yAxis, 
  chartType 
}: GraphVisualizationProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current && data && xAxis && yAxis) {
      if (chartInstance) {
        chartInstance.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      if (!ctx) return;

      const preparedData = data.map(item => ({
        x: item[xAxis],
        y: Number(item[yAxis]) 
      })).filter(item => !isNaN(item.y));

      const chartConfig = {
        type: chartType,
        data: {
          labels: preparedData.map(item => item.x),
          datasets: [{
            label: yAxis,
            data: preparedData.map(item => item.y),
            backgroundColor: CHART_COLORS,
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
            x: {
              type: 'category',
              title: {
                display: true,
                text: xAxis
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: yAxis
              }
            }
          } : {}
        }
      };

      try {
        const newChartInstance = new Chart(ctx, chartConfig);
        setChartInstance(newChartInstance);
      } catch (error) {
        console.error('Chart Creation Error:', error);
      }
    }
  }, [data, xAxis, yAxis, chartType]);

  if (!data || !xAxis || !yAxis) {
    return <div>Please select X and Y axes</div>;
  }

  return (
    <div className="chart-container">
      <h3>{`${chartType.toUpperCase()} Chart: ${xAxis} vs ${yAxis}`}</h3>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default GraphVisualization;
