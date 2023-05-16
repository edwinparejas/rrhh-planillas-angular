import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';

import { MineduConfigService } from '@minedu/services/config.service';
import { MineduNavigationService } from '@minedu/components/navigation/navigation.service';
import { MineduPerfectScrollbarDirective } from '@minedu/directives/minedu-perfect-scrollbar/minedu-perfect-scrollbar.directive';
import { MineduSidebarService } from '@minedu/components/sidebar/sidebar.service';

@Component({
    selector     : 'navbar-vertical-style-2',
    templateUrl  : './style-2.component.html',
    styleUrls    : ['./style-2.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalStyle2Component implements OnInit, OnDestroy
{
    mineduConfig: any;
    navigation: any;

    private _mineduPerfectScrollbar: MineduPerfectScrollbarDirective;
    private _unsubscribeAll: Subject<any>;
   
    constructor(
        private _mineduConfigService: MineduConfigService,
        private _mineduNavigationService: MineduNavigationService,
        private _mineduSidebarService: MineduSidebarService,
        private _router: Router
    )
    {
        this._unsubscribeAll = new Subject();
    }

    @ViewChild(MineduPerfectScrollbarDirective, {static: true})
    set directive(theDirective: MineduPerfectScrollbarDirective)
    {
        if ( !theDirective )
        {
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

    ngOnInit(): void
    {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                    if ( this._mineduSidebarService.getSidebar('navbar') )
                    {
                        this._mineduSidebarService.getSidebar('navbar').close();
                    }
                }
            );

        this._mineduNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._mineduNavigationService.getCurrentNavigation();
            });

        this._mineduConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.mineduConfig = config;
            });
    }

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    toggleSidebarOpened(): void
    {
        this._mineduSidebarService.getSidebar('navbar').toggleOpen();
    }

    toggleSidebarFolded(): void
    {
        this._mineduSidebarService.getSidebar('navbar').toggleFold();
    }
}
