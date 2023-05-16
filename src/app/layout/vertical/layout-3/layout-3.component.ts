import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MineduConfigService } from '@minedu/services/config.service';
import { navigation } from 'app/navigation/navigation';

@Component({
    selector     : 'minedu-vertical-layout-3',
    templateUrl  : './layout-3.component.html',
    styleUrls    : ['./layout-3.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VerticalLayout3Component implements OnInit, OnDestroy
{
    mineduConfig: any;
    navigation: any;

    private _unsubscribeAll: Subject<any>;
  
    constructor(
        private _mineduConfigService: MineduConfigService
    )
    {
        this.navigation = navigation;
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void
    {
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
