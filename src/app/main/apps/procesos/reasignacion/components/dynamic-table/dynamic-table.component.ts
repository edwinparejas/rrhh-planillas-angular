import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})


export class DynamicTableComponent implements OnInit {

  // dataSource = ELEMENT_DATA;
  @Input() dataSource = "ELEMENT_DATA";

  // columnas = [
  //   { titulo: "Posicion", name: "position" },
  //   { titulo: "Nombre", name: "name" },
  //   { titulo: "Peso", name: "weight" },
  //   { titulo: "Simbolo", name: "symbol" },
  // ];

  @Input() columnas = "columnas";

  displayedColumns = [];

  handleColumns(columnas, displayedColumns): void {

    for (let i in columnas)
      displayedColumns.push(columnas[i].name);
  }


  constructor() { }

  ngOnInit(): void {
    this.handleColumns(this.columnas,this.displayedColumns);
  }

}

// export interface PeriodicElement {
//   name: string;
//   position: number;
//   weight: any;
//   symbol: string;
//   ps: any;
//   cp: string;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   { position: 1, name: "Hydrogen", weight: 5.55, symbol: "H", ps: { name: 5.55 }, cp: "H" },
//   { position: 2, name: "Helium", weight: 5.55, symbol: "He", ps: { name: 5.55 }, cp: "H" },
//   { position: 3, name: "Lithium", weight: 5.55, symbol: "Li", ps: { name: 5.55 }, cp: "H" },
//   { position: 4, name: "Beryllium", weight: 5.55, symbol: "Be", ps: { name: 5.55 }, cp: "H" },
//   { position: 5, name: "Boron", weight: 5.55, symbol: "B", ps: { name: 5.55 }, cp: "H" },
//   { position: 6, name: "Carbon", weight: 5.55, symbol: "C", ps: { name: 5.55 }, cp: "H" },
//   { position: 7, name: "Nitrogen", weight: 5.55, symbol: "N", ps: { name: 5.55 }, cp: "H" },
//   { position: 8, name: "Oxygen", weight: 5.55, symbol: "O", ps: { name: 5.55 }, cp: "H" },
//   { position: 9, name: "Fluorine", weight: 5.55, symbol: "F", ps: { name: 5.55 }, cp: "H" },
//   { position: 10, name: "Neon", weight: 5.55, symbol: "Ne", ps: { name: 5.55 }, cp: "H" },
// ];
