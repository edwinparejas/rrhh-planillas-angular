import { Component, Inject, OnInit, ViewEncapsulation, ɵdevModeEqual } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DocumentoSustentoModel } from '../../models/sanciones.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { DataService } from 'app/core/data/data.service';
import { ServidorPublicoModel, FaltaModel, FaltaResponseModel } from '../../models/sanciones.model';
import { ResultadoOperacionEnum, TablaConfiguracionSistema, TipoOperacionEnum } from 'app/core/model/types';
import { SecurityModel } from 'app/core/model/security/security.model';
import { BuscadorServidorPublicoComponent } from '../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { GlobalsService } from 'app/core/shared/globals.service';

@Component({
    selector: 'minedu-registra-falta',
    templateUrl: './registra-falta.component.html',
    styleUrls: ['./registra-falta.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RegistraFaltaComponent implements OnInit {
    icon = 'create';
    dialogTitle: string;
    grabado = false;
    working = false;
    idOperacion: number;
    form: FormGroup;
    comboLists = {
        listaTipoDocumento: [],
        listaTipoFalta: [],
        listaDetalleFalta: [],
        listTiposSustento: [],
        listTiposTipoFormato: [],
    };
    dialogRef: any;
    archivoAdjunto: any;
    currentSession: SecurityModel = new SecurityModel();
    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
        autorizadoConsultar:false
    };
    documentosSustento: DocumentoSustentoModel[] = [];
    idDNI:number;
    idDre = 1;
    idUgel = 1;
    idServidorPublicoSelected: number;
    servidorPublico: ServidorPublicoModel;
    falta: FaltaResponseModel;
    idFalta: number;
    diasDescargo: number;
    formParent:any;
    tiempoMensaje:number=2000;  
    constructor(
        public matDialogRef: MatDialogRef<RegistraFaltaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        public globals: GlobalsService,
    ) {
        this.idOperacion = data.idOperacion;
        this.idFalta = data.idFalta;
        this.formParent=data.parent;
    }

    ngOnInit(): void {
        this.working = true;
        this.buildSeguridad();
        this.buildForm();
        this.loadTipoDocumentoIdentidad();
        this.loadTipoFalta();
        this.loadDetalleFalta();
        this.loadTiposSustento();
        this.loadTiposFormato();        
        this.configurarDatoInicial();
        if (this.idOperacion === TipoOperacionEnum.Modificar) {
            this.getData(this.idFalta);
        } else {
            this.working = false;
            this.form.get('fechaAviso').setValue(new Date());
            this.getDiasDescargo();
        }
    }
     
    buildForm(): void {
        this.form = this.formBuilder.group({            
            idRegimenLaboral: [null],
        });
    }

    buildSeguridad = () => {
        this.currentSession= this.dataService.Storage().getInformacionUsuario();

        this.globals.PASSPORT_CODIGO_SEDE=this.currentSession.codigoSede;
         this.globals.PASSPORT_CODIGO_TIPO_SEDE=this.currentSession.codigoTipoSede;
         this.globals.PASSPORT_CODIGO_PASSPORT=this.currentSession.idRol.toString();

         /*TMP ELIMINAR PARA PROD*/
         //this.globals.PASSPORT_CODIGO_SEDE=this.globals.PASSPORT_CODIGO_SEDE_TMP;
         //this.globals.PASSPORT_CODIGO_TIPO_SEDE= this.globals.PASSPORT_CODIGO_TIPO_SEDE_TMP;
         //this.globals.PASSPORT_CODIGO_PASSPORT=this.globals.PASSPORT_CODIGO_PASSPORT_TMP;
    }

    configurarDatoInicial = () => {
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.icon = 'create';
            this.dialogTitle = 'Registrar nueva falta';
        } else if (this.idOperacion === TipoOperacionEnum.Modificar) {
            this.dialogTitle = 'Modificar falta';
        }
    }

    handleCancel = () => {
        this.matDialogRef.close({ grabado: this.grabado });
    }
    loadTiposSustento = () => {
        this.dataService
            .Sanciones()
            .getTiposSustento(true)
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
                    this.comboLists.listTiposSustento = data;
                }
            });
    }

    loadTiposFormato = () => {
        this.dataService
            .Sanciones()
            .getTiposFormato(true)
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
                    this.comboLists.listTiposTipoFormato = data;
                }
            });
    }    
    getDiasDescargo=()=>{
        this.dataService
        .Sanciones()
        .getDiasDescargo()
        .pipe(
            catchError((e) => of(e)),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response && response.result) {
                this.diasDescargo=response.data;
                }
            });
    }
    obtenerDatosServidorPublico = (idServidorPublico: number) => {
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Sanciones()
            .getServidorPublico(idServidorPublico)
            .pipe(
                catchError(() => of([])),
                finalize(() => { this.dataService.Spinner().hide("sp6"); })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    let isValid = true;
                    /*if (
                        response.data.idSituacionLaboral !==
                        SituacionLaboralEnum.activo
                    ) {
                        this.dataService
                            .Message()
                            .msgWarning(
                                'Servidor público no se encuentra activo',
                                () => { }
                            );
                        isValid = false;
                    }*/
                    if (isValid === true) {
                        this.servidorPublico = response.data;
                        this.falta = new FaltaResponseModel();
                        this.falta.idServidorPublico = this.servidorPublico.idServidorPublico;
                        this.falta.idTipoDocumentoIdentidad = this.servidorPublico.idTipoDocumentoIdentidad;
                        this.falta.numeroDocumentoIdentidad = this.servidorPublico.numeroDocumentoIdentidad;
                        this.falta.primerApellido = this.servidorPublico.primerApellido;
                        this.falta.segundoApellido = this.servidorPublico.segundoApellido;
                        this.falta.nombres = this.servidorPublico.nombres;
                        this.falta.fechaNacimiento = this.servidorPublico.fechaNacimiento;
                        this.falta.descripcionUgel = this.servidorPublico.descripcionUgel;
                        this.falta.centroTrabajo = this.servidorPublico.centroTrabajo;
                        this.falta.abreviaturaRegimenLaboral = this.servidorPublico.abreviaturaRegimenLaboral;
                        this.falta.situacionLaboral = this.servidorPublico.situacionLaboral;
                        this.falta.genero = this.servidorPublico.genero;
                        this.falta.codigoPlaza = this.servidorPublico.codigoPlaza;
                        
                        this.falta.estadoCivil = this.servidorPublico.estadoCivil;
                        this.falta.idSituacionLaboral = this.servidorPublico.idSituacionLaboral;
                        this.falta.idRegimenLaboral = this.servidorPublico.idRegimenLaboral;
                        this.falta.idCentroTrabajo = this.servidorPublico.idCentroTrabajo;

                        this.falta.descripcionCategoriaRemunerativa= this.servidorPublico.descripcionCategoriaRemunerativa;
                        this.falta.descripcionNivelEducativo= this.servidorPublico.descripcionNivelEducativo;
                        this.falta.jornadaLaboral= this.servidorPublico.jornadaLaboral;
                        this.falta.descripcionInstitucionEducativa=this.servidorPublico.descripcionInstitucionEducativa;
                        this.falta.descripcionModalidadEducativa= this.servidorPublico.descripcionModalidadEducativa;
                        this.falta.descripcionCargo= this.servidorPublico.descripcionCargo;
                        this.falta.jornadaLaboral= this.servidorPublico.jornadaLaboral;
                        
                        this.falta.idNivelEducativo =this.servidorPublico.idNivelEducativo;
                        this.falta.idModalidadEducativa=this.servidorPublico.idModalidadEducativa;
                        this.falta.idCargo =this.servidorPublico.idCargo;
                        this.falta.idCategoriaRemunerativa =this.servidorPublico.idCategoriaRemunerativa;
                        this.falta.idInstitucionEducativa=this.servidorPublico.idInstitucionEducativa;
                    
                         
                    }
                }
            });
    }

    getData = (idFalta: number) => {
        this.dataService
            .Sanciones()
            .getFaltaById(idFalta)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this.working = false;
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.bindData(response.data);
                    this.diasDescargo=response.data.plazoDescargo;
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
                }
            });
    }

    bindData = (row) => {
        this.falta = row;  
        console.log("falta: ",row)      ;
        this.form.get('idFalta').setValue(row.idFalta);
        this.form.get('idServidorPublico').setValue(row.idServidorPublico);
        this.form.get('idPersona').setValue(row.idPersona);
        this.form.get('idTipoFalta').setValue(row.idTipoFalta);
        this.form.get('idDetalleFalta').setValue(row.idDetalleFalta);
        this.form.get('fechaAviso').setValue(moment(row.fechaAviso));
        this.form.get('idTipoDocumentoIdentidad').setValue(row.idTipoDocumentoIdentidad);
        this.form.get('numeroDocumentoIdentidad').setValue(row.numeroDocumentoIdentidad);
        this.form.get('observaciones').setValue(row.observaciones);
        this.form.get('idTipoDocumentoIdentidad').disable();
        this.form.get('numeroDocumentoIdentidad').disable();
        this.documentosSustento = row.documentosSustento;
        this.working = false;
    }

    validarDatos = () => {
        let result = true;
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Debe ingresar datos obligatorios.', () => { });
            result = false;
        }
        return result;
    }

    prepararData = (row: any, idOperacion: number = TipoOperacionEnum.Registrar) => {
        const model: FaltaModel = new FaltaModel();
        model.idFalta = idOperacion === TipoOperacionEnum.Registrar ? 0 : row.idFalta;
        model.idServidorPublico = row.idServidorPublico;
        model.idPersona = row.idPersona;
        model.idTipoFalta = row.idTipoFalta;
        model.idDetalleFalta = row.idDetalleFalta;
        model.fechaAviso = row.fechaAviso;
        model.observaciones = row.observaciones;
        model.usuarioCreacion= this.currentSession.numeroDocumento;
        model.usuarioModificacion= this.currentSession.numeroDocumento;
        return model;
    }

    resetForm = () => {
        this.form.reset();
    }
    verificarDocumentoGuardar = () => {
        const datosDocumento = new FormData();
        datosDocumento.append('codigoSistema', TablaConfiguracionSistema.FALTA_DOCUMENTO_SUSTENTO.toString());
        datosDocumento.append('descripcionDocumento', this.form.get('codigoDocumentoCertificado').value);
        datosDocumento.append('codigoUsuarioCreacion', this.currentSession.numeroDocumento);
        datosDocumento.append('archivo', this.archivoAdjunto);

        if (typeof this.archivoAdjunto === 'undefined') {
            this.dataService.Message().msgWarning('Debe adjuntar un documento de certificado.', () => { });
            return null;
        }
        return datosDocumento;
    }
    handleSave = (row: any) => {
        if (!this.validarDatos()) {
            return;
        }
        if (this.documentosSustento.length === 0) {
            // M45: “DEBE REGISTRAR COMO MINÍMO UN DOCUMENTO DE SUSTENTO”
            this.dataService.Message().msgWarning('Debe registrar como mínimo un documento de sustento.', () => { });
            return;
        }
        const falta = this.prepararData(this.form.getRawValue(), this.idOperacion);
        const resultMessage = 'Operación realizada de forma exitosa.';
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información?', () => {
                this.working = true;
                this.dataService.Spinner().show('sp6');
                falta.documentosSustento=this.documentosSustento;
               
                this.dataService.Sanciones().crearFalta(falta).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide('sp6')
                        this.working = false;
                    })
                ).subscribe(response => {
                    if (response && response.result) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(resultMessage,this.tiempoMensaje,  () => { });
                        this.resetForm();
                        this.grabado = true;
                        this.formParent.buscarFaltas();
                        this.matDialogRef.close({ grabado: this.grabado });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else {
                        this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
                    }
                });
            }, (error) => { });
        } else {
            this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar los cambios?', () => {
                this.working = true;
                this.dataService.Spinner().show('sp6')
                falta.documentosSustento=this.documentosSustento;
                this.dataService.Sanciones().modificarFalta(falta).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide('sp6')
                        this.working = false;
                    })
                ).subscribe(response => {
                    if (response && response.result) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(resultMessage,this.tiempoMensaje,  () => { });
                        this.grabado = true;
                        this.matDialogRef.close({ grabado: true });
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
    }

    buscarServidorPublico(): void {
        const idTipoDocumentoIdentidad = this.form.get('idTipoDocumentoIdentidad').value;
        const numeroDocumentoIdentidad = this.form.get('numeroDocumentoIdentidad').value;
        if (numeroDocumentoIdentidad === null || idTipoDocumentoIdentidad == null) {
            this.dataService
                .Message()
                .msgWarning('Debe ingresar Tipo de documento y Número de documento', () => { });
            return;
        }

        if (
            numeroDocumentoIdentidad.length === 0 ||
            numeroDocumentoIdentidad.length < 8
        ) {
            return;
        }

        const request = {
            codigoSede: this.globals.PASSPORT_CODIGO_SEDE,
            codigoTipoSede:this.globals.PASSPORT_CODIGO_TIPO_SEDE,
            codigoRolPassport: this.globals.PASSPORT_CODIGO_PASSPORT,
            idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad: numeroDocumentoIdentidad,
            primerApellido: '',
            segundoApellido: '',
            nombres: '',
        };

        const paginaActual = 1;
        const tamanioPagina = 10;
        this.servidorPublico = new ServidorPublicoModel();
        this.form.get('idServidorPublico').setValue(null);
        this.dataService
            .Sanciones()
            .getListaServidorPublico(request, paginaActual, tamanioPagina)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const servidorPublico = response.data[0];
                    if (
                        servidorPublico === null ||
                        servidorPublico === undefined
                    ) {
                        this.dataService
                            .Message()
                            .msgWarning(
                                'Servidor público no se encuentra registrado',
                                () => { }
                            );
                    } else {
                        this.idServidorPublicoSelected = servidorPublico.idServidorPublico;
                        this.form.get('idServidorPublico').setValue(servidorPublico.idServidorPublico);
                        this.form.get('idPersona').setValue(servidorPublico.idPersona);
                        this.obtenerDatosServidorPublico(this.idServidorPublicoSelected);
                    }
                }
            });
    }
    busquedaPersonalizada = () => { 
         
        this.dialogRef = this.materialDialog.open(BuscadorServidorPublicoComponent, {
                      
                      panelClass: 'minedu-buscador-servidor-publico-dialog',
                      width: '980px',
                      disableClose: true,
                      data: {
                          action: 'busqueda',
                      },
                      
                  }
              );
              this.dialogRef.afterClosed().subscribe((response) => {
                  if (response != null) {
                      const servidorPublico = response;
                      this.form.get('numeroDocumentoIdentidad').setValue(servidorPublico.numeroDocumentoIdentidad);
                      this.form.get('idTipoDocumentoIdentidad').setValue(servidorPublico.idTipoDocumentoIdentidad);
                      this.buscarServidorPublico();
                  }
              }); 

}
    loadTipoDocumentoIdentidad = () => {
        this.dataService.Sanciones()
            .getComboTiposDocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.abreviaturaCatalogoItem}`,
                    }));
                    this.idDNI=0;
                    data.forEach(x => {
                        if(x.label==='DNI' || x.label==='D.N.I.') this.idDNI=  x.value; 
                    });
                    this.form.get('idTipoDocumentoIdentidad').setValue(this.idDNI);
                    this.comboLists.listaTipoDocumento = data;
                }
            });
    }

    loadTipoFalta = () => {
        this.dataService.Sanciones()
            .getComboTiposFalta()
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
                    this.comboLists.listaTipoFalta = data;
                }
            });
    }

    loadDetalleFalta = () => {
        this.dataService.Sanciones()
            .getDetallesFalta()
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
                    this.comboLists.listaDetalleFalta = data;
                }
            });
    }

}
