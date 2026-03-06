import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { EnergyService } from '../../../services/energy.service';
import { Users as UsersData } from '../../../models/users.model';
import { getRoutePath, getUserUpdatePath } from '../../../routing/routes.constants';
import { createPagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-users',
  imports: [RouterLink],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  private energyService = inject(EnergyService);

  users = signal<UsersData[]>([]);
  pagination = createPagination(this.users, { pageSize: 10, maxVisiblePages: 5 });

  isDeletingUserId = signal<number | null>(null);
  createUserPath = getRoutePath('usersCreate');

  ngOnInit(): void {
    this.loadUsersData();
  }

  loadUsersData() {
    this.energyService.getUsers().subscribe((users) => {
      this.users.set(users);
      this.pagination.syncCurrentPage();
    });
  }

  getUpdatePath(id: number): string {
    return getUserUpdatePath(id);
  }

  async onDeleteUser(user: UsersData) {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar usuario?',
      text: `Esta acción eliminará a ${user.username}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.isDeletingUserId.set(user.id);

    this.energyService
      .deleteUser(user.id)
      .pipe(finalize(() => this.isDeletingUserId.set(null)))
      .subscribe({
        next: async () => {
          this.users.update((currentUsers) =>
            currentUsers.filter((currentUser) => currentUser.id !== user.id),
          );
          this.pagination.syncCurrentPage();

          await Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
          });
        },
        error: async () => {
          await Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar el usuario',
            text: 'Intenta nuevamente.',
          });
        },
      });
  }
}
