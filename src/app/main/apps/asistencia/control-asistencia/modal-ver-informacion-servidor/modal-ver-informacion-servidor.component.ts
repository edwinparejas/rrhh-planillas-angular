import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from 'app/core/shared/shared.service';
import { VerInformacionResponseModel } from '../models/control-asistencia.model';
import { ResultadoOperacionEnum } from 'app/core/model/types';



@Component({
  selector: 'modal-ver-informacion-servidor',
  templateUrl: './modal-ver-informacion-servidor.component.html',
  styleUrls: ['./modal-ver-informacion-servidor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ModalVerInformacionServidorComponent implements OnInit {

  info: VerInformacionResponseModel =null;
  currentSession: SecurityModel = new SecurityModel();
  dialogTitle: 'Ver Información';
  working = false;
  
  isDisabled = false;

  permisoPassport = {
    
    buttonVerInformacion: false
  }

  max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  min = new Date();

  modal = {
    icon: "",
    title: "",
    action: "",
    info: null,
    editable: false
  }

  private passport: SecurityModel;
  idAsistenciaServidor;


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

  constructor(
    public matDialogRef: MatDialogRef<ModalVerInformacionServidorComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,     
    private route: ActivatedRoute,
    private dataService: DataService,
    private dataShared: SharedService,
    private materialDialog: MatDialog) {
  }

  ngOnInit(): void {
    
    this.working=true;
    this.modal = this.data.modal
    this.idAsistenciaServidor = this.data.registro;
  
    console.log(this.modal);
    this.working = false;
  }


  handleCancel = () => {
    this.matDialogRef.close();
}


}