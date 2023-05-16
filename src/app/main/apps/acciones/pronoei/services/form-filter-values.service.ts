import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormFilterValuesService {

  private bandejaFiltroSource = new BehaviorSubject<any>(null);
  private selectedRowsSource = new BehaviorSubject<any[]>([]);

  constructor() { }

  setBandejaFiltroObservable(value: any) {
    this.bandejaFiltroSource.next(value);
  }

  setSelectedRowsSource(value: any[]) {
    this.selectedRowsSource.next(value);
  }

  getBandejaPrincipalSelectRows() {
    return this.selectedRowsSource.value;
  }

  get bandejaPrincipalSelectRows$() {
    return this.selectedRowsSource.asObservable();
  }

  get filters() {
    return this.bandejaFiltroSource.value;
  }

  getBandejaFiltroObservable() {
    return this.bandejaFiltroSource.asObservable();
  }
}
