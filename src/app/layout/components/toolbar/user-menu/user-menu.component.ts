import { Input, ViewEncapsulation } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MineduNavigationService } from '@minedu/components/navigation/navigation.service';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { InstanciaModel, PassportRolModel } from 'app/core/model/security/passport-rol.model';
import { TablaEquivalenciaSede, TablaRolPassport } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { InstanciasViewComponent } from 'app/main/apps/components/instancias-view/instancias-view.component';
import { MESSAGE_GESTION } from 'app/main/apps/gestion/_utils/messages';
import { initial } from 'lodash';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { RolMenuComponent } from '../rol-menu/rol-menu.component';

@Component({
    selector: 'minedu-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UserMenuComponent implements OnInit, OnDestroy {

    @Input()
    roles: number = 0;

    data: any = null;
    esRolMonitor: boolean = false;

    private _unsubscribeAll: Subject<any>;
    imageurl: any = null;
    dialogRef: any;

    rolSelected: PassportRolModel = null;

    constructor(
        private dataService: DataService,
        private dataShared: SharedService,
        private servidorPublicoNavigationService: MineduNavigationService,
        private _materialDialog: MatDialog,
        private router: Router,
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit() {
        setTimeout(() => {
            this.data = this.dataService.Storage().getPassportUserData();
            this.rolSelected = this.dataService.Storage().getPassportRolSelected();
            // this.esRolMonitor = this.rolSelected.CODIGO_ROL === TablaRolPassport.MONITOR || this.rolSelected.CODIGO_ROL === TablaRolPassport.ESPECIALISTA_MINEDU;
            this.esRolMonitor=true;
            //this.initial();
        }, 0);

    }

    initial() {
        this.dataShared.dataSharedLoadRoles
            .pipe(
                filter((value) => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((d) => {

                if (this.esRolMonitor) {
                    const instancia = this.dataService.Storage().getInstanciaSelected();
                    if (instancia) {
                        this.rolSelected.NOMBRE_SEDE = instancia.descripcionInstancia;
                    }
                }
            });

        this.dataShared.onDataSharedImage
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((d) => {
                this.imageurl = d;
            });

        this.dataShared.onSedeChanged
            .pipe(
                filter((value) => value !== null),
                takeUntil(this._unsubscribeAll)
            ).subscribe((d) => {
                // this.rolSelected = this.dataService.Storage().getPassportRolSelected();
                // this.esRolMonitor = this.rolSelected.CODIGO_ROL === TablaRolPassport.MONITOR || this.rolSelected.CODIGO_ROL === TablaRolPassport.ESPECIALISTA_MINEDU;
                if (this.esRolMonitor) {
                    const instancia = this.dataService.Storage().getInstanciaSelected();
                    if (instancia) {
                        this.rolSelected.NOMBRE_SEDE = instancia.descripcionInstancia;
                    }
                }
            });

        this.dataShared.onMonitorSelectedOpen
            .pipe(
                filter((value) => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((d) => {
                if (d) {
                    // this.rolSelected = this.dataService.Storage().getPassportRolSelected();
                    // this.esRolMonitor = this.rolSelected.CODIGO_ROL === TablaRolPassport.MONITOR || this.rolSelected.CODIGO_ROL === TablaRolPassport.ESPECIALISTA_MINEDU;
                    if (this.esRolMonitor && this.rolSelected.CODIGO_TIPO_SEDE !== TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL) {
                        this.CambiarInstancia();
                    } else {
                        let intancia = new InstanciaModel();
                        intancia.codigoInstancia = this.rolSelected.CODIGO_SEDE;
                        intancia.codigoTipoSede = this.rolSelected.CODIGO_TIPO_SEDE;
                        intancia.descripcionInstancia = this.rolSelected.DESCRIPCION_TIPO_SEDE;

                        this.dataService.Storage().setInstanciaSelected(intancia);
                    }
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    Logout() {
        this.dataService.Message().msgAutoCloseSuccess(PASSPORT_MESSAGE.END_SESSION, 3000, () => {
            this.dataService.Storage().removeCredentials();
            this.servidorPublicoNavigationService.unregister('main');
            this.dataService.Storage().passportUILogin();
        });
    }

    IrPanel() {
        this.dataService.Storage().passportUIPanel();
    }

    CambiarRol() {
        this.dialogRef = this._materialDialog.open(RolMenuComponent, {
            panelClass: 'rol-dialog',
            data: {}
        });
    }

    permiteCambiarInstancia() {
        return true;
        return this.esRolMonitor &&
            this.rolSelected.CODIGO_TIPO_SEDE !== TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL &&
            this.data;
    }

    CambiarInstancia() {
        this.dialogRef = this._materialDialog.open(InstanciasViewComponent, {
            panelClass: "modal-instancias",
            disableClose: true,
            data: {},
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (response) this.router.navigate(['/ayni/personal/inicio']);

                return;
            });
    }
}
