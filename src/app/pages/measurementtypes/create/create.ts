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
  createMeasurementTypeError = signal<string | null>(null);

  createMeasurementTypeForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    unit: ['', [Validators.required, Validators.minLength(2)]],
  });

  goBackToMeasurementTypes() {
    this.router.navigateByUrl(getRoutePath('measurementTypes'));
  }

  submitCreateMeasurementType() {
    if (this.createMeasurementTypeForm.invalid) {
      this.createMeasurementTypeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.createMeasurementTypeError.set(null);

    this.energyService
      .createMeasurementType(this.createMeasurementTypeForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Tipo de medición creado con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToMeasurementTypes();
        },
        error: () => {
          this.createMeasurementTypeError.set(
            'No se pudo crear el tipo de medición. Intenta nuevamente.',
          );
        },
      });
  }
}
