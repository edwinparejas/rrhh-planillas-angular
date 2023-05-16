//import { Subject } from 'rxjs/Subject';

import { Subject } from "rxjs";

export function TakeUntilDestroy(constructor: any) {
    let originalDestroy = constructor.prototype.ngOnDestroy;

    if (typeof originalDestroy !== "function") {
        console.warn(
            `${constructor.name} esta usando @TakeUntilDestroy pero no implementa OnDestroy`
        );
        console.error(`Debes implementar el metodo OnDestroy`);
    }

    constructor.prototype.unsubscribe = function () {
        this._takeUntilDestroy$ = this._takeUntilDestroy$ || new Subject();
        return this._takeUntilDestroy$.asObservable();
    };

    constructor.prototype.ngOnDestroy = function () {
        console.log(this._takeUntilDestroy$);
        originalDestroy &&
            typeof originalDestroy === "function" &&
            originalDestroy.apply(this, arguments);
        this._takeUntilDestroy$ &&
            this._takeUntilDestroy$.next() &&
            this._takeUntilDestroy$.complete();
    };
}
