import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-reasignacion-mat-table',
  templateUrl: './reasignacion-mat-table.component.html',
  styleUrls: ['./reasignacion-mat-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})


export class ReasignacionMatTableComponent implements OnInit {

  @Input() dataSource = "ELEMENT_DATA";
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



// import { SelectionModel } from '@angular/cdk/collections';
// import { HttpClient } from '@angular/common/http';
// import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatSort } from '@angular/material/sort';
// import { TableButtonAction } from '../../../models/tableButtonAction';
// import { TableColumn } from '../../../models/tableColumn';


// @Component({
//   selector: 'minedu-reasignacion-mat-table',
//   templateUrl: './reasignacion-mat-table.component.html',
  
//   styleUrls: ['./reasignacion-mat-table.component.scss']

// })
// export class ReasignacionMatTableComponent implements OnInit {

//     @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
//     @Output() action: EventEmitter<TableButtonAction> = new EventEmitter<TableButtonAction>()
//     @Input() columns: Array<TableColumn>;
//     @Input() dataset: Array<any> = [];
//     @ViewChild(MatSort, { static: true }) sort: MatSort;
//     dataSource: MatTableDataSource<any>;
//     selection = new SelectionModel<any>(true, []);
//     displayedColumns: string[] = [];
//     value: string;    
  
//     constructor() { }

//     ngOnInit() {
//         // set checkbox column
//         this.displayedColumns.push("select");
    
//         // set table columns
//         this.displayedColumns = this.displayedColumns.concat(this.columns.map(x => x.columnDef));    // pre-fix static
    
//         // add action column
//         this.displayedColumns.push("action");
//         this.dataSource = new MatTableDataSource<any>(this.dataset);
    
//         // set pagination
//         this.dataSource.paginator = this.paginator;
//       }
     
//     onTableAction(e: TableButtonAction): void {
//         this.action.emit(e)
//     }
      
//     isAllSelected() {
//         const numSelected = this.selection.selected.length;
//         const numRows = this.dataSource.data.length;
//         return numSelected === numRows;
//     }

//     masterToggle() {
//         this.isAllSelected() ?
//           this.selection.clear() :
//           this.dataSource.data.forEach(row => this.selection.select(row));
//     }
//     ngAfterViewInit() {
//         this.dataSource.sort = this.sort;
//     }
//     applyFilter(event: Event) {
//         const filterValue = (event.target as HTMLInputElement).value;
//         this.dataSource.filter = filterValue.trim().toLowerCase();
//       }
// }
