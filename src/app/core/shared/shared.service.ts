import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SharedService {

    private _onSharedTitle: BehaviorSubject<any>;
    private _onSharedBreadcrumb: BehaviorSubject<any>;
    private _onDataSharedImage: BehaviorSubject<any>;
    private _onDataSharedImageLoaded: BehaviorSubject<any>;

    //   private _onMonitorSelectedOpen: Subject<boolean> = new Subject<boolean>();    
    private _onMonitorSelectedOpen: BehaviorSubject<boolean>;
    private _onDataSharedMenu: Subject<boolean> = new Subject<boolean>();
    private _onDataSharedLoadRoles: Subject<boolean> = new Subject<boolean>();
    private _onDataSharedPersonal: BehaviorSubject<any>;
    private _onDataSharedRotacion: BehaviorSubject<any>;
    private _onDataSharedReasignacion: BehaviorSubject<any>;
    private _onDataSharedRotacionCalificacion: BehaviorSubject<any>;
    private _onDataSharedWorking: Subject<boolean> = new Subject<boolean>();
    private _onDataSharedSedeChanged: Subject<boolean> = new Subject<boolean>();
    private _onDataCentroTrabajo: Subject<any> = new Subject<any>();

    constructor() {
        this._onSharedTitle = new BehaviorSubject(null);
        this._onSharedBreadcrumb = new BehaviorSubject(null);
        this._onDataSharedImage = new BehaviorSubject(null);
        this._onDataSharedImageLoaded = new BehaviorSubject(null);
        this._onDataSharedPersonal = new BehaviorSubject(null);
        this._onDataSharedRotacion = new BehaviorSubject(null);
        this._onDataSharedRotacionCalificacion = new BehaviorSubject(null);
        this._onDataSharedReasignacion = new BehaviorSubject(null);
        this._onMonitorSelectedOpen = new BehaviorSubject<boolean>(false);
    }

    /*
     *  GETS 
     */

    get onSharedTitle(): Observable<any> {
        return this._onSharedTitle.asObservable();
    }

    get onSharedBreadcrumb(): Observable<any> {
        return this._onSharedBreadcrumb.asObservable();
    }

    get onDataSharedImage(): Observable<any> {
        return this._onDataSharedImage.asObservable();
    }

    get onDataSharedImageLoaded(): Observable<any> {
        return this._onDataSharedImageLoaded.asObservable();
    }

    get dataSharedMenu(): Observable<boolean> {
        return this._onDataSharedMenu.asObservable();
    }

    get dataSharedLoadRoles(): Observable<boolean> {
        return this._onDataSharedLoadRoles.asObservable();
    }

    get onDataSharedPersonal(): Observable<any> {
        return this._onDataSharedPersonal.asObservable();
    }
    get onDataSharedRotacion(): Observable<any> {
        return this._onDataSharedRotacion.asObservable();
    }

    get onDataSharedRotacionPermisoCalificacion(): Observable<any> {
        return this._onDataSharedRotacionCalificacion.asObservable();
    }

    get onMonitorSelectedOpen(): Observable<boolean> {
        return this._onMonitorSelectedOpen.asObservable();
    }
    get onWorking(): Observable<boolean> {
        return this._onDataSharedWorking.asObservable();
    }

    get onSedeChanged(): Observable<boolean> {
        return this._onDataSharedSedeChanged.asObservable();
    }

    get onDataSharedReasignacion(): Observable<any> {
        return this._onDataSharedReasignacion.asObservable();
    }

    /*
     *  SETS 
     */

    setSharedTitle(title: string): void {
        if (!title) {
            return;
        }
        this._onSharedTitle.next(title);
    }

    setSharedBreadcrumb(breadcrumb: string): void {
        if (!breadcrumb) {
            return;
        }
        this._onSharedBreadcrumb.next(breadcrumb);
    }

    setDataSharedImage(d: any): void {
        if (!d) {
            return;
        }
        this._onDataSharedImage.next(d);
    }

    setDataSharedImageLoaded(d: any): void {
        this._onDataSharedImageLoaded.next(d);
    }

    sendDataSharedMenu(d: boolean): void {
        this._onDataSharedMenu.next(d);
    }

    sendDataSharedLoadRoles(d: boolean): void {
        this._onDataSharedLoadRoles.next(d);
    }

    setDataSharedPersonal(d: boolean): void {
        this._onDataSharedPersonal.next(d);
    }

    sendMonitorSelectedOpen(d: boolean): void {
        this._onMonitorSelectedOpen.next(d);
    }

    sendWorking(d: boolean): void {
        this._onDataSharedWorking.next(d);
    }

    sendSedeChanged(d: boolean): void {
        this._onDataSharedSedeChanged.next(d);
    }

    sendRotacionData(d: any): void {
        this._onDataSharedRotacion.next(d);
    }

    sendRotacionCalificacionPermiso(d: any): void {
        this._onDataSharedRotacionCalificacion.next(d);
    }

    sendDataSharedCentroTrabajo(data: any): void {
        this._onDataCentroTrabajo.next(data);
    }

    sendReasignacionData(d: any): void {
        this._onDataSharedReasignacion.next(d);
    }
}
