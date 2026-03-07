import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Company } from '../../../models/companies.model';
import { Region } from '../../../models/regions.model';
import { EnergyType } from '../../../models/energytypes.model';
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

  companies = signal<Company[]>([]);
  regions = signal<Region[]>([]);
  energyTypes = signal<EnergyType[]>([]);
  isLoadingCompanies = signal(true);
  isLoadingRegions = signal(true);
  isLoadingEnergyTypes = signal(true);
  optionsLoadError = signal<string | null>(null);

  isSubmitting = signal(false);
  createPowerPlantError = signal<string | null>(null);
  isLoadingOptions = computed(
    () => this.isLoadingCompanies() || this.isLoadingRegions() || this.isLoadingEnergyTypes(),
  );

  createPowerPlantForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    companyId: [0, [Validators.min(1)]],
    regionId: [0, [Validators.min(1)]],
    energyTypeId: [0, [Validators.min(1)]],
  });

  constructor() {
    this.loadOptions();
  }

  loadOptions() {
    this.optionsLoadError.set(null);

    this.isLoadingCompanies.set(true);
    this.energyService
      .getCompanies()
      .pipe(finalize(() => this.isLoadingCompanies.set(false)))
      .subscribe({
        next: (companies) => this.companies.set(companies),
        error: () => {
          this.optionsLoadError.set('No se pudieron cargar las empresas.');
          this.companies.set([]);
        },
      });

    this.isLoadingRegions.set(true);
    this.energyService
      .getRegions()
      .pipe(finalize(() => this.isLoadingRegions.set(false)))
      .subscribe({
        next: (regions) => this.regions.set(regions),
        error: () => {
          this.optionsLoadError.set('No se pudieron cargar las regiones.');
          this.regions.set([]);
        },
      });

    this.isLoadingEnergyTypes.set(true);
    this.energyService
      .getEnergyTypes()
      .pipe(finalize(() => this.isLoadingEnergyTypes.set(false)))
      .subscribe({
        next: (energyTypes) => this.energyTypes.set(energyTypes),
        error: () => {
          this.optionsLoadError.set('No se pudieron cargar los tipos de energía.');
          this.energyTypes.set([]);
        },
      });
  }

  goBackToPowerPlants() {
    this.router.navigateByUrl(getRoutePath('powerPlants'));
  }

  submitCreatePowerPlant() {
    if (this.isLoadingOptions()) {
      return;
    }

    if (this.createPowerPlantForm.invalid) {
      this.createPowerPlantForm.markAllAsTouched();
      return;
    }

    const formValue = this.createPowerPlantForm.getRawValue();

    this.isSubmitting.set(true);
    this.createPowerPlantError.set(null);

    this.energyService
      .createPowerPlant({
        name: formValue.name,
        company: { id: formValue.companyId },
        region: { id: formValue.regionId },
        energyType: { id: formValue.energyTypeId },
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Power plant creada con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToPowerPlants();
        },
        error: () => {
          this.createPowerPlantError.set('No se pudo crear la power plant. Intenta nuevamente.');
        },
      });
  }
}
