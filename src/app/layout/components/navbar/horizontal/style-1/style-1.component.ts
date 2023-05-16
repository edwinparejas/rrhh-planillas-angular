import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { MineduConfigService } from '@minedu/services/config.service';
import { MineduNavigationService } from '@minedu/components/navigation/navigation.service';
import { MineduSidebarService } from '@minedu/components/sidebar/sidebar.service';

@Component({
    selector     : 'navbar-horizontal-style-1',
    templateUrl  : './style-1.component.html',
    styleUrls    : ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarHorizontalStyle1Component implements OnInit, OnDestroy
{
    mineduConfig: any;
    navigation: any;

    private _unsubscribeAll: Subject<any>;
    
    constructor(
        private _mineduConfigService: MineduConfigService,
        private _mineduNavigationService: MineduNavigationService,
        private _mineduSidebarService: MineduSidebarService
    )
    {
        this._unsubscribeAll = new Subject();
    }

   
    ngOnInit(): void
    {
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
}
