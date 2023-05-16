import { HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MensajesSolicitud } from '../../_utils/constants';

@Component({
  selector: 'minedu-agregar-bonificacion',
  templateUrl: './agregar-bonificacion.component.html',
  styleUrls: ['./agregar-bonificacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class AgregarBonificacionComponent implements OnInit {
    formPopup: FormGroup;
    dialogTitle: string;
    now = new Date();
    untilDate = new Date();
    comboLists = {
        listParentesco: [],
        listTipoDocumentoIdentidad:[],
    };
    constructor(
        public matDialogRef: MatDialogRef<AgregarBonificacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
    ) { }

    ngOnInit() {
        this.buildForm();
        this.loadCombos();
    }
    loadCombos() {
        this.loadParentesco();
        this.loadTipoDocumentoIdentidad();
    };
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
                   
                    this.comboLists.listTipoDocumentoIdentidad = result.map((x) => ({
                        ...x,
                        value: x.idTipoDocumentoIdentidad,
                        label: x.descripcionTipoDocumentoIdentidad
                    }));
                    
                }
            });
    };
    loadParentesco() {
       
        this.dataService.Beneficios().getComboParentesco().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                var index = 0;
                
                this.comboLists.listParentesco = result.map((x) => ({
                    ...x,
                    value: x.idParentesco,
                    label: x.descripcionParentesco
                }));
            }
        });
    }
    selectTipodocumentoIdentidad(val){
       console.log('selectTipodocumentoIdentidad',val); 
       let _idTipoDocumento  = this.formPopup.get('idTipoDocumentoIdentidad').value;
       
       console.log('_idTipoDocumento',_idTipoDocumento); 
    }
    onKeyPressNumeroDocumento(e: any): boolean {
        let _idTipoDocumento  = this.formPopup.get('idTipoDocumentoIdentidad').value;
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
    buildForm(): void {
        this.formPopup = this.formBuilder.group({
            idBeneficiario:[null],
            idParentesco:[null,Validators.required],
            parentescoTexto:[null],
            idTipoDocumentoIdentidad:[null,Validators.required],
            tipoDocumentoIdentidadTexto:[null],
            numeroDocumentoIdentidad:[null,Validators.required],
            idEstadoReniec:[null],
            estadoRENIEC:[null],
            idPersona:[null],
            nombres:[null],
            primerApellido: [null],
            segundoApellido:[null],
            importeBeneficio:[null,Validators.required],
            fechaVigenciaBonificacion:[null,Validators.required],
            fechaNacimiento:[null,Validators.required]
        });
        const item = this.data;
        if(item.idBeneficiario!=0){
            this.formPopup.patchValue({ 
                idBeneficiario: item.idBeneficiario,
                idParentesco : item.idParentesco,
                parentescoTexto: item.parentescoTexto,
                idTipoDocumentoIdentidad:item.idTipoDocumentoIdentidad,
                tipoDocumentoIdentidadTexto:item.tipoDocumentoIdentidadTexto,
                numeroDocumentoIdentidad:item.numeroDocumentoIdentidad,
                idEstadoReniec:item.idEstadoReniec,
                estadoRENIEC:item.estadoRENIEC,
                idPersona:item.idPersona,
                nombres:item.nombres,
                primerApellido: item.primerApellido,
                segundoApellido:item.segundoApellido,
                importeBeneficio:item.importeBeneficio,
                fechaVigenciaBonificacion:item.fechaVigenciaBonificacion,
                fechaNacimiento:item.fechaNacimiento,
            });
        }
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
    handleValidarReniec(val){
       
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'idTipoDocumentoIdentidad', this.getValueOrNullFromCero(this.formPopup.get('idTipoDocumentoIdentidad').value));
        queryParam = this.addParam(queryParam,'numeroDocumentoIdentidad', this.getValueOrNullFromEmpy(this.formPopup.get('numeroDocumentoIdentidad').value));
        this.dataService.Beneficios().validarDNI(queryParam).pipe(catchError(() => of([])), finalize(() => { })).subscribe((response: any) => {
            if (response) {
                this.formPopup.patchValue({ 
                    idEstadoReniec: 1,
                    estadoRENIEC: "ACTIVO",
                    nombres: response.nombres,
                    primerApellido: response.apellidoMaterno,
                    segundoApellido: response.apellidoPaterno,
                  });
            }
        });
    }
    
    onKeyPresscantidadMeses(e: any): boolean {
        
        let value = this.formPopup.get('cantidadMeses').value;
        value = (value)?value:'';
        const reg = /^([1-9]|1[0-2])$/;
        const pressedKey = value+String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
          e.preventDefault();
          return false;
        } 
    }
    onKeyPressDecimal(e: any): boolean {
        const reg = /[0-9]|[.]/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
        }  
    }
    selectTipoDocumento(tipoDocumento: number) : void{
        this.formPopup.patchValue({
            numeroDocumentoIdentidad: ''
          });
      }
      onKeyPressImporteBeneficio(e: any): boolean {
        const reg = /[0-9]|[.]/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
        }  
    }
    handleGuardar(): void {
        
        if (!this.formPopup.valid) {
            this.dataService.Message().msgWarning(MensajesSolicitud.M08, () => { });
            return;
        }
        let dataForm = this.formPopup.value;
        dataForm.parentescoTexto = this.comboLists.listParentesco.filter(x=>x.value == dataForm.idParentesco)[0].label;
        dataForm.tipoDocumentoIdentidadTexto = this.comboLists.listTipoDocumentoIdentidad.filter(x=>x.value == dataForm.idTipoDocumentoIdentidad)[0].label;
        console.log('dataForm',dataForm);
        this.matDialogRef.close({ data: dataForm });
    }
    cancelar = () => {
        this.matDialogRef.close();
    };

}
