import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GenerarProyectoService {

    visualizarProyectoResolucionSubject = new BehaviorSubject<string>(null);
    visualizarProyectoResolucion$: Observable<string>;

    constructor() {
        this.visualizarProyectoResolucion$ = this.visualizarProyectoResolucionSubject.asObservable();
    }

    set visualizarProyectoResolucion(value: string) {
        this.visualizarProyectoResolucionSubject.next(value);
    }
    
    get visualizarProyectoResolucion() {
       return this.visualizarProyectoResolucionSubject.value;
    }
}
