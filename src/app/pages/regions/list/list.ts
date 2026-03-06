import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Region } from '../../../models/regions.model';
import { EnergyService } from '../../../services/energy.service';
import { getRegionUpdatePath, getRoutePath } from '../../../routing/routes.constants';
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

  regions = signal<Region[]>([]);
  pagination = createPagination(this.regions, { pageSize: 10, maxVisiblePages: 5 });

  isDeletingRegionId = signal<number | null>(null);
  createRegionPath = getRoutePath('regionsCreate');

  ngOnInit(): void {
    this.loadRegions();
  }

  loadRegions() {
    this.energyService.getRegions().subscribe((regions) => {
      this.regions.set(regions);
      this.pagination.syncCurrentPage();
    });
  }

  getUpdatePath(id: number): string {
    return getRegionUpdatePath(id);
  }

  navigateToCreate() {
    this.router.navigateByUrl(this.createRegionPath);
  }

  navigateToUpdate(id: number) {
    this.router.navigateByUrl(this.getUpdatePath(id));
  }

  async onDeleteRegion(region: Region) {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar región?',
      text: `Esta acción eliminará ${region.name}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.isDeletingRegionId.set(region.id);

    this.energyService
      .deleteRegion(region.id)
      .pipe(finalize(() => this.isDeletingRegionId.set(null)))
      .subscribe({
        next: async () => {
          this.regions.update((currentRegions) =>
            currentRegions.filter((currentRegion) => currentRegion.id !== region.id),
          );
          this.pagination.syncCurrentPage();

          await Swal.fire({
            icon: 'success',
            title: 'Región eliminada',
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
            title: 'No se pudo eliminar la región',
            text: 'Intenta nuevamente.',
          });
        },
      });
  }
}
