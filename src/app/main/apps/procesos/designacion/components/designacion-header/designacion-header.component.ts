import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'minedu-designacion-header',
  templateUrl: './designacion-header.component.html',
  styleUrls: ['./designacion-header.component.scss']
})
export class DesignacionHeaderComponent implements OnInit {

  @Input()
  mineduForm: any = {};

  constructor() { }

  ngOnInit(): void {
  }
}
