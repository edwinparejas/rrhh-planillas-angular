import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { VacacionesTruncasAnularDataSource } from './DataSource/VacacionesTruncasAnularDataSource';

@Component({
  selector: 'minedu-anular-vacacion-trunca',
  templateUrl: './anular-vacacion-trunca.component.html',
  styleUrls: ['./anular-vacacion-trunca.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularVacacionTruncaComponent implements OnInit {
    @Input() form:FormGroup;
    isMobile=false;
    constructor(
      
        private formBuilder: FormBuilder,
        private dataService: DataService,
      ) { }

  ngOnInit() {
    this.listaVacacionesTruncas = this.form.get('listaVacacionesTruncas').value;
    this.buildGrid();
    this.loadTable();
  }


  /**
    *Seccion vacaciones truncas*/
   dataSource: VacacionesTruncasAnularDataSource | null;
   displayedColumns: string[] = [
      'numero',
      'mesInicioVacacionesTruncas',
      'mesFinVacacionesTruncas',
      'anioVacacionesTruncas',
      'cantidadMeses',
      'importeRemuneracionMensual',
      'importeBeneficio'
  ];
  paginatorPageSize = 5;
  paginatorPageIndex = 0;
  @ViewChild('paginator', { static: true }) 
  paginator: MatPaginator;

  listaVacacionesTruncas = [];
  
    mesDefault =0;
   buildGrid() {
        
        this.dataSource = new VacacionesTruncasAnularDataSource(this.dataService, this.paginator);
        // this.paginator.showFirstLastButtons = true;
        // this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        // this.paginator._intl.nextPageLabel = 'Siguiente página';
        // this.paginator._intl.previousPageLabel = 'Página anterior';
        // this.paginator._intl.firstPageLabel = 'Primera página';
        // this.paginator._intl.lastPageLabel = 'Última página';
    
        // this.paginator._intl.getRangeLabel = function (page, pageSize, length) {
        //   if (length === 0 || pageSize === 0) {
        //     return '0 de ' + length;
        //   }
        //   length = Math.max(length, 0);
        //   const startIndex = page * pageSize;
        //   // If the start index exceeds the list length, do not try ngAfterViewInit fix the end index to the end.
        //   const endIndex = startIndex < length ?
        //     Math.min(startIndex + pageSize, length) :
        //     startIndex + pageSize;
        //   return startIndex + 1 + ' - ' + endIndex + ' de ' + length;
        // }; 
      }

      loadTable = (fistTime: boolean = false) => {
        this.setListaVacacionesTruncas();
        if (fistTime) {
          this.dataSource.load(this.listaVacacionesTruncas, 1, 10,fistTime);
        }
        else {
          this.dataSource.load(
            this.listaVacacionesTruncas,
            1,//this.paginator.pageIndex + 1,
            10,//this.paginator.pageSize,
            fistTime
          );
        }
      }
    setListaVacacionesTruncas = () => {
        
        let numero = 1;
        this.listaVacacionesTruncas.forEach(element => {
            element.numero=numero;
            element.mesInicioTexto = this.getMest(element.mesInicioVacacionesTruncas);
            element.mesFinTexto = this.getMest(element.mesFinVacacionesTruncas);
            numero++;
        });

  }
  
  getMest(numero){
      var Meses= ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULION','AGOSTO','SETIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
      return Meses[numero-1]
  }
  
 
}
