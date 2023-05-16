import { ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MineduNavigationItem } from '@minedu/types/minedu-navigation';
import { MineduNavigationService } from '@minedu/components/navigation/navigation.service';
import { LocalStorageService } from '@minedu/services/secure/local-storage.service';

@Component({
    selector: 'minedu-nav-vertical-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})
export class MineduNavVerticalItemComponent implements OnInit, OnDestroy {
    @HostBinding('class')
    classes = 'nav-item';

    @Input()
    item: MineduNavigationItem;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _mineduNavigationService: MineduNavigationService,
        private _localStorageService: LocalStorageService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        merge(
            this._mineduNavigationService.onNavigationItemAdded,
            this._mineduNavigationService.onNavigationItemUpdated,
            this._mineduNavigationService.onNavigationItemRemoved
        ).pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    setMenu(item: MineduNavigationItem) {
        this._localStorageService.setItem("passport_menu_selected", JSON.stringify(item));
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
