import { ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MineduNavigationItem } from '@minedu/types/minedu-navigation';
import { MineduNavigationService } from '@minedu/components/navigation/navigation.service';

@Component({
    selector   : 'minedu-nav-vertical-group',
    templateUrl: './group.component.html',
    styleUrls  : ['./group.component.scss']
})
export class MineduNavVerticalGroupComponent implements OnInit, OnDestroy
{
    @HostBinding('class')
    classes = 'nav-group nav-item';

    @Input()
    item: MineduNavigationItem;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _mineduNavigationService: MineduNavigationService
    )
    {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void
    {
        merge(
            this._mineduNavigationService.onNavigationItemAdded,
            this._mineduNavigationService.onNavigationItemUpdated,
            this._mineduNavigationService.onNavigationItemRemoved
        ).pipe(takeUntil(this._unsubscribeAll))
         .subscribe(() => {
             this._changeDetectorRef.markForCheck();
         });
    }

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
