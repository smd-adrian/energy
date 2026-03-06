import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Country } from '../../../models/countries.model';
import { EnergyService } from '../../../services/energy.service';
import { getCountryUpdatePath, getRoutePath } from '../../../routing/routes.constants';
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

  countries = signal<Country[]>([]);
  pagination = createPagination(this.countries, { pageSize: 10, maxVisiblePages: 5 });

  isDeletingCountryId = signal<number | null>(null);
  createCountryPath = getRoutePath('countriesCreate');

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries() {
    this.energyService.getCountries().subscribe((countries) => {
      this.countries.set(countries);
      this.pagination.syncCurrentPage();
    });
  }

  getUpdatePath(id: number): string {
    return getCountryUpdatePath(id);
  }

  navigateToCreate() {
    this.router.navigateByUrl(this.createCountryPath);
  }

  navigateToUpdate(id: number) {
    this.router.navigateByUrl(this.getUpdatePath(id));
  }

  async onDeleteCountry(country: Country) {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar país?',
      text: `Esta acción eliminará ${country.name}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.isDeletingCountryId.set(country.id);

    this.energyService
      .deleteCountry(country.id)
      .pipe(finalize(() => this.isDeletingCountryId.set(null)))
      .subscribe({
        next: async () => {
          this.countries.update((currentCountries) =>
            currentCountries.filter((currentCountry) => currentCountry.id !== country.id),
          );
          this.pagination.syncCurrentPage();

          await Swal.fire({
            icon: 'success',
            title: 'País eliminado',
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
            title: 'No se pudo eliminar el país',
            text: 'Intenta nuevamente.',
          });
        },
      });
  }
}
