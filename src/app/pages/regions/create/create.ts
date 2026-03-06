import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Country } from '../../../models/countries.model';
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

  countries = signal<Country[]>([]);
  isSubmitting = signal(false);
  createRegionError = signal<string | null>(null);

  createRegionForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    countryId: [0, [Validators.min(1)]],
  });

  constructor() {
    this.loadCountries();
  }

  loadCountries() {
    this.energyService.getCountries().subscribe((countries) => {
      this.countries.set(countries);
    });
  }

  goBackToRegions() {
    this.router.navigateByUrl(getRoutePath('regions'));
  }

  submitCreateRegion() {
    if (this.createRegionForm.invalid) {
      this.createRegionForm.markAllAsTouched();
      return;
    }

    const formValue = this.createRegionForm.getRawValue();

    this.isSubmitting.set(true);
    this.createRegionError.set(null);

    this.energyService
      .createRegion({
        name: formValue.name,
        country_id: formValue.countryId,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Región creada con éxito',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
          });
          this.goBackToRegions();
        },
        error: () => {
          this.createRegionError.set('No se pudo crear la región. Intenta nuevamente.');
        },
      });
  }
}
