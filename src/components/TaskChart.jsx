import React, { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, DoughnutController } from 'chart.js';
Chart.register(ArcElement, Tooltip, DoughnutController);

export default function TaskChart({ tasks }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const ns = tasks.filter(t => t.status === 'Not Started').length;
  const ip = tasks.filter(t => t.status === 'In Progress').length;
  const done = tasks.filter(t => t.status === 'Finished').length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Not Started', 'In Progress', 'Finished'],
        datasets: [{
          data: [ns || 0.001, ip || 0.001, done || 0.001],
          backgroundColor: ['#D4CFC6', '#B8860B', '#2D6A4F'],
          borderWidth: 0,
          hoverOffset: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw === 0.001 ? 0 : ctx.raw}`,
            },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [ns, ip, done]);

  return (
    <div className="chart-container">
      <div className="chart-wrap">
        <canvas ref={canvasRef} />
        <div className="chart-center">
          <div className="chart-center-num">{pct}%</div>
          <div className="chart-center-label">Complete</div>
        </div>
      </div>

      <div className="chart-legend">
        {[
          { label: 'Not Started', color: '#D4CFC6', count: ns },
          { label: 'In Progress', color: '#B8860B', count: ip },
          { label: 'Finished', color: '#2D6A4F', count: done },
        ].map(({ label, color, count }) => (
          <div key={label} className="legend-row">
            <span className="legend-left">
              <span className="legend-dot" style={{ background: color }} />
              {label}
            </span>
            <span className="legend-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
