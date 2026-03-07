import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MeasurementType } from '../../../models/measurementtypes.model';
import { EnergyService } from '../../../services/energy.service';
import { getRoutePath } from '../../../routing/routes.constants';
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

  measurementTypes = signal<MeasurementType[]>([]);
  pagination = createPagination(this.measurementTypes, {
    pageSize: 10,
    maxVisiblePages: 5,
  });
  createMeasurementTypePath = getRoutePath('measurementTypesCreate');

  ngOnInit(): void {
    this.loadMeasurementTypes();
  }

  loadMeasurementTypes() {
    this.energyService.getMeasurementTypes().subscribe((measurementTypes) => {
      this.measurementTypes.set(measurementTypes);
      this.pagination.syncCurrentPage();
    });
  }

  navigateToCreate() {
    this.router.navigateByUrl(this.createMeasurementTypePath);
  }
}
