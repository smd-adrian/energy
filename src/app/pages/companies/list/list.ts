import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Company } from '../../../models/companies.model';
import { EnergyService } from '../../../services/energy.service';
import { getCompanyUpdatePath, getRoutePath } from '../../../routing/routes.constants';
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

  companies = signal<Company[]>([]);
  pagination = createPagination(this.companies, { pageSize: 10, maxVisiblePages: 5 });

  isDeletingCompanyId = signal<number | null>(null);
  createCompanyPath = getRoutePath('companiesCreate');

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies() {
    this.energyService.getCompanies().subscribe((companies) => {
      this.companies.set(companies);
      this.pagination.syncCurrentPage();
    });
  }

  getUpdatePath(id: number): string {
    return getCompanyUpdatePath(id);
  }

  navigateToCreate() {
    this.router.navigateByUrl(this.createCompanyPath);
  }

  navigateToUpdate(id: number) {
    this.router.navigateByUrl(this.getUpdatePath(id));
  }

  async onDeleteCompany(company: Company) {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar empresa?',
      text: `Esta acción eliminará ${company.name}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.isDeletingCompanyId.set(company.id);

    this.energyService
      .deleteCompany(company.id)
      .pipe(finalize(() => this.isDeletingCompanyId.set(null)))
      .subscribe({
        next: async () => {
          this.companies.update((currentCompanies) =>
            currentCompanies.filter((currentCompany) => currentCompany.id !== company.id),
          );
          this.pagination.syncCurrentPage();

          await Swal.fire({
            icon: 'success',
            title: 'Empresa eliminada',
            confirmButtonText: 'Aceptar',
          });
        },
        error: async () => {
          await Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar la empresa',
            text: 'Intenta nuevamente.',
          });
        },
      });
  }
}
