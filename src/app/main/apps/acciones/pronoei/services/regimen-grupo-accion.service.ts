import { Injectable } from '@angular/core';
import { DataService } from '../../../../../core/data/data.service';
import { RegimenGrupoAccionEnum } from '../_utils/constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { IRegimenGrupoAccionResponse } from '../interfaces/regimen-grupo-accion.interface';

@Injectable({
  providedIn: 'root'
})
export class RegimenGrupoAccionService {


  private grupoAccionDataSubject = new BehaviorSubject<IRegimenGrupoAccionResponse>(null);
  regimenGrupoAccionData$: Observable<IRegimenGrupoAccionResponse>;

  constructor(private dataService: DataService) {
    this.regimenGrupoAccionData$ = this.grupoAccionDataSubject.asObservable();
    this.getRegimenGrupoAccionData();
  }

  get regimenGrupoAccion() {
    return this.grupoAccionDataSubject.value;
  }

  private async getRegimenGrupoAccionData() {
    const regimenGrupoAccionId = RegimenGrupoAccionEnum.PRONOEI;
    var response = await this.dataService.AccionesVinculacion().getRegimenGrupoAccion({ regimenGrupoAccionId }).toPromise();
    if (response) {
      this.grupoAccionDataSubject.next(response as IRegimenGrupoAccionResponse);
    }
  }
}
