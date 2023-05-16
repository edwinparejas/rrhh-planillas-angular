import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'minedu-modal-consultar-motivo-rechazo-consolidado',
    templateUrl: './modal-consultar-motivo-rechazo-consolidado.component.html',
    styleUrls: ['./modal-consultar-motivo-rechazo-consolidado.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
  })
  export class ModalConsultarMotivoRechazoConsolidadoComponent implements OnInit, AfterViewInit {
    
    modal = {
      icon: "",
      title: "",
      action: "",
      info: null,
      editable: false
    }
  
    detalleMotivoRechazo: string;
   
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
      public matDialogRef: MatDialogRef<ModalConsultarMotivoRechazoConsolidadoComponent>,
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
      this.detalleMotivoRechazo = this.data.detalleMotivoRechazo;
    }
  
    handleCancelar(data?: any) {
      this.matDialogRef.close(data);
    }
  
  }