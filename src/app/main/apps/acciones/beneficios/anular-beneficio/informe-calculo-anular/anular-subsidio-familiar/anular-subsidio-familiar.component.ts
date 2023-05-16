import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MensajesSolicitud } from '../../../_utils/constants';
import { SubsidioTitularAnularDataSource } from './DataSource/SubsidioTitularDataSource';

import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-anular-subsidio-familiar',
  templateUrl: './anular-subsidio-familiar.component.html',
  styleUrls: ['./anular-subsidio-familiar.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularSubsidioFamiliarComponent implements OnInit, AfterViewInit  {
    @Input() form:FormGroup;
    dataSource: SubsidioTitularAnularDataSource | null;
    displayedColumns: string[] = [
        'numero',
        'parentesco',
        'tipoDocumento',
        'documento',
        'estadoRENIEC',
        'nombres', 
        'importeBeneficio',
    ];
   paginatorPageSize = 5;
   paginatorPageIndex = 0;
   @ViewChild('paginator', { static: true }) paginator: MatPaginator;
   
   @ViewChild('divpaginator', { static: true }) divpaginator: ElementRef;
   listaBeneficiario = [];
   tipoFallecidoFamiliar = false;
   ocultar = false;
  constructor(
    private dataService: DataService) { 

    }
    ngAfterViewInit() {
        
    }
  ngOnInit() {
    console.log('load SubsidioTitularAnularDataSource');
    this.listaBeneficiario = this.form.get('listaBeneficiario').value;
    this.tipoFallecidoselect();
    this.cargarDatos();
    if(this.tipoFallecidoFamiliar){
        this.divpaginator.nativeElement.style.display='none';
        //this.divpaginator.nativeElement.hidden=true;
        this.ocultar = true;
    }
  }
  setListaDatos = () => {
        
    let numero = 1;
    this.listaBeneficiario.forEach(element => {
        element.numero=numero;
        numero++;
    });

}
buildGrid() {
    this.dataSource = new SubsidioTitularAnularDataSource(this.dataService, this.paginator);
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
tipoFallecidoselect(){
    var tipoFallecido = this.form.get('tipoFallecido').value;
    if(tipoFallecido==1){
        this.form.patchValue({ 
            idTipoSubsidio: 1
        }); 
        this.form.get('idTipoSubsidio').setValue(1);
        this.tipoFallecidoFamiliar = true;
        this.buildGrid();
        //this.divpaginator.nativeElement.style.display='none';
    }else{
        this.form.patchValue({ 
            idTipoSubsidio: 2
        }); 
        this.form.get('idTipoSubsidio').setValue(2);
        this.buildGrid();
        this.tipoFallecidoFamiliar = false;
        //this.divpaginator.nativeElement.style.display='block';        
        this.loadTable();
    }
    
    console.log('tipoSubsidio',this.form.get('tipoSubsidio').value)
}
  loadTable = (fistTime: boolean = false) => {
    this.setListaDatos();
    if (fistTime) {
      this.dataSource.load(this.listaBeneficiario, 1, 10,fistTime);
    }
    else {
      this.dataSource.load(
        this.listaBeneficiario,
        1,//this.paginator.pageIndex + 1,
        10,//this.paginator.pageSize,
        fistTime
      );
    }
  }
  cargarDatos(){
    var tipoFallecido = this.form.get('tipoFallecido').value;
    if(tipoFallecido==1){
        const idMotivoAccion = this.form.get('idMotivoAccion').value;
        var reques = {
            idTipoDocumentoIdentidad:this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad:this.form.get('numeroDocumentoIdentidad').value,
            numeroInformeEscalafonario:this.form.get('numeroInformeEscalafonario').value,
            //anio: 0,//no hay input del año
            tipoInforme: this.obtenerTipoInforme(idMotivoAccion),
            motivoInforme: this.obtenerMotivoInforme(idMotivoAccion),
            codigoSede:this.form.get('codigoSede').value,
            codigoTipoSede:this.form.get('codigoTipoSede').value
        }
        this.loadInformeEscalafonario(reques);
    }
  }
  obtenerMotivoInforme(idMotivoAccion){
    let re = null;
    switch (idMotivoAccion) {
        case 5:
            re = 25;//OTORGAR COMPENSACION POR TIEMPO DE SERVICIOS
            break;
        case 13:
            re = 26;//OTORGAR CREDITO DEVENGADO
            break;
        case 7:
        case 8:
            re = 30;//OTORGAR SUBSIDIO POR LUTO Y SEPELIO
            break;
        case 16://OTORGAR REMUNERACION VACACIONAL TRUNCA
            re = 29;
            break;
        default:
            break;
    }
    return re;
  }
  obtenerTipoInforme(idMotivoAccion){
    let re = null;
    switch (idMotivoAccion) {
        case 5:
            re = 11;//INFORME DE OTORGAMIENTO 
            break;
        case 13:
            re = 11;//INFORME DE OTORGAMIENTO 
            break;
        case 7:
        case 8:
            re = 17;//INFORME DE OTORGAR SUBSIDIO POR LUTO - SEPELIO
            break;
        case 16:
            re = 11;//INFORME DE OTORGAMIENTO 
            break;
        default:
            break;
    }
    return re;
  }

    /**
    * Métodos Integración Back*/
     loadInformeEscalafonario(request) {
        this.dataService.Beneficios().getInformeEscalafonario(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.setFormResponse(result);
            }else
                this.dataService.Message().msgWarning(MensajesSolicitud.M12, () => { });
        });
    }


    setFormResponse(item){
        if(!item.documentoInformeEscalafonario)
            {
                this.dataService.Message().msgWarning(MensajesSolicitud.M12, () => { });
                return;
            }
        const formatYmd = date => date.toISOString().slice(0, 10);
        
        let familiarDirectoFallecido = null;

        var listMotivoAccion = [7,8];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(listMotivoAccion.includes(idMotivoAccion))
        {
            if(item.familiaresDirectosFallecidos.length != 0)
            {
                familiarDirectoFallecido = item.familiaresDirectosFallecidos[0];
            }else
            {
                this.dataService.Message().msgWarning(MensajesSolicitud.M17, () => { });
                return;
            }
        }
        
        this.form.patchValue({ 
            //numeroInformeEscalafonario:"",
            motivoBeneficio:"",
            documentoInformeEscalafonario:item.documentoInformeEscalafonario,
            fechaInformeEscalafonario:item.fechaInformeEscalafonario,
            //fechaBeneficioInformeEscalafonario:formatYmd(new Date()),
            tiempoServicioOficiales:item.aniosTiempoServicio,
            //numeroInformeCalculo:"",
            conInformeCalculo:false,
            fechaDefuncion: (familiarDirectoFallecido==null)?null:familiarDirectoFallecido.fechaDefuncion,
            idTipoDocumentoIdentidadDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.idTipoDocumentoIdentidad,
            descripcionTipoDocumentoIdentidadDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.descripcionTipoDocumentoIdentidad,
            numeroDocumentoIdentidadDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.numeroDocumentoIdentidad,
            nombresDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.nombres,
            primerApellidoDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.primerApellido,
            segundoApellidoDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.segundoApellido,
            parentescoDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.parentesco,
            codigoParentescoDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.codigoParentesco
            });
    }

}
