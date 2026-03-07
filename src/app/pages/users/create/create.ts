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
  createUserError = signal<string | null>(null);

  createUserForm = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  goBackToUsers() {
    this.router.navigateByUrl(getRoutePath('users'));
  }

  submitCreateUser() {
    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.createUserError.set(null);

    this.energyService
      .createUser(this.createUserForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Usuario creado con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToUsers();
        },
        error: () => {
          this.createUserError.set('No se pudo crear el usuario. Intenta nuevamente.');
        },
      });
  }
}
