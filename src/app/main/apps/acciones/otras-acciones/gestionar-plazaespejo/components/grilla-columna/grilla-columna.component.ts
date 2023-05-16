import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'minedu-grilla-columna',
  templateUrl: './grilla-columna.component.html',
  styleUrls: ['./grilla-columna.component.scss']
})
export class GrillaColumnaComponent implements OnInit {
  @Input() colDef: any;
  @Input() element: any;
  @Input() template: any;
  @Input() rowIndex: number=0;
  @Input() loading: boolean=false;
//   datetimeDefaultFormat: string = 'DD/MM/YYYY HH:mm:ss';
  datetimeDefaultFormat: string = 'DD/MM/YYYY';
  constructor() { }

  ngOnInit(): void {
      let dd = this.element;
  }

  getProperty = (obj:any, path:any) => {
      return path.split(/(\[|\]|\.)/).reduce((x:any, y:any) => {
	  return "[].".indexOf(y) > -1 ? x : x === Object(x) && y in x ? x[y] : undefined;
      }, obj);
  };

}
