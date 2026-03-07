import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PowerPlant } from '../../../models/powerplants.model';
import { EnergyService } from '../../../services/energy.service';
import { createPagination } from '../../../shared/pagination/pagination';
import { getRoutePath } from '../../../routing/routes.constants';

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

  powerPlants = signal<PowerPlant[]>([]);
  pagination = createPagination(this.powerPlants, { pageSize: 10, maxVisiblePages: 5 });
  createPowerPlantPath = getRoutePath('powerPlantsCreate');

  ngOnInit(): void {
    this.loadPowerPlants();
  }

  loadPowerPlants() {
    this.energyService.getPowerPlants().subscribe((powerPlants) => {
      this.powerPlants.set(powerPlants);
      this.pagination.syncCurrentPage();
    });
  }

  navigateToCreate() {
    this.router.navigateByUrl(this.createPowerPlantPath);
  }
}
