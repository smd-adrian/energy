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
import Chart from 'chart.js/auto';
import { catchError, of } from 'rxjs';
import { SolarCapacityTrendItem } from '../../../models/capacity.model';
import { EnergyService } from '../../../services/energy.service';

@Component({
  selector: 'app-index',
  imports: [],
  templateUrl: './index.html',
  styleUrl: './index.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Index implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('capacityChart') private chartCanvas?: ElementRef<HTMLCanvasElement>;

  private readonly energyService = inject(EnergyService);
  private chartInstance: Chart | null = null;

  protected readonly loading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');
  protected readonly trendData = signal<SolarCapacityTrendItem[]>([]);

  protected readonly capacityUnit = computed<string>(() => this.trendData()[0]?.unidad ?? 'MW');
  protected readonly totalYears = computed<number>(() => this.trendData().length);

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (this.trendData().length > 0) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
  }

  private loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.energyService
      .getSolarCapacityTrend()
      .pipe(catchError(() => of([] as SolarCapacityTrendItem[])))
      .subscribe({
        next: (response) => {
          const sorted = [...(response ?? [])].sort((a, b) => a.anio - b.anio);
          this.trendData.set(sorted);
          this.loading.set(false);

          if (sorted.length > 0) {
            queueMicrotask(() => this.renderChart());
          } else {
            this.chartInstance?.destroy();
            this.chartInstance = null;
            this.errorMessage.set('No hay datos de capacidad solar para mostrar.');
          }
        },
        error: () => {
          this.loading.set(false);
          this.trendData.set([]);
          this.chartInstance?.destroy();
          this.chartInstance = null;
          this.errorMessage.set('No fue posible cargar la tendencia de capacidad solar.');
        },
      });
  }

  private renderChart(): void {
    if (!this.chartCanvas) {
      return;
    }

    const labels = this.trendData().map((item) => String(item.anio));
    const values = this.trendData().map((item) => Number(item.capacidadTotal ?? 0));

    this.chartInstance?.destroy();

    this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Capacidad instalada solar (${this.capacityUnit()})`,
            data: values,
            borderColor: this.getPrimaryColor(),
            backgroundColor: this.getPrimaryColor(),
            fill: false,
            tension: 0.25,
            pointRadius: 4,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Tendencia de capacidad instalada de energía solar',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Año',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.capacityUnit(),
            },
          },
        },
      },
    });
  }

  private getPrimaryColor(): string {
    if (typeof window === 'undefined') {
      return 'currentColor';
    }

    const style = getComputedStyle(document.documentElement);
    const value = style.getPropertyValue('--bs-primary').trim();

    return value || 'currentColor';
  }
}
