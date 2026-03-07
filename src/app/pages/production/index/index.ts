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
import { catchError, forkJoin, of } from 'rxjs';
import { EnergyService } from '../../../services/energy.service';
import { RenewableProductionItem, TopWindCountryItem } from '../../../models/production.model';

@Component({
  selector: 'app-index',
  imports: [],
  templateUrl: './index.html',
  styleUrl: './index.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Index implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('productionChart') private chartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('windTopCountriesChart') private windTopCountriesChart?: ElementRef<HTMLCanvasElement>;

  private readonly energyService = inject(EnergyService);
  private chartInstance: Chart | null = null;
  private windTopChartInstance: Chart | null = null;

  protected readonly currentYear = new Date().getFullYear();
  protected readonly selectedYear = signal<number>(this.currentYear);
  protected readonly yearInput = signal<string>(String(this.currentYear));
  protected readonly loading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');
  protected readonly productionData = signal<RenewableProductionItem[]>([]);
  protected readonly topWindCountriesData = signal<TopWindCountryItem[]>([]);

  protected readonly totalProduction = computed<number>(() =>
    this.productionData().reduce((acc, item) => acc + Number(item.produccionTotal ?? 0), 0),
  );

  protected readonly unit = computed<string>(() => this.productionData()[0]?.unidad ?? '');
  protected readonly topWindUnit = computed<string>(
    () => this.topWindCountriesData()[0]?.unidad ?? '',
  );

  ngOnInit(): void {
    this.loadData(this.selectedYear());
  }

  ngAfterViewInit(): void {
    if (this.productionData().length > 0) {
      this.renderChart();
    }

    if (this.topWindCountriesData().length > 0) {
      this.renderTopWindCountriesChart();
    }
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
    this.windTopChartInstance?.destroy();
  }

  protected onYearInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.yearInput.set(input.value);
  }

  protected applyYearFilter(): void {
    const parsedYear = Number(this.yearInput());
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > this.currentYear + 1) {
      this.errorMessage.set('Ingresa un año válido para consultar la producción.');
      return;
    }

    this.selectedYear.set(parsedYear);
    this.loadData(parsedYear);
  }

  private loadData(year: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      renewable: this.energyService
        .getRenewableProductionByYear(year)
        .pipe(catchError(() => of([] as RenewableProductionItem[]))),
      topWind: this.energyService
        .getTopWindCountriesByYear(year)
        .pipe(catchError(() => of([] as TopWindCountryItem[]))),
    }).subscribe({
      next: ({ renewable, topWind }) => {
        this.productionData.set(renewable ?? []);
        this.topWindCountriesData.set(topWind ?? []);
        this.loading.set(false);

        if (renewable?.length) {
          queueMicrotask(() => this.renderChart());
        } else {
          this.chartInstance?.destroy();
          this.chartInstance = null;
        }

        if (topWind?.length) {
          queueMicrotask(() => this.renderTopWindCountriesChart());
        } else {
          this.windTopChartInstance?.destroy();
          this.windTopChartInstance = null;
        }

        if (renewable.length === 0 && topWind.length === 0) {
          this.errorMessage.set(`No hay datos de producción para el año ${year}.`);
        }
      },
      error: () => {
        this.loading.set(false);
        this.productionData.set([]);
        this.topWindCountriesData.set([]);
        this.chartInstance?.destroy();
        this.chartInstance = null;
        this.windTopChartInstance?.destroy();
        this.windTopChartInstance = null;
        this.errorMessage.set(`No fue posible cargar datos de producción para el año ${year}.`);
      },
    });
  }

  private renderChart(): void {
    if (!this.chartCanvas) {
      return;
    }

    const groupedData = this.buildChartData(this.productionData());
    this.chartInstance?.destroy();

    this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: groupedData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `Producción renovable por región y fuente (${this.selectedYear()})`,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Regiones',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.unit() || 'Producción total',
            },
          },
        },
      },
    });
  }

  private renderTopWindCountriesChart(): void {
    if (!this.windTopCountriesChart) {
      return;
    }

    const labels = this.topWindCountriesData().map((item) => item.pais);
    const values = this.topWindCountriesData().map((item) => Number(item.produccionTotal ?? 0));
    const colors = this.getChartColors();

    this.windTopChartInstance?.destroy();

    this.windTopChartInstance = new Chart(this.windTopCountriesChart.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Producción eólica',
            data: values,
            backgroundColor: colors[0],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: `Top 10 países con mayor producción eólica (${this.selectedYear()})`,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.topWindUnit() || 'Producción total',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Países',
            },
          },
        },
      },
    });
  }

  private buildChartData(items: RenewableProductionItem[]): {
    labels: string[];
    datasets: Array<{ label: string; data: number[]; backgroundColor: string }>;
  } {
    const regions = [...new Set(items.map((item) => item.region))];
    const energySources = [...new Set(items.map((item) => item.fuenteEnergia))];
    const bootstrapColors = this.getChartColors();

    const datasets = energySources.map((source, sourceIndex) => {
      const data = regions.map((region) => {
        return items
          .filter((item) => item.region === region && item.fuenteEnergia === source)
          .reduce((acc, item) => acc + Number(item.produccionTotal ?? 0), 0);
      });

      return {
        label: source,
        data,
        backgroundColor: bootstrapColors[sourceIndex % bootstrapColors.length],
      };
    });

    return {
      labels: regions,
      datasets,
    };
  }

  private getChartColors(): string[] {
    if (typeof window === 'undefined') {
      return ['currentColor'];
    }

    const style = getComputedStyle(document.documentElement);
    const colorVars = [
      '--bs-primary',
      '--bs-success',
      '--bs-info',
      '--bs-warning',
      '--bs-danger',
      '--bs-secondary',
    ];

    const resolved = colorVars
      .map((variableName) => style.getPropertyValue(variableName).trim())
      .filter((value) => value.length > 0);

    return resolved.length > 0 ? resolved : ['currentColor'];
  }
}
