import { Directive, Input, OnInit, HostListener, OnDestroy, HostBinding } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MediaObserver } from '@angular/flex-layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MineduMatchMediaService } from '@minedu/services/match-media.service';
import { MineduMatSidenavHelperService } from '@minedu/directives/minedu-mat-sidenav/minedu-mat-sidenav.service';

@Directive({
    selector: '[mineduMatSidenavHelper]'
})
export class MineduMatSidenavHelperDirective implements OnInit, OnDestroy
{
    @HostBinding('class.mat-is-locked-open')
    isLockedOpen: boolean;

    @Input()
    mineduMatSidenavHelper: string;

    @Input()
    matIsLockedOpen: string;

    private _unsubscribeAll: Subject<any>;
   
    constructor(
        private _mineduMatchMediaService: MineduMatchMediaService,
        private _mineduMatSidenavHelperService: MineduMatSidenavHelperService,
        private _matSidenav: MatSidenav,
        private _mediaObserver: MediaObserver
    )
    {
        this.isLockedOpen = true;
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void
    {
        this._mineduMatSidenavHelperService.setSidenav(this.mineduMatSidenavHelper, this._matSidenav);

        if ( this.matIsLockedOpen && this._mediaObserver.isActive(this.matIsLockedOpen) )
        {
            this.isLockedOpen = true;
            this._matSidenav.mode = 'side';
            this._matSidenav.toggle(true);
        }
        else
        {
            this.isLockedOpen = false;
            this._matSidenav.mode = 'over';
            this._matSidenav.toggle(false);
        }

        this._mineduMatchMediaService.onMediaChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                if ( this.matIsLockedOpen && this._mediaObserver.isActive(this.matIsLockedOpen) )
                {
                    this.isLockedOpen = true;
                    this._matSidenav.mode = 'side';
                    this._matSidenav.toggle(true);
                }
                else
                {
                    this.isLockedOpen = false;
                    this._matSidenav.mode = 'over';
                    this._matSidenav.toggle(false);
                }
            });
    }

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

@Directive({
    selector: '[mineduMatSidenavToggler]'
})
export class MineduMatSidenavTogglerDirective
{
    @Input()
    mineduMatSidenavToggler: string;

    constructor(
        private _mineduMatSidenavHelperService: MineduMatSidenavHelperService)
    {
    }

    @HostListener('click')
    onClick(): void
    {
        this._mineduMatSidenavHelperService.getSidenav(this.mineduMatSidenavToggler).toggle();
    }
}
