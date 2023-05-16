import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, delay, filter, finalize, take, takeUntil } from 'rxjs/operators';

import { MineduConfigService } from '@minedu/services/config.service';
import { MineduNavigationService } from '@minedu/components/navigation/navigation.service';
import { MineduPerfectScrollbarDirective } from '@minedu/directives/minedu-perfect-scrollbar/minedu-perfect-scrollbar.directive';
import { MineduSidebarService } from '@minedu/components/sidebar/sidebar.service';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { DOCUMENTO_MESSAGE } from 'app/core/model/messages-error';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'navbar-vertical-style-1',
    templateUrl: './style-1.component.html',
    styleUrls: ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalStyle1Component implements OnInit, OnDestroy {
    mineduConfig: any;
    navigation: any;

    data: any = null;
    imageurl: any = null;
    rolSelected: any = null;
    menuOpen = false;
    giro = '180';

    private _mineduPerfectScrollbar: MineduPerfectScrollbarDirective;
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _mineduConfigService: MineduConfigService,
        private _mineduNavigationService: MineduNavigationService,
        private _mineduSidebarService: MineduSidebarService,
        private _router: Router,
        private _sanitizer: DomSanitizer,
        private _dataService: DataService,
        private _dataShared: SharedService
    ) {
        this._unsubscribeAll = new Subject();
    }


    @ViewChild(MineduPerfectScrollbarDirective, { static: true })
    set directive(theDirective: MineduPerfectScrollbarDirective) {
        if (!theDirective) {
            return;
        }

        this._mineduPerfectScrollbar = theDirective;

        this._mineduNavigationService.onItemCollapseToggled
            .pipe(
                delay(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._mineduPerfectScrollbar.update();
            });

        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe(() => {
                setTimeout(() => {
                    this._mineduPerfectScrollbar.scrollToElement('navbar .nav-link.active', -120);
                });
            }
            );
    }

    ngOnInit(): void {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                if (this._mineduSidebarService.getSidebar('navbar')) {
                    this._mineduSidebarService.getSidebar('navbar').close();
                }
            }
            );

        this._mineduConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.mineduConfig = config;
            });

        this._mineduNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._mineduNavigationService.getCurrentNavigation();
            });
        this._dataShared.dataSharedLoadRoles
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((d) => {
                this.data = this._dataService.Storage().getPassportUserData();               
                this.rolSelected = this._dataService.Storage().getPassportRolSelected();
               // this.buildImage();
            });
    }


    buildImage() {
        this._dataShared.onDataSharedImageLoaded
            .pipe(
                filter(value => {
                    if (!value) {
                        this.findProfileImage();
                    }
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((loaded) => {
                if (!loaded) {
                    this.findProfileImage();
                }
            });
    }

    findProfileImage() {
        this._dataService.Documento().descargar('').pipe(
            catchError(() => { this._dataService.SnackBar().msgError(DOCUMENTO_MESSAGE.IMAGE_PREVIEW, 'Cerrar'); return of(null) }),
            finalize(() => { this._dataShared.setDataSharedImageLoaded(true); })
        ).subscribe(response => {
            if (response) {
                const base64 = this.toBase64(response);
                this.imageurl = this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64);
                this._dataShared.setDataSharedImage(this.imageurl);
            }
        });
    }

    toBase64(buffer) {
        let TYPED_ARRAY = new Uint8Array(buffer);
        const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => { return data + String.fromCharCode(byte); }, '');
        let base64String = btoa(STRING_CHAR);
        return base64String;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    toggleSidebarOpened(): void {
        this._mineduSidebarService.getSidebar('navbar').toggleOpen();
    }

    toggleSidebarFolded(): void {
        this.menuOpen = !this.menuOpen;
        this.giro = this.menuOpen ? '0' : '180';    
        this._mineduSidebarService.getSidebar('navbar').toggleFold();
    }
}
