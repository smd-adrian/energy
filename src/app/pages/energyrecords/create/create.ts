import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { MeasurementType } from '../../../models/measurementtypes.model';
import { PowerPlant } from '../../../models/powerplants.model';
import { EnergyService } from '../../../services/energy.service';
import { getRoutePath } from '../../../routing/routes.constants';

@Component({
  selector: 'app-create',
  imports: [ReactiveFormsModule],
  templateUrl: './create.html',
  styleUrl: './create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Create {
  private energyService = inject(EnergyService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  readonly currentYear = new Date().getFullYear();
  readonly months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ] as const;

  powerPlants = signal<PowerPlant[]>([]);
  measurementTypes = signal<MeasurementType[]>([]);
  isLoadingPowerPlants = signal(true);
  isLoadingMeasurementTypes = signal(true);
  optionsLoadError = signal<string | null>(null);

  isSubmitting = signal(false);
  createEnergyRecordError = signal<string | null>(null);

  isLoadingOptions = computed(
    () => this.isLoadingPowerPlants() || this.isLoadingMeasurementTypes(),
  );

  createEnergyRecordForm = this.formBuilder.nonNullable.group({
    year: [this.currentYear, [Validators.required, Validators.min(1900), Validators.max(2100)]],
    month: [0, [Validators.required, Validators.min(1), Validators.max(12)]],
    value: [0, [Validators.required, Validators.min(0.000001)]],
    powerPlantId: [0, [Validators.required, Validators.min(1)]],
    measurementTypeId: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.loadOptions();
  }

  loadOptions() {
    this.optionsLoadError.set(null);

    this.isLoadingPowerPlants.set(true);
    this.energyService
      .getPowerPlants()
      .pipe(finalize(() => this.isLoadingPowerPlants.set(false)))
      .subscribe({
        next: (powerPlants) => this.powerPlants.set(powerPlants),
        error: () => {
          this.powerPlants.set([]);
          this.optionsLoadError.set('No se pudieron cargar las power plants.');
        },
      });

    this.isLoadingMeasurementTypes.set(true);
    this.energyService
      .getMeasurementTypes()
      .pipe(finalize(() => this.isLoadingMeasurementTypes.set(false)))
      .subscribe({
        next: (measurementTypes) => this.measurementTypes.set(measurementTypes),
        error: () => {
          this.measurementTypes.set([]);
          this.optionsLoadError.set('No se pudieron cargar los tipos de medición.');
        },
      });
  }

  goBackToEnergyRecords() {
    this.router.navigateByUrl(getRoutePath('energyRecords'));
  }

  submitCreateEnergyRecord() {
    if (this.isLoadingOptions()) {
      return;
    }

    if (this.createEnergyRecordForm.invalid) {
      this.createEnergyRecordForm.markAllAsTouched();
      return;
    }

    const formValue = this.createEnergyRecordForm.getRawValue();

    this.isSubmitting.set(true);
    this.createEnergyRecordError.set(null);

    this.energyService
      .createEnergyRecord({
        year: formValue.year,
        month: formValue.month,
        value: formValue.value,
        powerPlant: { id: formValue.powerPlantId },
        measurementType: { id: formValue.measurementTypeId },
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Registro energético creado con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToEnergyRecords();
        },
        error: () => {
          this.createEnergyRecordError.set(
            'No se pudo crear el registro. Verifica combinación única de power plant, año, mes y tipo de medición.',
          );
        },
      });
  }
}
