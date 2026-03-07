import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Country } from '../../../models/countries.model';
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

  countries = signal<Country[]>([]);
  companyId = signal<number | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  updateCompanyError = signal<string | null>(null);

  updateCompanyForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    countryId: [0, [Validators.min(1)]],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    const parsedId = Number(idParam);

    if (!idParam || Number.isNaN(parsedId)) {
      this.goBackToCompanies();
      return;
    }

    this.companyId.set(parsedId);
    this.loadCountries();
    this.loadCompany(parsedId);
  }

  loadCountries() {
    this.energyService.getCountries().subscribe((countries) => {
      this.countries.set(countries);
    });
  }

  goBackToCompanies() {
    this.router.navigateByUrl(getRoutePath('companies'));
  }

  loadCompany(id: number) {
    this.isLoading.set(true);
    this.updateCompanyError.set(null);

    this.energyService
      .getCompanyById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (company) => {
          this.updateCompanyForm.setValue({
            name: company.name,
            countryId: company.country.id,
          });
        },
        error: () => {
          this.updateCompanyError.set('No se pudo cargar la información de la empresa.');
        },
      });
  }

  submitUpdateCompany() {
    if (this.updateCompanyForm.invalid) {
      this.updateCompanyForm.markAllAsTouched();
      return;
    }

    const id = this.companyId();
    if (id === null) {
      return;
    }

    const formValue = this.updateCompanyForm.getRawValue();

    this.isSubmitting.set(true);
    this.updateCompanyError.set(null);

    this.energyService
      .updateCompany(id, {
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
            title: 'Empresa actualizada con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToCompanies();
        },
        error: () => {
          this.updateCompanyError.set('No se pudo actualizar la empresa. Intenta nuevamente.');
        },
      });
  }
}
