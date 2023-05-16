import { Component, OnInit, ViewEncapsulation, Input, ChangeDetectionStrategy, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BehaviorSubject, Observable, of } from "rxjs";
import { TipoIncidenciaEnum, TipoRegistroEnum } from "../_utils/enum";
import { mineduAnimations } from "@minedu/animations/animations";
import { SelectionModel } from "@angular/cdk/collections";
import { FormGroup, FormBuilder, Validators, NumberValueAccessor } from '@angular/forms';
import * as moment from "moment";
import { MessageService } from 'app/core/data/services/message.service';
import { CentroTrabajoModel } from "app/core/model/centro-trabajo.model";
import { SecurityModel } from "app/core/model/security/security.model";
import { ServidorPublicoModel } from "../models/control-asistencia.model";
import { AsistenciaServidorModel } from "../../reporte-asistencia/pages/reporte-consolidado-mensual/store/reporte-consolidado-mensual.model";
import { MatTableDataSource } from "@angular/material/table";
import { DataService } from "app/core/data/data.service";
import { TablaProcesosConfiguracionAcciones } from "app/core/model/action-buttons/action-types";
import { ASISTENCIA_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from "app/core/model/messages-error";
import { catchError, finalize } from "rxjs/operators";
import { IncidenciaModel } from "../models/bandeja-servidor.model";
import { MESSAGE_ASISTENCIA } from '../_utils/messages';
import { ResultadoOperacionEnum } from "app/core/model/types";
import { ActivatedRoute, Router } from "@angular/router";
import { MAT_MENU_PANEL } from "@angular/material/menu";
import { DatePipe} from '@angular/common'

@Component({
  
    selector: "app-modal-incidencia-servidor",
    templateUrl: "./modal-incidencia-servidor.component.html",
    styleUrls: ["./modal-incidencia-servidor.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
    providers:[DatePipe]
})

export class ModalIncidenciaComponent implements OnInit {   

    form: FormGroup;
    onlyFecha: boolean = false; 
    export: boolean = false;
    working: boolean = false;
    modificado:boolean=false;
    existe: boolean = false;
    cantidad;
    index = 0;
    encontrado:boolean = false;
    @ViewChild("table", { static: true }) table;
    permisoPassport = {
        buttonCrearIncidencia: false,
        buttonEliminarncidencia: false,
    }   

    maestrovalidaciones = [];
    
    fechavalidar: string;

    variablevalidacion: boolean=false;

    now:Date = new Date();
    incidenciaItem: IncidenciaModel =null;
    private passport: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;
    servidorPublico: ServidorPublicoModel =null;
    asistenciaServidor: AsistenciaServidorModel =null;
    permisoCrearIncidencia: boolean = false;    
    filtroGrid: any = null;
    listaFechas:any[]=[];
    cantidadIncidencia: number;
    incidencia_;

    
    max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    modal = {
        icon: "",
        title: "",
        action: "",
        info: null,
        editable: false
      }
    
  private _loadingChange = new BehaviorSubject<boolean>(false);
  loading = this._loadingChange.asObservable();
  totalRegistros: number = 0;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
   displayedColumns: string[];
   descripcionMes;
   anio;
  isMobile = false;
  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
      return true;
    } else {
      return false;
    }
  }

   
      dialogRef: any;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public matDialogRef: MatDialogRef<ModalIncidenciaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private utilService: MessageService,
        private dataService: DataService,
        private datepipe: DatePipe
    ) {  }
//


handleResponsive(): void {
  this.isMobile = this.getIsMobile();
  window.onresize = () => {
      this.isMobile = this.getIsMobile();
  };
}
    //#region init
    ngOnInit() {
      debugger
      this.listaFechas.pop();
      this.handleResponsive();
      if(!this.data.modal.editable )
      {
        this.displayedColumns = [
          'registro',
          'fechaIncidencia',
          'horas',
          'minutos',
          'tipoRegistro',
          'acciones'
        ];
      }
      
      else{
      
        this.displayedColumns = [
          'registro',
          'fechaIncidencia',    
          'tipoRegistro', 
          'acciones'
        ];
     
       
        // this.form.controls['horas'].disable();
        // this.form.controls['minutos'].disable();
 
      }
      this.descripcionMes = this.route.snapshot.queryParams.descripcionMes;
      this.anio = this.route.snapshot.queryParams.anio;
      this.buildForm();
 
    }
   
    ngAfterViewInit() {}

    buildForm(){    
      this.initialize();
      if(this.modal.editable == true)
      {
        this.form = this.formBuilder.group({
          fechaTardanza:  [null, Validators.required],   
          // horas: '00',
          // minutos: '00' 
          horas: [null],
          minutos: [null]     
      });
      this.form.controls['horas'].disable();
      this.form.controls['minutos'].disable();
      
      this.form.get('fechaTardanza').valueChanges.subscribe(value => {  
       
        if(value){
          const idMes = this.validarMes()-1;
          console.log('this.listaFechas',this.listaFechas);
          if(this.listaFechas.length != 0)
          {
            this.listaFechas.forEach(element => {
              const arrayfechaIncidencia = this.datepipe.transform(element.fechaIncidencia_,'yyyy-MM-dd');
              const arrayfecha = this.datepipe.transform(value,'yyyy-MM-dd');
              console.log('arrayfechaIncidencia',arrayfechaIncidencia)
              if (element.fechaIncidencia_.getTime() === value.getTime()) {
                  this.encontrado = true;
              }
              else {
                this.encontrado = false;
              }
            });
          }  
        if(this.encontrado)
        {
            this.dataService.Message().msgWarning('La fecha ya existe en los registros.', () => {
            this.form.patchValue({ fechaTardanza: null});
            });
        }  
        if(value.getMonth() != idMes)
        {
                this.dataService.Message().msgWarning('El mes no es válido, debe registrar incidencias del mes '+this.descripcionMes, () => {
                  this.form.patchValue({ fechaTardanza: null});
                });
         }
        if(this.validarFinDeSemana())
        {
          this.dataService.Message().msgWarning('No se puede registrar incidencias los días sábados ni domingos ', () => {
          this.form.patchValue({ fechaTardanza: null});
          });
        }        
              
         
        }
       
      });

      }
      else{
        this.form = this.formBuilder.group({
          fechaTardanza:  [null, Validators.required],
          horas: [null, Validators.required],
          minutos: [null, Validators.required]        
      });

      this.form.get('fechaTardanza').valueChanges.subscribe(value => {  
     
        const idMes = this.validarMes()-1;
        console.log(value.getMonth());
        console.log(this.listaFechas);
        console.log(this.listaFechas.length);
   
        if(this.listaFechas.length != 0)
        {
          this.listaFechas.forEach(element => {

            if (element.fechaIncidencia_.getTime() === value.getTime()) {
        
                this.encontrado = true;
            }
            else {
              this.encontrado = false;
            }
          });
        }  
       
        if(this.encontrado)
        {
          this.dataService.Message().msgWarning('La fecha ya existe en los registros.', () => {
            this.form.patchValue({ fechaTardanza: null});
          });
        }  
        if(value.getMonth() != idMes)
        {
          this.dataService.Message().msgWarning('El mes no es válido, debe registrar incidencias del mes '+this.descripcionMes, () => {
            this.form.patchValue({ fechaTardanza: null});
          });
        }
        if(this.validarFinDeSemana())
        {
          this.dataService.Message().msgWarning('No se puede registrar incidencias los días sábados ni domingos ', () => {
            this.form.patchValue({ fechaTardanza: null});
          });
        }     
           
      });
    
      this.form.get('horas').valueChanges.subscribe(value => {
        if (this.form.get('horas').dirty) {
          this.modificado = true;
          if(value>8){
            this.dataService.Message().msgWarning('Las horas son inválidas.', () => {
              this.form.patchValue({ horas: null});
             });
          }
        }
      });
      this.form.get('minutos').valueChanges.subscribe(value => {
        if (this.form.get('minutos').dirty) {
          this.modificado = true;
          if(value>59){
            this.dataService.Message().msgWarning('Los minutos son inválidos', () => {
              this.form.patchValue({ minutos: null});
             });
          }
        }
      });
    }
     



 
 
 }

 

    initialize() {
        this.modal = this.data.modal;
        this.onlyFecha = this.modal.editable;
        this.passport = this.data.passport;  
        console.log('this.data',this.data); 
        this.loadIncidencias(this.modal.info.idAsistenciaServidor,this.data.tipo);
        this.listarFechasIncidencia(this.modal.info.idAsistenciaServidor);
        this.working= false;
    }
   
    
  

  loadIncidencias(idAsistenciaServidor: number, idTipoIncidencia: string) {
    debugger
    const idTipoIncidenciatemporal = idTipoIncidencia;
    const idAsistenciaServidortemporal = idAsistenciaServidor;
    const listEstadosControlConsolidado = [];
  
    this._loadingChange.next(true);
    this.dataService.Asistencia().getModalIncidenciaServidor(idAsistenciaServidor,idTipoIncidencia).pipe(
      catchError(() => of([])),
      finalize(() =>{})
    ).subscribe((response: any) => {
      console.log(response);
      
      if (response && response.result) {
        this.dataSource = new MatTableDataSource(response.data || []);
        this.totalRegistros = (response.data[0] || [{ totalRegistro: 0 }]).totalRegistro;
    
      } else {
        this.totalRegistros = 0;
        this.dataService.Message().msgWarning('No se encontró información de las incidencias.', () => { });
      }
    });
    
  }

  listarFechasIncidencia(idAsistenciaServidor: number) {
    debugger
    const listaFechasIncidencia = [];
  
    this._loadingChange.next(true);
    this.dataService.Asistencia().getListaIncidenciasServidor(idAsistenciaServidor).pipe(
      catchError(() => of([])),
      finalize(() =>{})
    ).subscribe((response: any) => {
      console.log(response);
      
      if (response && response.result) {
       
        response.data.forEach(row => {
          
          listaFechasIncidencia.push(row.fechaIncidencia)
       
      });
      console.log(listaFechasIncidencia);
      this.listaFechas = listaFechasIncidencia;
      console.log('this.listaFecha2',this.listaFechas);
      console.log('response.data',response.data);
      }
       else {
       
        this.dataService.Message().msgWarning('No se encontró información del centro de trabajo para el tipo de alcance ingresado.', () => { });
      }
    });
    
  }
    handleClose = () => {
        this.matDialogRef.close({ working: this.working });
    };  

  
    handleDeleteIncidencia = (row) => {
      console.log(row);
      if(row.modificado == 0)
      {
        this.dataSource.data.pop();
        this.table.renderRows();
      }
      else {
        this.dataService.Message().msgConfirm('¿Esta seguro que desea eliminar esta incidencia?', () => {
          this.working = true;
          const data ={
            usuarioModificacion: this.passport.numeroDocumento,
            idTipoIncidencia : row.idTipoIncidencia,
            cantidadIncidencia: row.cantidadIncidencia,
          }
          this.dataService.Spinner().show("sp6");
          this.dataService.Asistencia().deleteIncidencia(this.modal.info.idAsistenciaServidor,row.idIncidencia,data).pipe(
              catchError((e) => of(e)),
              finalize(() => {
                  this.dataService.Spinner().hide("sp6")
                  this.working = false;
              })
          ).subscribe(response => {
              if (response && response.result) {
                  this.dataService.Message().msgInfo(MESSAGE_ASISTENCIA.M07, () => {this.working= true; this.handleClose(); });
              } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                  this.dataService.Message().msgWarning(response.messages[0], () => { });
              } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                  this.dataService.Message().msgWarning(response.messages[0], () => { });
              } else {
                  this.dataService.Message().msgError('Ocurrieron algunos problemas al procesar la operación.', () => { });
              }
          });
      }, (error) => {return; });

      }
     
      
  };
     
  
  handleCrear(){
    debugger
    console.log('this.listaFechas',this.listaFechas);
    let registro = this.dataSource.data.length+1;
    if(!this.data.modal.editable )
    {       
      const row  = {
        registro: registro,
        idAsistenciaServidor: this.modal.info.idAsistenciaServidor,   
        idTipoIncidencia:  this.data.tipo,
        tipoRegistro: this.devolverTipoRegistro(TipoRegistroEnum.MANUAL),
        idTipoRegistro: TipoRegistroEnum.MANUAL,
        fechaIncidencia_:new Date(this.form.value.fechaTardanza),
        fechaIncidencia: moment(this.form.value.fechaTardanza),
        cantidadIncidencia: this.form.value.horas*60+this.form.value.minutos,              
        horas : this.form.value.horas,
        minutos: this.form.value.minutos,
        modificado:0,
        usuarioCreacion :this.passport.numeroDocumento        
      }
      console.log(this.listaFechas.length);
      if(this.listaFechas.length != 0)
      {
        this.listaFechas.forEach(element => {
          console.log('element',element)
          
          if (element.fechaIncidencia_.getTime() === row.fechaIncidencia_.getTime()) {
              this.encontrado = true;
          }
          else {
            this.encontrado = false;
          }
        });
      }     
      if(!this.encontrado)
      {
        this.dataSource.data.push(row);
        console.log( this.dataSource.data);
        registro++;
        console.log(this.dataSource.data.length);
        this.table.renderRows();
        this.form.patchValue({ fechaTardanza: null,horas: null, minutos: null});
        const select = this.dataSource.data.filter(a=>a.modificado==0);
        console.log(select);
      }   
      else
      {

      }

     
    
    }
    
    else {
      let registro = this.dataSource.data.length+1;
      const row  = {
        registro: registro,
        fechaIncidencia: moment(this.form.value.fechaTardanza),
        idTipoRegistro: TipoRegistroEnum.MANUAL,
        tipoRegistro: this.devolverTipoRegistro(TipoRegistroEnum.MANUAL),        
        idTipoIncidencia : this.data.tipo,   
      
        modificado:0,
        idAsistenciaServidor: this.modal.info.idAsistenciaServidor,        
        fechaIncidencia_ : new Date(this.form.value.fechaTardanza),
 
        cantidadIncidencia : 1, 
        usuarioCreacion : this.passport.numeroDocumento
      }
      
      if (typeof row==='undefined'){
        console.log('no existe datos',row)
      }else{
        this.variablevalidacion = false;
        const fechaobtener = this.datepipe.transform(row.fechaIncidencia_,'yyyy-MM-dd')
        const estructuraregistros: any = []
            for(var i=0; i < this.listaFechas.length; i++){
  
              estructuraregistros.push({
                  fechas: this.listaFechas[i]
              })
              const arrayfecha = this.datepipe.transform(estructuraregistros[i].fechas,'yyyy-MM-dd')
              if ( arrayfecha === fechaobtener){
                this.variablevalidacion = true;
              }
            }
            if (this.variablevalidacion === true){
                this.dataService.Message().msgError('La fecha ya existe en el registro', () => { });
            }else{
              this.dataSource.data.push(row);
              registro++;
               registro = registro +this.dataSource.data.length ;
              console.log(this.dataSource.data.length);
              this.table.renderRows();
              this.form.patchValue({ fechaTardanza: null});
              const select = this.dataSource.data.filter(a=>a.modificado==0);
              console.log(select);
            }
      }    
    }
}

    handleSave = () => {

        this.dataService.Message().msgConfirm(MESSAGE_ASISTENCIA.M02, () => {
            this.working = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Asistencia().crearIncidencia(this.modal.info.idAsistenciaServidor, this.dataSource.data.filter(a=>a.modificado==0)).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                    this.working = false;
                })
            ).subscribe(response => {
                if (response && response.result) {
                   
                    this.dataService.Message().msgInfo(MESSAGE_ASISTENCIA.M07, () => { this.working = true; this.handleClose(); });
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
                }
            });
        }, () => { });
   

    } 
                    
        
       
    validarFinDeSemana() : boolean{
        if(moment(this.form.value.fechaTardanza).format('dddd') == "Sunday" ||moment(this.form.value.fechaTardanza).format('dddd') == "Saturday")
        {
          return true;
        }
       else{
         return false;
       }
    }

    validarMes(){
      this.descripcionMes = this.route.snapshot.queryParams.descripcionMes;
      this.anio = this.route.snapshot.queryParams.anio;
      switch(this.descripcionMes)
      {
        case 'ENERO':
          return 1;
          break;
        case 'FEBRERO':
          return 2;
          break;
          case 'MARZO':
            return 3;
          break;
        case 'ABRIL':
          return 4;
          break;
          case 'MAYO':
            return 5;
          break;
        case 'JUNIO':
          return 6;
          break;
          case 'JULIO':
            return 7;
          break;
        case 'AGOSTO':
          return 8;
          break;
          case 'SEPTIEMBRE':
          case 'SETIEMBRE':
            return 9;
          break;
        case 'OCTUBRE':
          return 10;
          break;
          case 'NOVIEMBRE':
            return 11;
          break;
        case 'DICIEMBRE':
          return 12;
          break;
      
      }
    }
    devolverTipoRegistro(idTipoRegistro: number){
      if(idTipoRegistro === TipoRegistroEnum.MANUAL)
      return 'MANUAL';

      if(idTipoRegistro === TipoRegistroEnum.MASIVO)
      return 'MASIVO';

      if(idTipoRegistro === TipoRegistroEnum.MIXTO)
      return 'MIXTO';

      if(idTipoRegistro === TipoRegistroEnum.SIN_REGISTRO)
      return 'SIN_REGISTRO';

    }
}
