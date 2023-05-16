import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { MensajesSolicitud } from '../../_utils/constants';

@Component({
  selector: 'minedu-agregar-vacaciones',
  templateUrl: './agregar-vacaciones.component.html',
  styleUrls: ['./agregar-vacaciones.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class AgregarVacacionesComponent implements OnInit {
    formVacaciones: FormGroup;
    dialogTitle: string;
    now = new Date();
    comboLists = {
        listMesInicio: [
            
            {value:'1',label:'ENERO'}
            ,{value:'2',label:'FEBRERO'}
            ,{value:'3',label:'MARZO'}
            ,{value:'4',label:'ABRIL'}
            ,{value:'5',label:'MAYO'}
            ,{value:'6',label:'JUNIO'}
            ,{value:'7',label:'JULIO'}
            ,{value:'8',label:'AGOSTO'}
            ,{value:'9',label:'SETIEMBRE'}
            ,{value:'10',label:'OCTUBRE'}
            ,{value:'11',label:'NOVIEMBRE'}
            ,{value:'12',label:'DICIEMBRE'}
        ],
        listMesFin: [
            
            {value:'1',label:'ENERO'}
            ,{value:'2',label:'FEBRERO'}
            ,{value:'3',label:'MARZO'}
            ,{value:'4',label:'ABRIL'}
            ,{value:'5',label:'MAYO'}
            ,{value:'6',label:'JUNIO'}
            ,{value:'7',label:'JULIO'}
            ,{value:'8',label:'AGOSTO'}
            ,{value:'9',label:'SETIEMBRE'}
            ,{value:'10',label:'OCTUBRE'}
            ,{value:'11',label:'NOVIEMBRE'}
            ,{value:'12',label:'DICIEMBRE'}
        ],
        
    };
    constructor(
        public matDialogRef: MatDialogRef<AgregarVacacionesComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
    ) { }

    ngOnInit() {
        this.buildForm();
    }
    buildForm(): void {
    
        this.formVacaciones = this.formBuilder.group({
            idDetalleVacaciones : [null],
            mesInicioVacacionesTruncas: [null, Validators.required],
            mesInicioTexto:[null],
            mesFinVacacionesTruncas:[null, Validators.required],
            mesFinTexto:[null],
            anioVacacionesTruncas:[null, Validators.required],
            cantidadMeses: [null, Validators.required],
            importeRemuneracionMensual:[null, Validators.required],
            importeBeneficio: [null, Validators.required],
            numero:[null]
        });
        const item = this.data;
        
        if(item.idDetalleVacaciones!=0 || item.numero !=0){
            console.log('item.idDetalleVacaciones',item.idDetalleVacaciones);
            console.log('item',item);
            
            this.formVacaciones.patchValue({ 
                idDetalleVacaciones : item.idDetalleVacaciones,
                mesInicioVacacionesTruncas: ""+item.mesInicioVacacionesTruncas,
                mesInicioTexto:""+item.mesInicioTexto,
                mesFinVacacionesTruncas:""+item.mesFinVacacionesTruncas,
                mesFinTexto:""+item.mesFinTexto,
                anioVacacionesTruncas: new Date(item.anioVacacionesTruncas,1,1),
                cantidadMeses: ""+item.cantidadMeses,
                importeRemuneracionMensual:""+item.importeRemuneracionMensual,
                importeBeneficio: ""+item.importeBeneficio,
                numero : item.numero
            });
        }
    } 
    onKeyPresscantidadMeses(e: any): boolean {
        
        let value = this.formVacaciones.get('cantidadMeses').value;
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
    handleGuardar(): void {
        if (!this.formVacaciones.valid) {
            this.dataService.Message().msgWarning(MensajesSolicitud.M08, () => { });
            return;
        }
        let dataForm = this.formVacaciones.value;
        dataForm.mesInicioTexto = this.comboLists.listMesInicio.filter(x=>x.value == dataForm.mesInicioVacacionesTruncas)[0].label;
        dataForm.mesFinTexto = this.comboLists.listMesFin.filter(x=>x.value == dataForm.mesFinVacacionesTruncas)[0].label;
        dataForm.anioVacacionesTruncas = new Date(dataForm.anioVacacionesTruncas).getFullYear().toString(),
        console.log('dataForm',dataForm);
        this.matDialogRef.close({ data: dataForm });
    }
    cancelar = () => {
        this.matDialogRef.close();
    };

}
