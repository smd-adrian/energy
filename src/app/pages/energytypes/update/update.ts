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

  energyTypeId = signal<number | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  updateEnergyTypeError = signal<string | null>(null);

  updateEnergyTypeForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    renewable: [false],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    const parsedId = Number(idParam);

    if (!idParam || Number.isNaN(parsedId)) {
      this.goBackToEnergyTypes();
      return;
    }

    this.energyTypeId.set(parsedId);
    this.loadEnergyType(parsedId);
  }

  goBackToEnergyTypes() {
    this.router.navigateByUrl(getRoutePath('energyTypes'));
  }

  loadEnergyType(id: number) {
    this.isLoading.set(true);
    this.updateEnergyTypeError.set(null);

    this.energyService
      .getEnergyTypeById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (energyType) => {
          this.updateEnergyTypeForm.setValue({
            name: energyType.name,
            renewable: energyType.renewable,
          });
        },
        error: () => {
          this.updateEnergyTypeError.set('No se pudo cargar la información del tipo de energía.');
        },
      });
  }

  submitUpdateEnergyType() {
    if (this.updateEnergyTypeForm.invalid) {
      this.updateEnergyTypeForm.markAllAsTouched();
      return;
    }

    const id = this.energyTypeId();
    if (id === null) {
      return;
    }

    this.isSubmitting.set(true);
    this.updateEnergyTypeError.set(null);

    this.energyService
      .updateEnergyType(id, this.updateEnergyTypeForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Tipo de energía actualizado con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToEnergyTypes();
        },
        error: () => {
          this.updateEnergyTypeError.set(
            'No se pudo actualizar el tipo de energía. Intenta nuevamente.',
          );
        },
      });
  }
}
