import { Component, OnInit, ViewEncapsulation, Inject, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SecurityModel } from 'app/core/model/security/security.model';
import { DocumentoSustentoResponseModel } from '../../models/documento-sustento.model';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'minedu-modal-informacion-documento-sustento',
    templateUrl: './modal-informacion-documento-sustento.component.html',
    styleUrls: ['./modal-informacion-documento-sustento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
  })
  export class ModalInformacionDocumentoSustentoComponent implements OnInit, AfterViewInit {

    modal = {
      icon: "",
      title: "",
      action: "",
      info: null,
      editable: false
    }
  
    documentoSustento: DocumentoSustentoResponseModel = new DocumentoSustentoResponseModel();
  
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
      public matDialogRef: MatDialogRef<ModalInformacionDocumentoSustentoComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any) {
    }
  
    ngOnInit(): void {
      this.buildForm();
    }
  
    ngAfterViewInit() {
    }
  
    buildForm() {
      this.initialize();
    }
  
    initialize() {
      this.modal = this.data.modal;
      debugger
      this.documentoSustento = this.data.documentoSustento;
    }

    handleCancelar(data?: any) {
      this.matDialogRef.close(data);
    }
  
  }