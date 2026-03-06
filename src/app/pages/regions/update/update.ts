import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Country } from '../../../models/countries.model';
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

  countries = signal<Country[]>([]);
  regionId = signal<number | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  updateRegionError = signal<string | null>(null);

  updateRegionForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    countryId: [0, [Validators.min(1)]],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    const parsedId = Number(idParam);

    if (!idParam || Number.isNaN(parsedId)) {
      this.goBackToRegions();
      return;
    }

    this.regionId.set(parsedId);
    this.loadCountries();
    this.loadRegion(parsedId);
  }

  loadCountries() {
    this.energyService.getCountries().subscribe((countries) => {
      this.countries.set(countries);
    });
  }

  goBackToRegions() {
    this.router.navigateByUrl(getRoutePath('regions'));
  }

  loadRegion(id: number) {
    this.isLoading.set(true);
    this.updateRegionError.set(null);

    this.energyService
      .getRegionById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (region) => {
          this.updateRegionForm.setValue({
            name: region.name,
            countryId: region.country.id,
          });
        },
        error: () => {
          this.updateRegionError.set('No se pudo cargar la información de la región.');
        },
      });
  }

  submitUpdateRegion() {
    if (this.updateRegionForm.invalid) {
      this.updateRegionForm.markAllAsTouched();
      return;
    }

    const id = this.regionId();
    if (id === null) {
      return;
    }

    const formValue = this.updateRegionForm.getRawValue();

    this.isSubmitting.set(true);
    this.updateRegionError.set(null);

    this.energyService
      .updateRegion(id, {
        name: formValue.name,
        country_id: formValue.countryId,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Región actualizada con éxito',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
          });
          this.goBackToRegions();
        },
        error: () => {
          this.updateRegionError.set('No se pudo actualizar la región. Intenta nuevamente.');
        },
      });
  }
}
