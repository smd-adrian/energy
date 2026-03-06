import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
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

  isSubmitting = signal(false);
  createCountryError = signal<string | null>(null);

  createCountryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  goBackToCountries() {
    this.router.navigateByUrl(getRoutePath('countries'));
  }

  submitCreateCountry() {
    if (this.createCountryForm.invalid) {
      this.createCountryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.createCountryError.set(null);

    this.energyService
      .createCountry(this.createCountryForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'País creado con éxito',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
          });
          this.goBackToCountries();
        },
        error: () => {
          this.createCountryError.set('No se pudo crear el país. Intenta nuevamente.');
        },
      });
  }
}
