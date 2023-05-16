import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { DocumentoSustentoModel } from '../../../models/contratacion.model';
import { ResultadoOperacionEnum } from '../../../../../../../core/model/types';
import { EstadoFaltaEnum } from 'app/main/apps/sanciones/_utils/constants';
import { CodigoTipoOperacionSustentoEnum } from '../../../_utils/constants';


@Component({
    selector: 'minedu-registra-motivo-no-publicacion',
    templateUrl: './registra-motivo-no-publicacion.component.html',
    styleUrls: ['./registra-motivo-no-publicacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RegistraMotivoNoPublicacionComponent implements OnInit {
    dialogTitle = 'Sustentar motivo de no publicación de plazas';
    working = false;
    icon = 'create';
    form: FormGroup;
    comboLists = {
        comboMotivo: [],
        listTiposSustento: [],
        listTiposFormato: []
    };
    documentosSustento: DocumentoSustentoModel[] = [];
    plazas: any[];

    constructor(
        public matDialogRef: MatDialogRef<RegistraMotivoNoPublicacionComponent>,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ) {
        this.plazas = data.plazas;
        
    }

    ngOnInit(): void {
        this.working = true;
        console.log('PLAZASSSS', this.plazas)
        this.buildForm();
        this.loadMotivoNoPublicacion();
        this.loadTipoSustento();
        this.loadTipoFormato();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idMotivoNoPublicacion: [null, Validators.required],
            detalleNoPublicacion: [null, Validators.required],
        });        
    }

    handleSave = () => {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Debe ingresar campos obligatorios.', () => { });
            return;
        }

        if (this.documentosSustento.length === 0) {
            this.dataService.Message().msgWarning('Debe registrar como mínimo un documento de sustento.', () => { });
            return;
        }

        const row = this.form.getRawValue();
        const request = {
            idMotivoNoPublicacion: row.idMotivoNoPublicacion,
            detalleNoPublicacion: row.detalleNoPublicacion,
            plazas: this.plazas,
            documentosSustento: this.documentosSustento
        };

        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Message().msgConfirm('¿Esta seguro de que desea observar plazas?', () => {
            this.working = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Contrataciones().observarPlazas(request).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                    this.working = false;                    
                })
            ).subscribe(response => {
                if (response && response.result) {
                    this.dataService.Message().msgInfo(resultMessage, () => { });
                    this.matDialogRef.close({ grabado: true });
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
                }
            });
        }, (error) => { });
    }

    handleCancel = () => {
        this.matDialogRef.close({ grabado: false });
    }

    loadMotivoNoPublicacion = () => {
        this.dataService.Contrataciones()
            .getComboMotivoNoPublicacion()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.comboMotivo = data;
                }
            });
    }

    loadTipoSustento = () => {
        this.dataService.Contrataciones()
            .getComboTipoSustento(CodigoTipoOperacionSustentoEnum.MOTIVO_NO_PUBLICACION)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idTipoDocumentoSustento,
                        label: `${x.descripcionTipoDocumentoSustento}`,
                    }));
                    this.comboLists.listTiposSustento = data;
                }
            });
    }

    loadTipoFormato = () => {
        this.dataService.Contrataciones()
            .getComboTipoFormato()
            .pipe(
                catchError(() => of([])),
                finalize(() => { this.working = false; })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTiposFormato = data;
                }
            });
    }
}
