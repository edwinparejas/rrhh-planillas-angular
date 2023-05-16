import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class RegistrarDesplazamientoService {

    private accionPersonalItemSubject: BehaviorSubject<any>;
    accionPersonalItem$: Observable<number>;

    constructor() { }

    get accionPersonalItem() {
        return this.accionPersonalItemSubject.value;
    }
    set accionPersonalItem(accionPersonalItem: number) {
        this.accionPersonalItemSubject.next(accionPersonalItem);
    }
    iniciar() {
        this.accionPersonalItemSubject = new BehaviorSubject<number>(null);
        this.accionPersonalItem$ = this.accionPersonalItemSubject.asObservable();
    }
    matar() {
        this.accionPersonalItemSubject.complete();
    }
}
