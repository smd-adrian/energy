import {
  Component,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  inject,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnergyService } from '../../services/energy.service';
import { Metric, RegionalData, ChartData, Filter } from '../../models/dashboard.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, AfterViewInit {
  private energyService = inject(EnergyService);
  private chartInstance: any = null;

  metrics = signal<Metric[]>([]);
  regionalData = signal<RegionalData[]>([]);
  chartData = signal<ChartData | null>(null);

  selectedYear = '2024';
  selectedRegion = 'Global';
  selectedSource = 'Todas';

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Esperar a que se carguen los datos antes de inicializar el gráfico
    setTimeout(() => {
      this.initChart();
    }, 100);
  }

  loadDashboardData() {
    // Cargar métricas
    this.energyService.getMetrics().subscribe((data) => {
      this.metrics.set(data);
    });

    // Cargar datos regionales
    this.energyService.getRegionalData().subscribe((data) => {
      this.regionalData.set(data);
    });

    // Cargar datos del gráfico
    this.energyService.getEnergyProductionChart().subscribe((data) => {
      this.chartData.set(data);
    });
  }

  applyFilters() {
    const filters: Filter = {
      year: this.selectedYear,
      region: this.selectedRegion,
      source: this.selectedSource,
    };

    this.energyService.applyFilters(filters).subscribe(() => {
      this.loadDashboardData();
      setTimeout(() => {
        this.initChart();
      }, 100);
    });
  }

  private initChart() {
    const canvas = document.getElementById('energyChart') as HTMLCanvasElement;
    const data = this.chartData();

    if (canvas && data) {
      // Destruir gráfico anterior si existe
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.labels,
            datasets: data.datasets.map((dataset, index) => ({
              label: dataset.label,
              data: dataset.data,
              borderColor: this.getChartColor(index),
              backgroundColor: this.getChartBackgroundColor(index),
              tension: 0.4,
              fill: false,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  }

  private getChartColor(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
    return colors[index % colors.length];
  }

  private getChartBackgroundColor(index: number): string {
    const colors = [
      'rgba(255, 99, 132, 0.1)',
      'rgba(54, 162, 235, 0.1)',
      'rgba(255, 206, 86, 0.1)',
      'rgba(75, 192, 192, 0.1)',
    ];
    return colors[index % colors.length];
  }
}
