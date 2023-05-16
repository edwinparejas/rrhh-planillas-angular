import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { DocumentosSustentoComponent } from '../../../components/documentos-sustento/documentos-sustento.component';
import { CapacitacionModel, DocumentoSustentoModel, ExperienciaLaboralCalc, ExperienciaLaboralModel, FormacionAcademicaModel, PostulacionModel, ServidorPublicoModel } from '../../../models/contratacion.model';
import { CapacitacionesComponent } from '../capacitaciones/capacitaciones.component';
import { ExperienciaLaboralComponent } from '../experiencia-laboral/experiencia-laboral.component';
import { FormacionAcademicaComponent } from '../formacion-academica/formacion-academica.component';

@Component({
    selector: 'minedu-informacion-postulante',
    templateUrl: './informacion-postulante.component.html',
    styleUrls: ['./informacion-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionPostulanteComponent implements OnInit {
    documentosSustento: DocumentoSustentoModel[] = [];
    formacionesAcademica: FormacionAcademicaModel[] = [];
    capacitaciones: CapacitacionModel[] = [];
    experienciasLaborales: ExperienciaLaboralModel[] = [];
    experienciasLaboralesCalc = new ExperienciaLaboralCalc();

    persona = new ServidorPublicoModel();
    @ViewChild(DocumentosSustentoComponent)
    private documentosSustentoComponent: DocumentosSustentoComponent;

    @ViewChild(FormacionAcademicaComponent) private formacionAcademicaComponent: FormacionAcademicaComponent;
    @ViewChild(CapacitacionesComponent) private capacitacionesComponent: CapacitacionesComponent;
    @ViewChild(ExperienciaLaboralComponent) private experienciaLaboralComponent: ExperienciaLaboralComponent;

    postulacion: PostulacionModel = null;
    dialogTitle = 'Información de postulación';
    working = false;
    idPostulacion: number;
    eliminado: boolean;
    currentSession: SecurityModel = new SecurityModel();

    constructor(
        public matDialogRef: MatDialogRef<InformacionPostulanteComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
    ) {

        this.currentSession = data.currentSession;
        console.log('delete', this.currentSession)
        if (data.eliminado === true) {
            this.dialogTitle = 'Eliminar postulación';
        }
    }

    ngOnInit(): void {
        this.working = true;
        this.idPostulacion = this.data.idPostulacion;
        this.eliminado = this.data.eliminado;
        this.obtenerDatospostulacion(this.idPostulacion);
    }
    handleCancel = () => {
        this.matDialogRef.close();
    }

    obtenerDatospostulacion = (idPostulacion: number) => {
        this.dataService
            .Contrataciones()
            .getPostulacionById(idPostulacion)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.working = false;
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.postulacion = response.data;

                    this.formacionesAcademica = this.postulacion.formacionesAcademica;
                    this.capacitaciones = this.postulacion.capacitaciones;
                    this.experienciasLaborales = this.postulacion.experienciasLaborales;
                    this.documentosSustento = this.postulacion.documentosSustento;
                    this.experienciasLaboralesCalc = this.postulacion.experienciaLaboralCalc;

                    this.formacionAcademicaComponent.actualizarLista(this.formacionesAcademica);
                    this.capacitacionesComponent.actualizarLista(this.capacitaciones);
                    this.experienciaLaboralComponent.actualizarLista(this.experienciasLaborales);
                    this.documentosSustentoComponent.actualizarLista(this.documentosSustento);
                }
            });
    }

    handleDelete = (row) => {
        Swal.fire({
            title: '',
            text: '¿Está seguro de que desea eliminar la información?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.dataService.Contrataciones()
                    .deletePostulacion(this.idPostulacion)
                    .subscribe(
                        (rest) => {
                            this.matDialogRef.close({ grabado: true });
                        },
                        (error) => {
                            // this.mensajeService.mostrarMensajeError(error);
                        }
                    );
            }
        });
    }

}
