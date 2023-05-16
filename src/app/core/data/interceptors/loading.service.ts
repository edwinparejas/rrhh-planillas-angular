import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loading$ = new BehaviorSubject<boolean>(false);
    loading = this.loading$.asObservable();
    busyRequestCount = 0;

    busy() {
        this.busyRequestCount++;
        if (this.busyRequestCount == 1) {
            this.show();
        }
    }

    idle() {
        this.busyRequestCount--;
        if (this.busyRequestCount <= 0) {
            this.busyRequestCount = 0;
            if (this.busyRequestCount == 0) {
                this.hide();
            }
        }
    }

    show() {
        this.loading$.next(true);
    }

    hide() {
        this.loading$.next(false);
    }
}
