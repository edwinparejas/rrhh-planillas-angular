import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { MineduSidebarService } from "@minedu/components/sidebar/sidebar.service";
import { MineduConfigService } from "@minedu/services/config.service";
import { mineduInicioConfig } from "app/config/minedu-config";
import { DataService } from "app/core/data/data.service";
import { PassportMenuOperacionModel } from "app/core/model/security/passport-menu.model";
import { SecurityModel } from "app/core/model/security/security.model";
import { TablaEquivalenciaSede, TablaRolPassport } from "app/core/model/types";
import { SharedService } from "app/core/shared/shared.service";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { InstanciasViewComponent } from "../components/instancias-view/instancias-view.component";
import { MESSAGE_GESTION } from "../gestion/_utils/messages";

@Component({
    selector: "minedu-personal-dashboard",
    templateUrl: "./personal-dashboard.component.html",
    styleUrls: ["./personal-dashboard.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PersonalDashboardComponent implements OnInit, OnDestroy {
    menus: any[] = [];
    private _unsubscribeAll: Subject<any>;
    private passport: SecurityModel = new SecurityModel();
    dialogRef: any;

    constructor(
        private router: Router,
        private dataService: DataService,
        private dataSharedService: SharedService,
        private _mineduSidebarService: MineduSidebarService,
        private _mineduConfigService: MineduConfigService,
        private _materialDialog: MatDialog
    ) {
        this._unsubscribeAll = new Subject();

        var rolSelected = this.dataService.Storage().getPassportRolSelected();
        if (rolSelected.CODIGO_ROL === TablaRolPassport.MONITOR &&
            rolSelected.CODIGO_TIPO_SEDE !== TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL) {
            this.dataSharedService.sendMonitorSelectedOpen(true);
        }
    }

    ngOnInit(): void {
        setTimeout(() => this._mineduConfigService.setConfig(mineduInicioConfig), 0);
        this.dataSharedService.onDataSharedPersonal
            .pipe(
                filter((value) => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((d) => {
                if (d && this.menus.length <= 0) {
                    this.menus = [];
                    this.dataService
                        .Storage()
                        .getMenuPassport()
                        .map((item) => {
                            const children = this.dataService
                                .Storage()
                                .getMenuHijoPassport(item.ID_MENU);
                            if (!children) {
                                this.menus.push(item);
                            }
                        });
                }
            });
    }

    navigate(menu: PassportMenuOperacionModel) {
        if (!menu) {
            return;
        }
        this.dataService
            .Storage()
            .setPassportMenuSelected({
                id: menu.ID_MENU,
                title: menu.NOMBRE_MENU,
                icon: menu.NOMBRE_ICONO,
                url: menu.URL,
            });
        if (menu.ID_MENU_PADRE && menu.ID_MENU_PADRE > 0) {
            const padre = this.dataService
                .Storage()
                .getMenuPadrePassport(menu.ID_MENU_PADRE);
            if (padre && padre.ID_MENU_PADRE && padre.ID_MENU_PADRE > 0) {
                const padreNivel2 = this.dataService
                    .Storage()
                    .getMenuPadrePassport(padre.ID_MENU_PADRE);
                this.router.navigate([
                    "ayni",
                    "personal",
                    padreNivel2.URL,
                    padre.URL,
                    menu.URL,
                ]);
            } else {
                this.router.navigate(["ayni", "personal", padre.URL, menu.URL]);
            }
        } else {
            this.router.navigate(["ayni", "personal", menu.URL]);
        }
    }

    ngOnDestroy(): void {
        this._mineduConfigService.resetToDefaults();
    }

    toggleSidebar(name): void {
        this._mineduSidebarService.getSidebar(name).toggleOpen();
    }
}
