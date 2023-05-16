import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { isArray } from 'lodash';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MENSAJES } from '../../_utils/constants';



@Component({
  selector: 'minedu-bandeja-postulante-acciones',
  templateUrl: './bandeja-postulante-acciones.component.html',
  styleUrls: ['./bandeja-postulante-acciones.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaPostulanteAccionesComponent implements OnInit {

  form: FormGroup;
  permiteEliminar: boolean = false;
  dialogRef: any;
  
  nowDate = new Date();
  working: boolean = false;
  spublico = null;
  plaza = null;
  informe = null;
  centroTrabajo = null;
  postulacion = null;

  displayedColumns: string[] = [
    'index',
    'alternativa',
    'codigoModular',
    'centroTrabajo',
    'tipoRotacion'
  ];
  private _loadingChange = new BehaviorSubject<boolean>(false);
  loading = this._loadingChange.asObservable();
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(false, []);
  centrosTrabajo: any[] = [];



    /*
        *_____________________________estudios___________________________________
     */
    displayedColumnsEstudios: string[] = [
        'index',
        'centroEstudios',
        'especialidad',
        'gradoAcademico',
        'grupoCarrera',
        'nivelEducativo',
        'situacionAcademica',
        'titulo',
        'anioInicio',
        'anioFin'
    ];
    private _loadingChangeEstudios = new BehaviorSubject<boolean>(false);
    loadingEstudios = this._loadingChangeEstudios.asObservable();
    dataSourceEstudios: MatTableDataSource<any>;
    selectionEstudios = new SelectionModel<any>(false, []);
    /*
        *_____________________________meritos___________________________________
     */
    displayedColumnsMerito: string[] = [
        'index',
        'tipoMerito',
        'merito',
        'fechaMerito',
        'instancia'
    ];
    private _loadingChangeMerito = new BehaviorSubject<boolean>(false);
    loadingMerito = this._loadingChangeMerito.asObservable();
    dataSourceMerito: MatTableDataSource<any>;
    selectionMerito = new SelectionModel<any>(false, []);
    /*
        *_____________________________sanciones___________________________________
     */
    displayedColumnsSancion: string[] = [
        'index',
        'tipoDemerito',
        'demerito',
        'fechaInicio',
        'fechaFin'
    ];
    private _loadingChangeSancion = new BehaviorSubject<boolean>(false);
    loadingSancion = this._loadingChangeSancion.asObservable();
    dataSourceSancion: MatTableDataSource<any>;
    selectionSancion = new SelectionModel<any>(false, []);



    constructor(
    public matDialogRef: MatDialogRef<BandejaPostulanteAccionesComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private materialDialog: MatDialog,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public globals: GlobalsService,
  ) {
    this.permiteEliminar = this.data.permiteEliminar;
  }

  ngOnInit(): void {
    setTimeout((_) => {
      this.GetPustulacion();
    });
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group({
    });
    this.dataSource = new MatTableDataSource([]);
    this.dataSourceEstudios = new MatTableDataSource([]);
    this.dataSourceMerito = new MatTableDataSource([]);
    this.dataSourceSancion = new MatTableDataSource([]);
  }


  private GetPustulacion = () => {
    const { idPostulacion, idEtapaProceso } = this.data;
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Rotacion()
      .getPostulacion(idPostulacion, idEtapaProceso)
      .pipe(
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => { this.dataService.Spinner().hide('sp6'); })
      ).subscribe((response: any) => {
        if (response) {
          const { postulacion, servidorPublico, plaza, informe, destinos } = response;
          this.postulacion = postulacion;
          this.spublico = servidorPublico;
          this.plaza = plaza;
          this.informe = informe;
          this.centrosTrabajo = destinos;
          this.dataSource = new MatTableDataSource(this.centrosTrabajo);
          this.dataSourceEstudios = new MatTableDataSource(informe.estudios);
          this.dataSourceMerito = new MatTableDataSource(informe.meritos);
          this.dataSourceSancion = new MatTableDataSource(informe.sanciones);
        } else {
          this.dataService.Message().msgWarning('"ERROR AL PROCESAR LA OPERACIÓN "', () => { });
        }
      });
  }

  handleEliminar = () => {
    const { idPostulacion, idEtapaProceso } = this.data;
    const passport = this.dataService.Storage().getInformacionUsuario();

    const model = {
      idPostulacion: idPostulacion,
      idEtapaProceso: idEtapaProceso,
      usuarioCreacion: passport.numeroDocumento
    }

    this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA ELIMINAR EL REGISTRO?</b>.", () => {
      this.working = true;
      this.dataService.Spinner().show('sp6');
      this.dataService
        .Rotacion()
        .eliminarPostulacion(model)
        .pipe(
          catchError((e) => { return  this.configCatch(e);        }),
          finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
        ).subscribe((response: any) => {
          if (response) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { 
              this.matDialogRef.close({ registrado: true });
          });
          } else {
            this.dataService.Message().msgWarning('"Error al procesar la operación"', () => { });
          }
        });

    }, () => { });

  };
  handleVerDocumentoSustento = () => {
    const codigoAdjunto = this.informe.documentoInformeEscalafonario;
    if (!codigoAdjunto) {
        this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE INFORME ESCALAFONARIO."', () => {
        });
        return;
    }
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(codigoAdjunto)
        .pipe(
          catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                this.handlePreview(response, codigoAdjunto);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO."', () => {
                });
            }
        });
}

handlePreview(file: any, codigoAdjuntoSustento: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: 'Documento de sustento',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });

    this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
}
private configCatch(e: any) { 
  if (e && e.status === 400 && isArray(e.messages)) {
    this.dataService.Util().msgWarning(e.messages[0], () => { });
  } else if(isArray(e.messages)) {
          if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
              this.dataService.Util().msgError(e.messages[0], () => { }); 
          else
              this.dataService.Util().msgWarning(e.messages[0], () => { }); 
              
  }else{
      this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
  }
  this.dataService.Spinner().hide("sp6");
  return of(e) 
}
}
