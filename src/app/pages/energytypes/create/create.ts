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
  createEnergyTypeError = signal<string | null>(null);

  createEnergyTypeForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    renewable: [false],
  });

  goBackToEnergyTypes() {
    this.router.navigateByUrl(getRoutePath('energyTypes'));
  }

  submitCreateEnergyType() {
    if (this.createEnergyTypeForm.invalid) {
      this.createEnergyTypeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.createEnergyTypeError.set(null);

    this.energyService
      .createEnergyType(this.createEnergyTypeForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Tipo de energía creado con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToEnergyTypes();
        },
        error: () => {
          this.createEnergyTypeError.set(
            'No se pudo crear el tipo de energía. Intenta nuevamente.',
          );
        },
      });
  }
}
