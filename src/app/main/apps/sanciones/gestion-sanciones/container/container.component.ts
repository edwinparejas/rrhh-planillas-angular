import { Component, OnInit } from '@angular/core';
import { SharedService } from 'app/core/shared/shared.service';

@Component({
  selector: 'minedu-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  constructor(private sharedService: SharedService, ) { }

  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
  }
  buildShared() {
    this.sharedService.setSharedBreadcrumb("Gestión de faltas y sanciones");
    this.sharedService.setSharedTitle("Gestión de faltas y sanciones***");
}
}
