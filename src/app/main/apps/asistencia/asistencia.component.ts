import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { SharedService } from 'app/core/shared/shared.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'minedu-asistencia',
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AsistenciaComponent implements OnInit {

  title: string = "Asistencia";
  breadcrumb: string = "Asistencia";
  private _unsubscribeAll: Subject<any>;

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

}
