import { Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { mineduAnimations } from '@minedu/animations/animations';
import { MineduConfigService } from '@minedu/services/config.service';

@Component({
    selector   : 'minedu-nav-horizontal-collapsable',
    templateUrl: './collapsable.component.html',
    styleUrls  : ['./collapsable.component.scss'],
    animations : mineduAnimations
})
export class MineduNavHorizontalCollapsableComponent implements OnInit, OnDestroy
{
    mineduConfig: any;
    isOpen = false;

    @HostBinding('class')
    classes = 'nav-collapsable nav-item';

    @Input()
    item: any;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _mineduConfigService: MineduConfigService
    )
    {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void
    {
        this._mineduConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (config) => {
                    this.mineduConfig = config;
                }
            );
    }

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    
    @HostListener('mouseenter')
    open(): void
    {
        this.isOpen = true;
    }

    @HostListener('mouseleave')
    close(): void
    {
        this.isOpen = false;
    }
}
