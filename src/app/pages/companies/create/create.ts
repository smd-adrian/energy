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
  createCompanyError = signal<string | null>(null);

  createCompanyForm = this.formBuilder.nonNullable.group({
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

  goBackToCompanies() {
    this.router.navigateByUrl(getRoutePath('companies'));
  }

  submitCreateCompany() {
    if (this.createCompanyForm.invalid) {
      this.createCompanyForm.markAllAsTouched();
      return;
    }

    const formValue = this.createCompanyForm.getRawValue();

    this.isSubmitting.set(true);
    this.createCompanyError.set(null);

    this.energyService
      .createCompany({
        name: formValue.name,
        country: {
          id: formValue.countryId,
        },
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Empresa creada con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToCompanies();
        },
        error: () => {
          this.createCompanyError.set('No se pudo crear la empresa. Intenta nuevamente.');
        },
      });
  }
}
