import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { EnergyType } from '../../../models/energytypes.model';
import { EnergyService } from '../../../services/energy.service';
import { getEnergyTypeUpdatePath, getRoutePath } from '../../../routing/routes.constants';
import { createPagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-list',
  imports: [],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List implements OnInit {
  private energyService = inject(EnergyService);
  private router = inject(Router);

  energyTypes = signal<EnergyType[]>([]);
  pagination = createPagination(this.energyTypes, { pageSize: 10, maxVisiblePages: 5 });

  isDeletingEnergyTypeId = signal<number | null>(null);
  createEnergyTypePath = getRoutePath('energyTypesCreate');

  ngOnInit(): void {
    this.loadEnergyTypes();
  }

  loadEnergyTypes() {
    this.energyService.getEnergyTypes().subscribe((energyTypes) => {
      this.energyTypes.set(energyTypes);
      this.pagination.syncCurrentPage();
    });
  }

  getUpdatePath(id: number): string {
    return getEnergyTypeUpdatePath(id);
  }

  navigateToCreate() {
    this.router.navigateByUrl(this.createEnergyTypePath);
  }

  navigateToUpdate(id: number) {
    this.router.navigateByUrl(this.getUpdatePath(id));
  }

  async onDeleteEnergyType(energyType: EnergyType) {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar tipo de energía?',
      text: `Esta acción eliminará ${energyType.name}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.isDeletingEnergyTypeId.set(energyType.id);

    this.energyService
      .deleteEnergyType(energyType.id)
      .pipe(finalize(() => this.isDeletingEnergyTypeId.set(null)))
      .subscribe({
        next: async () => {
          this.energyTypes.update((currentEnergyTypes) =>
            currentEnergyTypes.filter(
              (currentEnergyType) => currentEnergyType.id !== energyType.id,
            ),
          );
          this.pagination.syncCurrentPage();

          await Swal.fire({
            icon: 'success',
            title: 'Tipo de energía eliminado',
            confirmButtonText: 'Aceptar',
          });
        },
        error: async () => {
          await Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar el tipo de energía',
            text: 'Intenta nuevamente.',
          });
        },
      });
  }
}
