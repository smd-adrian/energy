import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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

  userId = signal<number | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  updateUserError = signal<string | null>(null);

  updateUserForm = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', [Validators.required]],
    password: ['', [Validators.minLength(6)]],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    const parsedId = Number(idParam);

    if (!idParam || Number.isNaN(parsedId)) {
      this.goBackToUsers();
      return;
    }

    this.userId.set(parsedId);
    this.loadUser(parsedId);
  }

  goBackToUsers() {
    this.router.navigateByUrl(getRoutePath('users'));
  }

  loadUser(id: number) {
    this.isLoading.set(true);
    this.updateUserError.set(null);

    this.energyService
      .getUserById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (user) => {
          this.updateUserForm.setValue({
            username: user.username,
            email: user.email,
            role: user.role,
            password: '',
          });
        },
        error: () => {
          this.updateUserError.set('No se pudo cargar la información del usuario.');
        },
      });
  }

  submitUpdateUser() {
    if (this.updateUserForm.invalid) {
      this.updateUserForm.markAllAsTouched();
      return;
    }

    const id = this.userId();
    if (id === null) {
      return;
    }

    this.isSubmitting.set(true);
    this.updateUserError.set(null);

    const formValue = this.updateUserForm.getRawValue();
    const payload = {
      username: formValue.username,
      email: formValue.email,
      role: formValue.role,
      ...(formValue.password ? { password: formValue.password } : {}),
    };

    this.energyService
      .updateUser(id, payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Usuario actualizado con éxito',
            confirmButtonText: 'Aceptar',
          });
          this.goBackToUsers();
        },
        error: () => {
          this.updateUserError.set('No se pudo actualizar el usuario. Intenta nuevamente.');
        },
      });
  }
}
