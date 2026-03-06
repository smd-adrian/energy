import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
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

  countryId = signal<number | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  updateCountryError = signal<string | null>(null);

  updateCountryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    const parsedId = Number(idParam);

    if (!idParam || Number.isNaN(parsedId)) {
      this.goBackToCountries();
      return;
    }

    this.countryId.set(parsedId);
    this.loadCountry(parsedId);
  }

  goBackToCountries() {
    this.router.navigateByUrl(getRoutePath('countries'));
  }

  loadCountry(id: number) {
    this.isLoading.set(true);
    this.updateCountryError.set(null);

    this.energyService
      .getCountryById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (country) => {
          this.updateCountryForm.setValue({ name: country.name });
        },
        error: () => {
          this.updateCountryError.set('No se pudo cargar la información del país.');
        },
      });
  }

  submitUpdateCountry() {
    if (this.updateCountryForm.invalid) {
      this.updateCountryForm.markAllAsTouched();
      return;
    }

    const id = this.countryId();
    if (id === null) {
      return;
    }

    this.isSubmitting.set(true);
    this.updateCountryError.set(null);

    this.energyService
      .updateCountry(id, this.updateCountryForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'País actualizado con éxito',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
          });
          this.goBackToCountries();
        },
        error: () => {
          this.updateCountryError.set('No se pudo actualizar el país. Intenta nuevamente.');
        },
      });
  }
}
