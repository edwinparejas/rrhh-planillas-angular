import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BuscarPersonaComponent } from '../../components/buscar-persona/buscar-persona.component';
import { MensajesSolicitud } from '../../_utils/constants';

@Component({
  selector: 'minedu-servidor-publico',
  templateUrl: './servidor-publico.component.html',
  styleUrls: ['./servidor-publico.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ServidorPublicoComponent implements OnInit {

    @Input() form:FormGroup;
    constructor(
        private materialDialog: MatDialog,
      private formBuilder: FormBuilder,
      private dataService: DataService,
    ) { }
  
    ngOnInit() {
      this.loadCombos();
      
    }
    
    /**
    * Métodos Internos */
     loadCombos() {
        
        this.loadTipoDocumentoIdentidad();
    };
  /**
      * Variables HTML*/
   comboLists = {
      listTipoDocumentoIdentidad:[],
  };
  dialogRef: any;
  servidorPublico: any = {};
/**
    * Métodos HTML*/
 selectTipoDocumento(tipoDocumento: number) : void{
    this.form.patchValue({
        numeroDocumentoIdentidad: ''
      });
  }
  focusOutFunction(){
    
    
    if(this.form.get('numeroDocumentoIdentidad').value.trim() !="" ){
        
        this.handleBuscarServidorPublico();
    }else{
        this.limpiarServidorPublico();
    }
  }
onKeyPressNumeroDocumento(e: any): boolean {
    console.log('pressedKey',e.charCode);
    console.log('numeroDocumentoIdentidad',this.form.get('numeroDocumentoIdentidad').value );
    if(e.charCode==13){
        
        if(  this.form.get('numeroDocumentoIdentidad').value.trim() !="" )
            this.handleBuscarServidorPublico();
        else
            this.limpiarServidorPublico();
        e.preventDefault(); 
    }else{
        let _idTipoDocumento  = this.form.get('idTipoDocumentoIdentidad').value;
        let tipoDocumentoSelect = this.comboLists.listTipoDocumentoIdentidad.find(m => m.value == _idTipoDocumento);
        if (tipoDocumentoSelect.value == 1) {
        //------------ DNI
        const reg = /^\d+$/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
            e.preventDefault();
            return false;
        }  
        } else {
        //------------ PASAPORTE O CARNET DE EXTRANJERIA
        var inp = String.fromCharCode(e.keyCode);

        if (/[a-zA-Z0-9]/.test(inp)) {
            return true;
        } else {
            e.preventDefault();
            return false;
        }
        }
    }
    
    
  }
  buscarPersona(event) {
    event.preventDefault();
    this.dialogRef = this.materialDialog.open(BuscarPersonaComponent, {
      panelClass: 'buscar-persona-dialog',
      width: "1900px",
      disableClose: true,
      data: {
        esProceso: false,
        idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        console.log('persona selected - close => ', response);
        this.form.patchValue({ 
          numeroDocumentoIdentidad: response.numeroDocumentoIdentidad,
          idTipoDocumentoIdentidad: response.idTipoDocumentoIdentidad
        });
        this.handleBuscarServidorPublico();
        // this.plaza = response;
      });
  }
  addParam(queryParam:HttpParams,param,value){
    if(value)
        queryParam = queryParam.set(param, value);
    return queryParam
}
getValueOrNullFromCero(value){
    return value==0?null:value;
  }
  getValueOrNullFromEmpy(value){
    return value==""?null:value;
  }
 handleBuscarServidorPublico=()=>{
    if(!this.form.get('idTipoDocumentoIdentidad').value)
    {
        this.dataService.Message().msgWarning(MensajesSolicitud.M14, () => { });
        return;
    }
    if(!this.form.get('numeroDocumentoIdentidad').value)
    {
        this.dataService.Message().msgWarning(MensajesSolicitud.M15, () => { });
        return;
    }
    
    let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'idTipoDocumentoIdentidad', this.getValueOrNullFromCero(this.form.get('idTipoDocumentoIdentidad').value));
        queryParam = this.addParam(queryParam,'numeroDocumentoIdentidad', this.getValueOrNullFromEmpy(this.form.get('numeroDocumentoIdentidad').value));
    this.getServidorPublico(queryParam);
 }
  /**
    * Métodos Integración Back*/
   loadTipoDocumentoIdentidad = () => {
    this.dataService
        .Beneficios()
        .getComboTipoDocumentoIdentidad()
        .pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((result: any) => {
            if (result) {
                var index = 0;
                result.splice(index, 0,
                    {
                        value: 0,
                        label:"TODOS"
                    });
                this.comboLists.listTipoDocumentoIdentidad = result.map((x) => ({
                    ...x,
                    value: x.idTipoDocumentoIdentidad,
                    label: x.descripcionTipoDocumentoIdentidad
                }));
                
            }
        });
    };
    getServidorPublico = (data: any) => {
        this.dataService
            .Beneficios()
            .getFormServidorPublico(data)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((result: any) => {
                if (result) {
                    this.setFormServidorPublic(result);
                }
            });
    };

    /**
    * Métodos Util */
    setFormServidorPublic(servidorPublico){
        if(!servidorPublico.idServidorPublico)
        {
            this.dataService.Message().msgWarning(MensajesSolicitud.M11, () => { });
            this.limpiarServidorPublico();
            return;
        }
        this.form.patchValue({ 
            idPersona:servidorPublico.idPersona,
            idServidorPublico:servidorPublico.idServidorPublico,
            codigoServidorPublico:servidorPublico.codigoServidorPublico,
            tipoDocumentoIdentidad:servidorPublico.tipoDocumentoIdentidad,
            nombres: servidorPublico.nombres,
            primerApellido: servidorPublico.primerApellido,
            segundoApellido: servidorPublico.segundoApellido,
            estadoCivil: servidorPublico.estadoCivil,
            sexo: servidorPublico.sexo,
            fechaNacimiento: servidorPublico.fechaNacimiento,

            fechaInicioVinculacion: servidorPublico.fechaInicioVinculacion,
            fechaFinVinculacion: servidorPublico.fechaFinVinculacion,
            condicionLaboral: servidorPublico.condicionLaboral,
            situacionLaboral: servidorPublico.situacionLaboral,
            codigoModular: servidorPublico.codigoModular,
            institucionEducativa: servidorPublico.institucionEducativa,
            descripcionNivelEducativo: servidorPublico.descripcionNivelEducativo,
            codigoPlaza: servidorPublico.codigoPlaza,
            descripcionJornadaLaboral: servidorPublico.descripcionJornadaLaboral,
            descripcionCargo: servidorPublico.descripcionCargo,
            categoriaRemunerativa:servidorPublico.categoriaRemunerativa,
            idNivelInstancia:servidorPublico.idNivelInstancia,
            idCentroTrabajo:servidorPublico.idCentroTrabajo,
            
            idSituacionLaboral:servidorPublico.idSituacionLaboral,
            idCondicionLaboral:servidorPublico.idCondicionLaboral,
            idCategoriaRemunerativa:servidorPublico.idCategoriaRemunerativa,
            grupoOcupacional:servidorPublico.grupoOcupacional
        });
        
    }
    limpiarServidorPublico(){
        this.form.patchValue({ 
            idPersona:null,
            idServidorPublico:null,
            codigoServidorPublico:null,
            tipoDocumentoIdentidad:null,
            nombres: null,
            primerApellido:null,
            segundoApellido: null,
            estadoCivil: null,
            sexo: null,
            fechaNacimiento: null,

            fechaInicioVinculacion:null,
            fechaFinVinculacion: null,
            condicionLaboral: null,
            situacionLaboral: null,
            codigoModular: null,
            institucionEducativa: null,
            descripcionNivelEducativo: null,
            codigoPlaza: null,
            descripcionJornadaLaboral: null,
            descripcionCargo: null,
            categoriaRemunerativa:null,
            idNivelInstancia:null,
            idCentroTrabajo:null,
            
            idSituacionLaboral:null,
            idCondicionLaboral:null,
            idCategoriaRemunerativa:null,
            grupoOcupacional:null
        });
    }
}
