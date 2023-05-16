import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { SharedService } from 'app/core/shared/shared.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'minedu-acciones',
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AccionesComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any>;

  title: string = "Acciones del personal";
  breadcrumb: string = "Vinculación";

  constructor(private sharedService: SharedService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.sharedService.onSharedTitle
      .pipe(
        filter(value => value !== null),
        takeUntil(this._unsubscribeAll)
      ).subscribe(title => this.title = title);

    this.sharedService.onSharedBreadcrumb
      .pipe(
        filter(value => value !== null),
        takeUntil(this._unsubscribeAll)
      ).subscribe(breadcrumb => this.breadcrumb = breadcrumb);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  buildShared() {
    this.sharedService.onSharedTitle
      .pipe(
        filter(value => value !== null),
        takeUntil(this._unsubscribeAll)
      ).subscribe(title => this.title = title);

    this.sharedService.onSharedBreadcrumb
      .pipe(
        filter(value => value !== null),
        takeUntil(this._unsubscribeAll)
      ).subscribe(breadcrumb => this.breadcrumb = breadcrumb);
  }
}
