import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MineduNavigationService } from '@minedu/components/navigation/navigation.service';

@Component({
    selector       : 'minedu-navigation',
    templateUrl    : './navigation.component.html',
    styleUrls      : ['./navigation.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MineduNavigationComponent implements OnInit
{
    @Input()
    layout = 'vertical';

    @Input()
    navigation: any;

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
        this.navigation = this.navigation || this._mineduNavigationService.getCurrentNavigation();

        this._mineduNavigationService.onNavigationChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.navigation = this._mineduNavigationService.getCurrentNavigation();
                this._changeDetectorRef.markForCheck();
            });
        merge(
            this._mineduNavigationService.onNavigationItemAdded,
            this._mineduNavigationService.onNavigationItemUpdated,
            this._mineduNavigationService.onNavigationItemRemoved
        ).pipe(takeUntil(this._unsubscribeAll))
         .subscribe(() => {
             this._changeDetectorRef.markForCheck();
         });
    }
}
