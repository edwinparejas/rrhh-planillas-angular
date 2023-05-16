import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { of, Subject, merge } from 'rxjs';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

import { MineduConfigService } from '@minedu/services/config.service';
import { MineduSidebarService } from '@minedu/components/sidebar/sidebar.service';

import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { UserDataModel } from 'app/core/model/security/user-data.model';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';

@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy {
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;

    usuario: UserDataModel = null;

    private _unsubscribeAll: Subject<any>;

    roles: number = 0;

    constructor(
        private _mineduConfigService: MineduConfigService,
        private _mineduSidebarService: MineduSidebarService,
        private _dataService: DataService,
        private _dataSharedService: SharedService,
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this._mineduConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        this._dataSharedService.dataSharedLoadRoles
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            ).subscribe((response: boolean) => {
                if (response) {
                    this.usuario = this._dataService.Storage().getPassportUserData();
                    this.getRoles();
                }
            });

    }

    getRoles() {
        this._dataService.Passport().boot().pipe(
            catchError(() => of(null)),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response) {
                this.loadRoles(response.Token);
            } else {
                this._dataService.Message().msgWarning(PASSPORT_MESSAGE.METHOD_UNAUTHORIZED, () => {
                    this._dataService.Storage().passportUILogin();
                });
            }
        });
    }

    loadRoles(token: any) {
        const data = this._dataService.Storage().getCodigoSistema();
        const param = this._dataService.Cifrado().PassportEncode(token, data);
        this._dataService.Passport().getRolesUsuario(param).pipe(
            catchError(() => { this._dataService.SnackBar().msgError(PASSPORT_MESSAGE.BUSCAR_ROL_USUARIO, 'Cerrar'); return of(null) }),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && !response.HasErrors) {
                const roles = response.Data;
                const rol = this._dataService.Storage().getPassportRolSelected();
                this.generarMenu(roles);
                if (!rol) {
                    this.setRol(roles[0]);
                    this.getPermisos(token);
                }
            } else {
                this._dataService.Message().msgWarning(PASSPORT_MESSAGE.METHOD_UNAUTHORIZED, () => {
                    this._dataService.Storage().passportUILogin();
                });
            }
        });
    }

    setRol(rol: any) {
        this._dataService.Storage().setPassportRolSelected(rol);
    }

    getPermisos(token: any) {
        const data = this._dataService.Storage().getCodigoSistema();
        const param = this._dataService.Cifrado().PassportEncode(token, data);
        this._dataService.Passport().getAccionesUsuario(param).pipe(
            catchError(() => { this._dataService.SnackBar().msgError(PASSPORT_MESSAGE.BUSCAR_ACCION, 'Cerrar'); return of(null) }),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && !response.HasErrors) {
                const acciones = response.Data;
                this._dataService.Storage().setPassportAcciones(acciones);
            }
        });
    }

    generarMenu(datos: any[]) {
        this.roles = [...new Map(datos.map(item => [item['ID_ROL'], item])).values()].length;
    }



    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    toggleSidebarOpen(key): void {
        this._mineduSidebarService.getSidebar(key).toggleOpen();
    }

}
