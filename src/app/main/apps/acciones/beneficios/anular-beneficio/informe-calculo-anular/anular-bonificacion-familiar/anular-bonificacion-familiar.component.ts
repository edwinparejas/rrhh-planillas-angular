import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { BonificacionFamiliarAnularDataSource } from './DataSource/BonificacionFamiliarAnularDataSource';

@Component({
  selector: 'minedu-anular-bonificacion-familiar',
  templateUrl: './anular-bonificacion-familiar.component.html',
  styleUrls: ['./anular-bonificacion-familiar.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularBonificacionFamiliarComponent implements OnInit {
    @Input() form:FormGroup;
    disabled:boolean = true;
    dialogRef: any;
    isMobile = false;
    dataSource: BonificacionFamiliarAnularDataSource | null;
     displayedColumns: string[] = [
        'numero',
        'parentesco',
        'tipoDocumento',
        'documento',
        'estadoRENIEC',
        'nombres',
        'fechaNacimiento',
        'fechaVigenciaBonificacion',
        'importeBeneficio',
    ];
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @ViewChild('divpaginator') divpaginator: ElementRef;
    firstLoadTable = false;
    listaBeneficiarios = [];
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService
    ) {

     }

  ngOnInit() {
    this.listaBeneficiarios = this.form.get('listaBonificacionFamiliar').value;
    this.buildGrid();
    this.loadTable(); 
  }
  buildGrid() {
        
    this.dataSource = new BonificacionFamiliarAnularDataSource(this.dataService, this.paginator);
    // this.paginator.showFirstLastButtons = true;
    // this.paginator._intl.itemsPerPageLabel = "Registros por página";
    // this.paginator._intl.nextPageLabel = "Siguiente página";
    // this.paginator._intl.previousPageLabel = "Página anterior";
    // this.paginator._intl.firstPageLabel = "Primera página";
    // this.paginator._intl.lastPageLabel = "Última página";
    // this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    //     if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
    //     const length2 = Math.max(length, 0);
    //     const startIndex = page * pageSize;
    //     const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
    //     return `${startIndex + 1} – ${endIndex} de ${length2}`;
    // }
  }
  loadTable = (fistTime: boolean = false) => {
    //this.setListaBeneficiarios();
    if (fistTime) {
      this.dataSource.load(this.listaBeneficiarios, 1, 5,fistTime);
    }
    else {
      this.dataSource.load(
        this.listaBeneficiarios,
        1,//this.paginator.pageIndex + 1,
        10,//this.paginator.pageSize,
        fistTime
      );
    }
  }
}
