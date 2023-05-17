import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ModalHaberesDescuentosComponent } from '../planilla-haberes/modal-haberes-descuentos/modal-haberes-descuentos.component';
import { ModalAfpComponent } from './modal-afp/modal-afp.component';

@Component({
  selector: 'minedu-planilla-afp',
  templateUrl: './planilla-afp.component.html',
  styleUrls: ['./planilla-afp.component.scss']
})
export class PlanillaAfpComponent implements OnInit {


    export: boolean = false;
    working: boolean = false;
    tiempoMensaje: number = 3000;



    displayedColumns: string[] = [
        'index',
        'sistema',
        'codigo_afp',
        'descripcion_afp',
        'ruc',
        'telefono',
        'departamento',
        'direccion',
        'estado',
        'motivo_anulacion',
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
  constructor(private materialDialog: MatDialog) {
    
   }

   ngOnInit(): void {
    this.defaultGrid();
  }
  ngAfterViewInit() {
    this.cargarGrilla();
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
    this.dialogRef = this.materialDialog.open(ModalAfpComponent, {
        panelClass: 'minedu-modal-afp',
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
        "sistema": "sistema privado pensiones",
        "codigo_afp": "50-939-8270",
        "descripcion_afp": "afp integra",
        "ruc": "9282184285",
        "telefono": "(420) 3704772",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "49-920-4636",
        "descripcion_afp": "afp profuturo",
        "ruc": "1018162445",
        "telefono": "(485) 7154896",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "57-241-7931",
        "descripcion_afp": "afp integra",
        "ruc": "7506963701",
        "telefono": "(791) 2640619",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "30-539-4888",
        "descripcion_afp": "afp profuturo",
        "ruc": "8197831939",
        "telefono": "(734) 7946671",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "63-365-3860",
        "descripcion_afp": "afp profuturo",
        "ruc": "1866061062",
        "telefono": "(339) 3067357",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "24-596-2443",
        "descripcion_afp": "afp integra",
        "ruc": "8301664789",
        "telefono": "(978) 9684486",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "38-574-6988",
        "descripcion_afp": "afp integra",
        "ruc": "0709344074",
        "telefono": "(564) 8485425",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "81-860-8174",
        "descripcion_afp": "afp profuturo",
        "ruc": "3372645685",
        "telefono": "(687) 1543537",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "62-226-2462",
        "descripcion_afp": "afp integra",
        "ruc": "1481273108",
        "telefono": "(455) 6355127",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "47-637-7768",
        "descripcion_afp": "afp integra",
        "ruc": "9011272757",
        "telefono": "(544) 7948830",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "11-873-9929",
        "descripcion_afp": "afp integra",
        "ruc": "4957231184",
        "telefono": "(723) 3231265",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "19-763-5719",
        "descripcion_afp": "afp profuturo",
        "ruc": "9875961086",
        "telefono": "(362) 3978203",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "36-769-8767",
        "descripcion_afp": "afp profuturo",
        "ruc": "3850636089",
        "telefono": "(388) 9334102",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "45-390-6797",
        "descripcion_afp": "afp profuturo",
        "ruc": "6500361393",
        "telefono": "(124) 6429370",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "10-656-6958",
        "descripcion_afp": "afp profuturo",
        "ruc": "2406764400",
        "telefono": "(480) 3721278",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "88-449-1158",
        "descripcion_afp": "afp integra",
        "ruc": "0581120191",
        "telefono": "(140) 3945338",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "65-446-4457",
        "descripcion_afp": "afp profuturo",
        "ruc": "9634568769",
        "telefono": "(844) 8068912",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "05-618-3158",
        "descripcion_afp": "afp integra",
        "ruc": "2226425845",
        "telefono": "(810) 9670140",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "38-737-3119",
        "descripcion_afp": "afp integra",
        "ruc": "7723387075",
        "telefono": "(663) 7080130",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "90-504-9188",
        "descripcion_afp": "afp profuturo",
        "ruc": "2878210093",
        "telefono": "(121) 3878954",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "34-890-7582",
        "descripcion_afp": "afp profuturo",
        "ruc": "1162052279",
        "telefono": "(924) 3884503",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "56-706-5008",
        "descripcion_afp": "afp integra",
        "ruc": "2387129180",
        "telefono": "(266) 1952604",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "89-661-4459",
        "descripcion_afp": "afp profuturo",
        "ruc": "0798730021",
        "telefono": "(209) 1558149",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "47-132-0782",
        "descripcion_afp": "afp profuturo",
        "ruc": "8985564838",
        "telefono": "(971) 5489700",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "42-083-4876",
        "descripcion_afp": "afp profuturo",
        "ruc": "2189793114",
        "telefono": "(739) 2541026",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "81-755-8890",
        "descripcion_afp": "afp integra",
        "ruc": "7782091535",
        "telefono": "(375) 2258238",
        "departamento": "Lima",
        "direccion": "",
        "estado": false,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "95-710-4698",
        "descripcion_afp": "afp profuturo",
        "ruc": "6238735856",
        "telefono": "(580) 5226858",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "48-350-3548",
        "descripcion_afp": "afp profuturo",
        "ruc": "0310159091",
        "telefono": "(196) 1740780",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "66-177-3027",
        "descripcion_afp": "afp profuturo",
        "ruc": "1782404325",
        "telefono": "(802) 7345051",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }, {
        "sistema": "sistema privado pensiones",
        "codigo_afp": "21-544-2398",
        "descripcion_afp": "afp integra",
        "ruc": "0285618628",
        "telefono": "(267) 5208639",
        "departamento": "Lima",
        "direccion": "",
        "estado": true,
        "motivo_anulacion": ""
      }];
      this.dataSource = new MatTableDataSource(dataDemo);
      this.dataSource.paginator=this.paginator;
    // this.dataSource.load(dataDemo, (this.paginator.pageIndex + 1), this.paginator.pageSize, false);
}

}
