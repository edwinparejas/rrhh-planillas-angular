import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MineduConfigService } from '@minedu/services/config.service';
import { MineduNavigationService } from '@minedu/components/navigation/navigation.service';
import { MineduSidebarService } from '@minedu/components/sidebar/sidebar.service';
import { MineduSplashScreenService } from '@minedu/services/splash-screen.service';


@Component({
    selector: 'minedu',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    mineduConfig: any;

    private _unsubscribeAll: Subject<any>;

    constructor(
        @Inject(DOCUMENT) private document: any,
        private _mineduConfigService: MineduConfigService,
        private _mineduSidebarService: MineduSidebarService,
        private _mineduSplashScreenService: MineduSplashScreenService,
        private _platform: Platform
    ) {
        if (this._platform.ANDROID || this._platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this._mineduConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.mineduConfig = config;
                if (this.mineduConfig.layout.width === 'boxed') {
                    this.document.body.classList.add('boxed');
                }
                else {
                    this.document.body.classList.remove('boxed');
                }

                for (let i = 0; i < this.document.body.classList.length; i++) {
                    const className = this.document.body.classList[i];
                    if (className.startsWith('theme-')) {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.mineduConfig.colorTheme);
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    toggleSidebarOpen(key): void {
        this._mineduSidebarService.getSidebar(key).toggleOpen();
    }
}
