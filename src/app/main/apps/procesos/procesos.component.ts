import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { SharedService } from 'app/core/shared/shared.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'minedu-procesos',
  templateUrl: './procesos.component.html',
  styleUrls: ['./procesos.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ProcesosComponent implements OnInit {

  title: string = "Gestion de procesos";
  breadcrumb: string = "Configuracion";
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
