import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { EnergyRecord } from '../../../models/energyrecords.model';
import { EnergyService } from '../../../services/energy.service';
import { createPagination } from '../../../shared/pagination/pagination';
import { getEnergyRecordUpdatePath, getRoutePath } from '../../../routing/routes.constants';

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

  energyRecords = signal<EnergyRecord[]>([]);
  pagination = createPagination(this.energyRecords, { pageSize: 10, maxVisiblePages: 5 });

  isDeletingEnergyRecordId = signal<number | null>(null);
  createEnergyRecordPath = getRoutePath('energyRecordsCreate');

  ngOnInit(): void {
    this.loadEnergyRecords();
  }

  loadEnergyRecords() {
    this.energyService.getEnergyRecords().subscribe((energyRecords) => {
      this.energyRecords.set(energyRecords);
      this.pagination.syncCurrentPage();
    });
  }

  getUpdatePath(id: number): string {
    return getEnergyRecordUpdatePath(id);
  }

  navigateToCreate() {
    this.router.navigateByUrl(this.createEnergyRecordPath);
  }

  navigateToUpdate(id: number) {
    this.router.navigateByUrl(this.getUpdatePath(id));
  }

  async onDeleteEnergyRecord(energyRecord: EnergyRecord) {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar registro energético?',
      text: `Esta acción eliminará el registro ${energyRecord.year}-${energyRecord.month}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.isDeletingEnergyRecordId.set(energyRecord.id);

    this.energyService
      .deleteEnergyRecord(energyRecord.id)
      .pipe(finalize(() => this.isDeletingEnergyRecordId.set(null)))
      .subscribe({
        next: async () => {
          this.energyRecords.update((currentEnergyRecords) =>
            currentEnergyRecords.filter(
              (currentEnergyRecord) => currentEnergyRecord.id !== energyRecord.id,
            ),
          );
          this.pagination.syncCurrentPage();

          await Swal.fire({
            icon: 'success',
            title: 'Registro eliminado',
            confirmButtonText: 'Aceptar',
          });
        },
        error: async () => {
          await Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar el registro',
            text: 'Intenta nuevamente.',
          });
        },
      });
  }
}
