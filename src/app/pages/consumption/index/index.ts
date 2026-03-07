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
import {
  GlobalConsumptionParticipationItem,
  RenewableConsumptionByRegionItem,
} from '../../../models/consumption.model';
import { EnergyService } from '../../../services/energy.service';

@Component({
  selector: 'app-index',
  imports: [],
  templateUrl: './index.html',
  styleUrl: './index.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Index implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('consumptionChart') private chartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('participationChart') private participationChartCanvas?: ElementRef<HTMLCanvasElement>;

  private readonly energyService = inject(EnergyService);
  private chartInstance: Chart | null = null;
  private participationChartInstance: Chart | null = null;

  protected readonly currentYear = new Date().getFullYear();
  protected readonly selectedYear = signal<number>(2021);
  protected readonly yearInput = signal<string>('2021');
  protected readonly loading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');
  protected readonly consumptionData = signal<RenewableConsumptionByRegionItem[]>([]);
  protected readonly participationData = signal<GlobalConsumptionParticipationItem[]>([]);

  protected readonly regionsWithPercentage = computed<number>(
    () => this.consumptionData().filter((item) => this.resolvePercentage(item) > 0).length,
  );
  protected readonly totalSources = computed<number>(() => this.participationData().length);

  ngOnInit(): void {
    this.loadData(this.selectedYear());
  }

  ngAfterViewInit(): void {
    if (this.consumptionData().length > 0) {
      this.renderChart();
    }

    if (this.participationData().length > 0) {
      this.renderParticipationChart();
    }
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
    this.participationChartInstance?.destroy();
  }

  protected onYearInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.yearInput.set(input.value);
  }

  protected applyYearFilter(): void {
    const parsedYear = Number(this.yearInput());
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > this.currentYear + 1) {
      this.errorMessage.set('Ingresa un año válido para consultar consumo.');
      return;
    }

    this.selectedYear.set(parsedYear);
    this.loadData(parsedYear);
  }

  private loadData(year: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      regional: this.energyService
        .getRenewableConsumptionPercentageByYear(year)
        .pipe(catchError(() => of([] as RenewableConsumptionByRegionItem[]))),
      participation: this.energyService
        .getGlobalConsumptionParticipationByYear(year)
        .pipe(catchError(() => of([] as GlobalConsumptionParticipationItem[]))),
    }).subscribe({
      next: ({ regional, participation }) => {
        this.consumptionData.set(regional ?? []);
        this.participationData.set(participation ?? []);
        this.loading.set(false);

        if (regional?.length) {
          queueMicrotask(() => this.renderChart());
        } else {
          this.chartInstance?.destroy();
          this.chartInstance = null;
        }

        if (participation?.length) {
          queueMicrotask(() => this.renderParticipationChart());
        } else {
          this.participationChartInstance?.destroy();
          this.participationChartInstance = null;
        }

        if (regional.length === 0 && participation.length === 0) {
          this.errorMessage.set(`No hay datos de consumo para el año ${year}.`);
        }
      },
      error: () => {
        this.loading.set(false);
        this.consumptionData.set([]);
        this.participationData.set([]);
        this.chartInstance?.destroy();
        this.chartInstance = null;
        this.participationChartInstance?.destroy();
        this.participationChartInstance = null;
        this.errorMessage.set(
          `No fue posible cargar los indicadores de consumo para el año ${year}.`,
        );
      },
    });
  }

  private renderChart(): void {
    if (!this.chartCanvas) {
      return;
    }

    const labels = this.consumptionData().map((item) => item.region);
    const values = this.consumptionData().map((item) => this.resolvePercentage(item));

    this.chartInstance?.destroy();

    this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '% renovable sobre consumo total',
            data: values,
            backgroundColor: this.getPrimaryColor(),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: `Porcentaje de energía renovable por región (${this.selectedYear()})`,
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
            max: 100,
            title: {
              display: true,
              text: 'Porcentaje (%)',
            },
          },
        },
      },
    });
  }

  private resolvePercentage(item: RenewableConsumptionByRegionItem): number {
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

  private renderParticipationChart(): void {
    if (!this.participationChartCanvas) {
      return;
    }

    const labels = this.participationData().map((item) => item.fuente);
    const values = this.participationData().map((item) =>
      this.resolveParticipationPercentage(item),
    );
    const chartColors = this.getChartColors(values.length);

    this.participationChartInstance?.destroy();

    this.participationChartInstance = new Chart(this.participationChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: chartColors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: `Participación global del consumo por fuente (${this.selectedYear()})`,
          },
        },
      },
    });
  }

  private resolveParticipationPercentage(item: GlobalConsumptionParticipationItem): number {
    if (
      item.porcentajeParticipacion !== null &&
      Number.isFinite(Number(item.porcentajeParticipacion))
    ) {
      return Number(item.porcentajeParticipacion.toFixed(2));
    }

    return 0;
  }

  private getPrimaryColor(): string {
    return this.getChartColors(1)[0] || 'currentColor';
  }

  private getChartColors(count: number): string[] {
    if (typeof window === 'undefined') {
      return Array.from({ length: Math.max(1, count) }, () => 'currentColor');
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
      return Array.from({ length: Math.max(1, count) }, () => 'currentColor');
    }

    return Array.from(
      { length: Math.max(1, count) },
      (_, index) => palette[index % palette.length],
    );
  }
}
