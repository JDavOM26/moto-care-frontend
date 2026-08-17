import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/core/services/workshop/dashboard.service';
import { FinancialDashboardDto, PerformanceDashboardDto } from '@models';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboards.html'
})
export class DashboardsComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  public financialData = signal<FinancialDashboardDto | null>(null);
  public performanceData = signal<PerformanceDashboardDto | null>(null);
  public currentYear = signal<number>(new Date().getFullYear());

  ngOnInit() {
    this.loadDashboard();
    this.loadPerformanceDashboard();
  }

  public loadDashboard() {
    this.dashboardService.getFinancialDashboard(this.currentYear()).subscribe({
      next: (res) => {
        if ((res && res.code === 302) || (res && res.code === 200)) {
          this.financialData.set(res.recordset);
          // Wait for Angular to render the view with the canvas, then build chart
          setTimeout(() => {
            this.renderChart();
          }, 0);
        }
      },
      error: (err) => console.error('Error loading dashboard', err)
    });
  }

  public loadPerformanceDashboard() {
    this.dashboardService.getPerformanceDashboard().subscribe({
      next: (res) => {
        if ((res && res.code === 302) || (res && res.code === 200)) {
          this.performanceData.set(res.recordset);
          setTimeout(() => {
            this.renderPerformanceCharts();
          }, 0);
        }
      },
      error: (err) => console.error('Error loading performance dashboard', err)
    });
  }


  private renderChart() {
    const data = this.financialData();
    if (!data || !data.monthlyRevenue) return;

    const canvas = document.getElementById('monthlyRevenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    const labels = data.monthlyRevenue.map(item => item.month);
    const totals = data.monthlyRevenue.map(item => item.total);

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ingresos Mensuales (Q)',
          data: totals,
          borderColor: '#2563eb', // blue-600
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });


    if (!data.revenueByType) return;

    const canvasPie = document.getElementById('revenueByTypeChart') as HTMLCanvasElement;
    if (!canvasPie) return;

    const pieLabels = data.revenueByType.map(item => {
      const type = item.elementType;
      if (!type || type === 'null') return 'Otros';
      if (type.toUpperCase() === 'PART') return 'Repuestos';
      if (type.toUpperCase() === 'SERVICE') return 'Servicios';
      return type;
    });
    const pieTotals = data.revenueByType.map(item => item.total);

    // Some nice modern colors for the pie chart
    const backgroundColors = [
      '#3b82f6', // blue
      '#f97316', // orange
      '#10b981', // emerald
      '#8b5cf6', // violet
      '#f43f5e'  // rose
    ];

    new Chart(canvasPie, {
      type: 'doughnut',
      data: {
        labels: pieLabels,
        datasets: [{
          data: pieTotals,
          backgroundColor: backgroundColors.slice(0, pieTotals.length),
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  private renderPerformanceCharts() {
    const data = this.performanceData();
    if (!data) return;

    if (data.currentOrderStatuses && data.currentOrderStatuses.length > 0) {
      const canvasCurrent = document.getElementById('currentOrderStatusesChart') as HTMLCanvasElement;
      if (canvasCurrent) {
        const labels = data.currentOrderStatuses.map(item => item.statusName);
        const totals = data.currentOrderStatuses.map(item => item.total);
        
        const bgColors = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#f43f5e', '#14b8a6', '#eab308'];

        new Chart(canvasCurrent, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: totals,
              backgroundColor: bgColors.slice(0, totals.length),
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              }
            }
          }
        });
      }
    }

    if (data.orderPerformanceStatus && data.orderPerformanceStatus.length > 0) {
      const canvasPerf = document.getElementById('orderPerformanceStatusChart') as HTMLCanvasElement;
      if (canvasPerf) {
        const labels = data.orderPerformanceStatus.map(item => item.statusName);
        const totals = data.orderPerformanceStatus.map(item => item.total);
        
        new Chart(canvasPerf, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Órdenes',
              data: totals,
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  }
}
