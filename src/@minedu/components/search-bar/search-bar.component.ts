import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MineduConfigService } from '@minedu/services/config.service';

@Component({
    selector   : 'minedu-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls  : ['./search-bar.component.scss']
})
export class MineduSearchBarComponent implements OnInit, OnDestroy
{
    collapsed: boolean;
    mineduConfig: any;

    @Output()
    input: EventEmitter<any>;
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _mineduConfigService: MineduConfigService
    )
    {
        this.input = new EventEmitter();
        this.collapsed = true;
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

    collapse(): void
    {
        this.collapsed = true;
    }

    expand(): void
    {
        this.collapsed = false;
    }

    search(event): void
    {
        this.input.emit(event.target.value);
    }

}
