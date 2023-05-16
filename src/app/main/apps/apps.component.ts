import { Component, OnInit, OnDestroy } from "@angular/core";
import { MineduNavigationService } from "@minedu/components/navigation/navigation.service";
import { ConfigService } from "app/config/config.service";
import { DataService } from "app/core/data/data.service";
import { navigation } from "app/navigation/navigation";
import { of, Subject } from "rxjs";
import { SharedService } from "app/core/shared/shared.service";
import { PASSPORT_MESSAGE } from "app/core/model/messages-error";
import { filter, takeUntil, catchError } from "rxjs/operators";

@Component({
    selector: "minedu-apps",
    templateUrl: "./apps.component.html",
    styleUrls: ["./apps.component.scss"],
})
export class AppsComponent implements OnInit, OnDestroy {
    navigation: any;
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _mineduNavigationService: MineduNavigationService,
        private _confiSevice: ConfigService,
        private _dataService: DataService,
        private _sharedService: SharedService
    ) {
        this._unsubscribeAll = new Subject();
        this.navigation = navigation;
        this._mineduNavigationService.register("main", this.navigation);
        this._mineduNavigationService.setCurrentNavigation("main");
        this._sharedService.setDataSharedPersonal(true);
    }

    ngOnInit(): void {
        // this.setNavigation();
        // this._sharedService.dataSharedMenu
        //     .pipe(
        //         filter((value) => {
        //             this.setNavigation();
        //             return value !== null;
        //         }),
        //         takeUntil(this._unsubscribeAll)
        //     )
        //     .subscribe((response: boolean) => {
        //         if (response) {
        //             this.setNavigation();
        //         }
        //     });
    }

    setNavigation() {
        const data = this._dataService.Storage().getCodigoSistema();
        if (data) {
            this._dataService.Passport().boot().pipe(
                catchError(() => of(null))
            ).subscribe((response: any) => {
                if (response) {
                    this.loadNavigation(data, response.Token);
                } else {
                    this._dataService
                        .Message()
                        .msgWarning(
                            "No pudo obtener credenciales de acceso, ud. sera redirigido a la página de inicio de sesión.",
                            () => {
                                this._dataService
                                    .Storage()
                                    .passportUILogin();
                            }
                        );
                }
            });
        }
    }

    loadNavigation(data: any, token: any) {
        const param = this._dataService.Cifrado().PassportEncode(token, data);
        this._dataService
            .Passport()
            .getOperacionesMenu(param)
            .pipe(
                catchError(() => {
                    this._dataService
                        .SnackBar()
                        .msgError(PASSPORT_MESSAGE.BUSCAR_MENU, "Cerrar");
                    return of(null);
                })
            )
            .subscribe((response) => {
                if (response && !response.HasErrors) {
                    const data: any[] = response.Data;
                    this._dataService.Storage().setPassportMenu(data);
                    const menus = this._dataService.Storage().getMenuPassport();
                    this._mineduNavigationService.unregister("main");
                    this.navigation = this._confiSevice.setNavigation(menus);
                    this._mineduNavigationService.register(
                        "main",
                        this.navigation
                    );
                    this._mineduNavigationService.setCurrentNavigation("main");
                    this._sharedService.sendDataSharedLoadRoles(true);
                    this._sharedService.setDataSharedPersonal(true);
                } else {
                    this._dataService
                        .Message()
                        .msgWarning(
                            "No pudo obtener credenciales de acceso, ud. sera redirigido a la página de inicio de sesión.",
                            () => {
                                this._dataService.Storage().passportUILogin();
                            }
                        );
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
