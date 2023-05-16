import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MineduConfigService } from '@minedu/services/config.service';
import { navigation } from 'app/navigation/navigation';

@Component({
    selector     : 'minedu-horizontal-layout',
    templateUrl  : './horizontal-layout.component.html',
    styleUrls    : ['./horizontal-layout.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HorizontalLayoutComponent implements OnInit, OnDestroy
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
