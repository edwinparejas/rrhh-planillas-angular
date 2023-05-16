import { Component, OnInit } from '@angular/core';
import { SharedService } from 'app/core/shared/shared.service';

@Component({
  selector: 'minedu-otras-acciones',
  templateUrl: './otras-acciones.component.html',
  styleUrls: ['./otras-acciones.component.scss']
})
export class OtrasAccionesComponent implements OnInit {

  constructor(private sharedService: SharedService) {
  }

  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
  }

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Otras acciones de personal");
    this.sharedService.setSharedTitle("Realizar otras acciones de personal");
  }
}
