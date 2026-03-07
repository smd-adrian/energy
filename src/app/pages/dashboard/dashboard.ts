import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { catchError, of } from 'rxjs';
import {
  ChartData,
  DashboardHistoricalSeriesItem,
  DashboardKpis,
  DashboardResponse,
  DashboardSummaryItem,
  Filter,
  Metric,
} from '../../models/dashboard.model';
import { EnergyService } from '../../services/energy.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('energyChart') private chartCanvas?: ElementRef<HTMLCanvasElement>;

  private readonly energyService = inject(EnergyService);
  private chartInstance: Chart | null = null;

  protected readonly currentYear = new Date().getFullYear();
  protected readonly selectedYear = signal<string>('2024');
  protected readonly selectedCountry = signal<string>('Colombia');
  protected readonly selectedEnergyType = signal<string>('');

  protected readonly loading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');
  protected readonly chartData = signal<ChartData | null>(null);
  protected readonly summaryTable = signal<DashboardSummaryItem[]>([]);
  protected readonly kpis = signal<DashboardKpis | null>(null);

  protected readonly metrics = computed<Metric[]>(() => {
    const current = this.kpis();
    if (!current) {
      return [];
    }

    return [
      {
        label: 'Producción Total',
        value: String(current.produccionTotal),
        icon: 'bi-speedometer2',
      },
      {
        label: 'Energía Renovable',
        value: `${current.porcentajeRenovable}%`,
        icon: 'bi-lightning',
      },
      {
        label: 'Capacidad Solar',
        value: String(current.capacidadSolar),
        icon: 'bi-sun',
      },
      {
        label: 'Top País Eólico',
        value: current.topPaisEolico,
        icon: 'bi-wind',
      },
    ];
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    if (this.chartData()) {
      this.initChart();
    }
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
  }

  protected applyFilters(): void {
    this.loadDashboardData();
  }

  protected onYearChange(event: Event): void {
    const input = event.target as HTMLSelectElement;
    this.selectedYear.set(input.value);
  }

  protected onCountryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedCountry.set(input.value);
  }

  protected onEnergyTypeChange(event: Event): void {
    const input = event.target as HTMLSelectElement;
    this.selectedEnergyType.set(input.value);
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filters: Filter = {
      year: Number(this.selectedYear()),
      country: this.selectedCountry().trim(),
      energyType: this.selectedEnergyType() || null,
    };

    this.energyService
      .getDashboardData(filters)
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (response: DashboardResponse | null) => {
          this.loading.set(false);

          if (!response) {
            this.kpis.set(null);
            this.chartData.set(null);
            this.summaryTable.set([]);
            this.chartInstance?.destroy();
            this.chartInstance = null;
            this.errorMessage.set('No fue posible cargar la información del dashboard.');
            return;
          }

          this.kpis.set(response.kpis);
          this.summaryTable.set(response.tablaResumen ?? []);
          this.chartData.set(this.mapHistoricalSeriesToChart(response.seriesHistorica ?? []));

          if (this.chartData()?.labels.length) {
            queueMicrotask(() => this.initChart());
          } else {
            this.chartInstance?.destroy();
            this.chartInstance = null;
          }
        },
        error: () => {
          this.loading.set(false);
          this.kpis.set(null);
          this.chartData.set(null);
          this.summaryTable.set([]);
          this.chartInstance?.destroy();
          this.chartInstance = null;
          this.errorMessage.set('No fue posible cargar la información del dashboard.');
        },
      });
  }

  protected resolveSummaryPercentage(item: DashboardSummaryItem): number {
    if (item.porcentaje !== null && Number.isFinite(Number(item.porcentaje))) {
      return Number(item.porcentaje);
    }

    if (Number(item.consumoTotal) > 0) {
      return Number(
        ((Number(item.produccionRenovable) / Number(item.consumoTotal)) * 100).toFixed(2),
      );
    }

    return 0;
  }

  private initChart(): void {
    if (!this.chartCanvas) {
      return;
    }

    const data = this.chartData();
    if (!data) {
      return;
    }

    this.chartInstance?.destroy();

    this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
          label: dataset.label,
          data: dataset.data,
          borderColor: this.getChartColor(index),
          backgroundColor: this.getChartColor(index),
          tension: 0.35,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Serie histórica de producción energética',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valor',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Año',
            },
          },
        },
      },
    });
  }

  private mapHistoricalSeriesToChart(series: DashboardHistoricalSeriesItem[]): ChartData {
    if (series.length === 0) {
      return { labels: [], datasets: [] };
    }

    const sortedYears = [...new Set(series.map((item) => item.year))].sort((a, b) => a - b);
    const labels = sortedYears.map((year) => String(year));
    const energyTypes = [...new Set(series.map((item) => item.tipoEnergia))];

    const datasets = energyTypes.map((energyType) => {
      const datasetLabel = energyType ?? 'Sin tipo';
      const data = sortedYears.map((year) => {
        const found = series.find((item) => item.year === year && item.tipoEnergia === energyType);
        return Number(found?.valor ?? 0);
      });

      return {
        label: datasetLabel,
        data,
      };
    });

    return {
      labels,
      datasets,
    };
  }

  private getChartColor(index: number): string {
    if (typeof window === 'undefined') {
      return 'currentColor';
    }

    const style = getComputedStyle(document.documentElement);
    const palette = [
      style.getPropertyValue('--bs-primary').trim(),
      style.getPropertyValue('--bs-success').trim(),
      style.getPropertyValue('--bs-info').trim(),
      style.getPropertyValue('--bs-warning').trim(),
      style.getPropertyValue('--bs-danger').trim(),
      style.getPropertyValue('--bs-secondary').trim(),
    ].filter((value) => value.length > 0);

    if (palette.length === 0) {
      return 'currentColor';
    }

    return palette[index % palette.length];
  }
}
