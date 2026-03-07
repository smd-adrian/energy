import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { MeasurementType } from '../../../models/measurementtypes.model';
import { PowerPlant } from '../../../models/powerplants.model';
import { EnergyService } from '../../../services/energy.service';
import { getRoutePath } from '../../../routing/routes.constants';

@Component({
  selector: 'app-update',
  imports: [ReactiveFormsModule],
  templateUrl: './update.html',
  styleUrl: './update.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Update implements OnInit {
  private energyService = inject(EnergyService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

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

  energyRecordId = signal<number | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  updateEnergyRecordError = signal<string | null>(null);

  isLoadingOptions = computed(
    () => this.isLoadingPowerPlants() || this.isLoadingMeasurementTypes(),
  );

  updateEnergyRecordForm = this.formBuilder.nonNullable.group({
    year: [this.currentYear, [Validators.required, Validators.min(1900), Validators.max(2100)]],
    month: [0, [Validators.required, Validators.min(1), Validators.max(12)]],
    value: [0, [Validators.required, Validators.min(0.000001)]],
    powerPlantId: [0, [Validators.required, Validators.min(1)]],
    measurementTypeId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    const parsedId = Number(idParam);

    if (!idParam || Number.isNaN(parsedId)) {
      this.goBackToEnergyRecords();
      return;
    }

    this.energyRecordId.set(parsedId);
    this.loadOptions();
    this.loadEnergyRecord(parsedId);
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

  loadEnergyRecord(id: number) {
    this.isLoading.set(true);
    this.updateEnergyRecordError.set(null);

    this.energyService
      .getEnergyRecordById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (energyRecord) => {
          this.updateEnergyRecordForm.setValue({
            year: energyRecord.year,
            month: energyRecord.month,
            value: energyRecord.value,
            powerPlantId: energyRecord.powerPlant.id,
            measurementTypeId: energyRecord.measurementType.id,
          });
        },
        error: () => {
          this.updateEnergyRecordError.set('No se pudo cargar la información del registro.');
        },
      });
  }

  submitUpdateEnergyRecord() {
    if (this.isLoadingOptions()) {
      return;
    }

    if (this.updateEnergyRecordForm.invalid) {
      this.updateEnergyRecordForm.markAllAsTouched();
      return;
    }

    const id = this.energyRecordId();
    if (id === null) {
      return;
    }

    const formValue = this.updateEnergyRecordForm.getRawValue();

    this.isSubmitting.set(true);
    this.updateEnergyRecordError.set(null);

    this.energyService
      .updateEnergyRecord(id, {
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
            title: 'Registro energético actualizado con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToEnergyRecords();
        },
        error: () => {
          this.updateEnergyRecordError.set(
            'No se pudo actualizar el registro. Verifica combinación única de power plant, año, mes y tipo de medición.',
          );
        },
      });
  }
}
