import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';
import { ProcesosDataSource } from 'app/main/apps/gestion/gestion-proceso.component';
import { tap } from 'rxjs/operators';
import { ModalHaberesDescuentosComponent } from './modal-haberes-descuentos/modal-haberes-descuentos.component';

@Component({
  selector: 'minedu-planilla-haberes',
  templateUrl: './planilla-haberes.component.html',
  styleUrls: ['./planilla-haberes.component.scss']
})
export class PlanillaHaberesComponent implements OnInit,AfterViewInit {

    form: FormGroup;
    export: boolean = false;
    working: boolean = false;
    tiempoMensaje: number = 3000;

    max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    displayedColumns: string[] = [
        'index',
        'concepto',
        'descripcion_concepto',
        'tipo_pago',
        'grupo_calculo',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'opciones'
      ];

      permisoGeneral: any;

      dataSource=new MatTableDataSource();

      combo = {
        regimenesLaborales: [],
        estadosProceso: [],
        tiposProceso: [],
        procesos: []
      }

      @ViewChild(MatPaginator, { static: true })
      paginator: MatPaginator;

      dialogRef: any;
  constructor(    private formBuilder: FormBuilder,private materialDialog: MatDialog) {
    
   }

  ngOnInit(): void {
    this.buildForm();
    this.defaultGrid();
  }
  ngAfterViewInit() {
    this.cargarGrilla();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idRegimenLaboral: [null],
      idTipoConcepto: [null],
      idTipoPago: [null],
      idGrupoCalculo: [null],
      idTipoCalculo: [null],
    });

    // this.form.get("fechaConfiguracion").valueChanges.subscribe(value => {
    //   this.form.patchValue({ anio: value?.getFullYear() });
    // });
    
    // this.form.get("idTipoProceso").valueChanges.subscribe(value => {
    //   this.combo.procesos = [];
    //   this.form.patchValue({ idDescripcionMaestroProceso: "-1" });
    //   if (value && value > 0 ) {
    //     this.form.get('idDescripcionMaestroProceso').enable();
    //     this.defaultComboProcesos(value);
    //   } else
    //     this.form.get('idDescripcionMaestroProceso').disable();
    // });
  }

  defaultGrid() {

    this.buildPaginators(this.paginator);
  }

  buildPaginators(paginator: MatPaginator): void {
    paginator.showFirstLastButtons = true;
    paginator._intl.itemsPerPageLabel = "Registros por página";
    paginator._intl.nextPageLabel = "Siguiente página";
    paginator._intl.previousPageLabel = "Página anterior";
    paginator._intl.firstPageLabel = "Primera página";
    paginator._intl.lastPageLabel = "Última página";
    paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
        const length2 = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
        return `${startIndex + 1} – ${endIndex} de ${length2}`;
    }
}

  handleCrear():void{
    this.dialogRef = this.materialDialog.open(ModalHaberesDescuentosComponent, {
        panelClass: 'minedu-modal-haberes-descuentos',
        disableClose: true,
        data: {
          modal: {
            icon: "save",
            title: "Nuevo miembro de comité",
            action: "create",
            disabled: false
          },
        }
      });
  }

  handleExportar():void{}

  handleBuscar():void{}

  handleLimpiar():void{}

  cargarGrilla(autoSearch: boolean = false) {
    let dataDemo=[{
        "concepto": "134192960-4",
        "descripcion_concepto": "Sales",
        "tipo_pago": "ocasional",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "23/09/2022",
        "fecha_fin": "08/12/2022",
        "estado": false
      }, {
        "concepto": "082688789-9",
        "descripcion_concepto": "Product Management",
        "tipo_pago": "ocasional",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "10/04/2023",
        "fecha_fin": "02/11/2022",
        "estado": true
      }, {
        "concepto": "809647566-5",
        "descripcion_concepto": "Sales",
        "tipo_pago": "ordinario",
        "grupo_calculo": "salida",
        "fecha_inicio": "18/06/2022",
        "fecha_fin": "21/07/2022",
        "estado": true
      }, {
        "concepto": "951086997-X",
        "descripcion_concepto": "Accounting",
        "tipo_pago": "ordinario",
        "grupo_calculo": "salida",
        "fecha_inicio": "12/07/2022",
        "fecha_fin": "12/12/2022",
        "estado": true
      }, {
        "concepto": "814575718-5",
        "descripcion_concepto": "Engineering",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "21/01/2023",
        "fecha_fin": "17/02/2023",
        "estado": true
      }, {
        "concepto": "845040753-2",
        "descripcion_concepto": "Support",
        "tipo_pago": "ocasional",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "23/08/2022",
        "fecha_fin": "14/09/2022",
        "estado": false
      }, {
        "concepto": "185005527-0",
        "descripcion_concepto": "Services",
        "tipo_pago": "ocasional",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "18/05/2022",
        "fecha_fin": "06/04/2023",
        "estado": true
      }, {
        "concepto": "579507935-9",
        "descripcion_concepto": "Support",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "31/12/2022",
        "fecha_fin": "03/11/2022",
        "estado": false
      }, {
        "concepto": "199157616-1",
        "descripcion_concepto": "Services",
        "tipo_pago": "ordinario",
        "grupo_calculo": "salida",
        "fecha_inicio": "23/08/2022",
        "fecha_fin": "12/12/2022",
        "estado": true
      }, {
        "concepto": "063022589-3",
        "descripcion_concepto": "Research and Development",
        "tipo_pago": "ocasional",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "16/02/2023",
        "fecha_fin": "07/08/2022",
        "estado": true
      }, {
        "concepto": "846279725-X",
        "descripcion_concepto": "Legal",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "22/11/2022",
        "fecha_fin": "08/05/2023",
        "estado": false
      }, {
        "concepto": "810210853-3",
        "descripcion_concepto": "Engineering",
        "tipo_pago": "ordinario",
        "grupo_calculo": "salida",
        "fecha_inicio": "10/08/2022",
        "fecha_fin": "27/12/2022",
        "estado": true
      }, {
        "concepto": "074136532-4",
        "descripcion_concepto": "Human Resources",
        "tipo_pago": "ordinario",
        "grupo_calculo": "salida",
        "fecha_inicio": "04/12/2022",
        "fecha_fin": "24/03/2023",
        "estado": true
      }, {
        "concepto": "873933796-0",
        "descripcion_concepto": "Research and Development",
        "tipo_pago": "ordinario",
        "grupo_calculo": "salida",
        "fecha_inicio": "04/01/2023",
        "fecha_fin": "14/06/2022",
        "estado": true
      }, {
        "concepto": "996219271-4",
        "descripcion_concepto": "Human Resources",
        "tipo_pago": "ocasional",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "27/02/2023",
        "fecha_fin": "16/10/2022",
        "estado": false
      }, {
        "concepto": "563288938-6",
        "descripcion_concepto": "Support",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "27/09/2022",
        "fecha_fin": "13/10/2022",
        "estado": true
      }, {
        "concepto": "599292105-2",
        "descripcion_concepto": "Sales",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "07/04/2023",
        "fecha_fin": "11/09/2022",
        "estado": true
      }, {
        "concepto": "403485697-1",
        "descripcion_concepto": "Research and Development",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "18/07/2022",
        "fecha_fin": "26/02/2023",
        "estado": false
      }, {
        "concepto": "338496814-X",
        "descripcion_concepto": "Accounting",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "28/06/2022",
        "fecha_fin": "09/05/2023",
        "estado": true
      }, {
        "concepto": "931596389-X",
        "descripcion_concepto": "Human Resources",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "28/11/2022",
        "fecha_fin": "14/06/2022",
        "estado": true
      }, {
        "concepto": "738306756-8",
        "descripcion_concepto": "Research and Development",
        "tipo_pago": "ordinario",
        "grupo_calculo": "salida",
        "fecha_inicio": "03/08/2022",
        "fecha_fin": "10/09/2022",
        "estado": true
      }, {
        "concepto": "049211952-X",
        "descripcion_concepto": "Engineering",
        "tipo_pago": "ocasional",
        "grupo_calculo": "salida",
        "fecha_inicio": "27/02/2023",
        "fecha_fin": "03/11/2022",
        "estado": true
      }, {
        "concepto": "302122098-3",
        "descripcion_concepto": "Human Resources",
        "tipo_pago": "ordinario",
        "grupo_calculo": "salida",
        "fecha_inicio": "24/06/2022",
        "fecha_fin": "19/08/2022",
        "estado": true
      }, {
        "concepto": "458724709-X",
        "descripcion_concepto": "Sales",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "10/01/2023",
        "fecha_fin": "18/02/2023",
        "estado": false
      }, {
        "concepto": "772519261-1",
        "descripcion_concepto": "Business Development",
        "tipo_pago": "ocasional",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "17/04/2023",
        "fecha_fin": "26/10/2022",
        "estado": false
      }, {
        "concepto": "622887907-3",
        "descripcion_concepto": "Support",
        "tipo_pago": "ordinario",
        "grupo_calculo": "ingreso",
        "fecha_inicio": "04/05/2023",
        "fecha_fin": "10/03/2023",
        "estado": true
      }, {
        "concepto": "690476822-3",
        "descripcion_concepto": "Accounting",
        "tipo_pago": "ordinario",
        "grupo_calculo": "salida",
        "fecha_inicio": "21/12/2022",
        "fecha_fin": "15/05/2023",
        "estado": false
      }, {
        "concepto": "196244384-1",
        "descripcion_concepto": "Accounting",
        "tipo_pago": "ocasional",
        "grupo_calculo": "salida",
        "fecha_inicio": "26/12/2022",
        "fecha_fin": "21/11/2022",
        "estado": false
      }, {
        "concepto": "058879570-4",
        "descripcion_concepto": "Accounting",
        "tipo_pago": "ocasional",
        "grupo_calculo": "salida",
        "fecha_inicio": "15/08/2022",
        "fecha_fin": "05/08/2022",
        "estado": false
      }, {
        "concepto": "277098329-6",
        "descripcion_concepto": "Accounting",
        "tipo_pago": "ocasional",
        "grupo_calculo": "salida",
        "fecha_inicio": "15/03/2023",
        "fecha_fin": "28/04/2023",
        "estado": false
      }];
      this.dataSource = new MatTableDataSource(dataDemo);
      this.dataSource.paginator=this.paginator;
    // this.dataSource.load(dataDemo, (this.paginator.pageIndex + 1), this.paginator.pageSize, false);
}

}


