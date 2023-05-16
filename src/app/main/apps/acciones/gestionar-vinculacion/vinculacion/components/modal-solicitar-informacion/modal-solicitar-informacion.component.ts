
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';

@Component({
    selector: 'minedu-modal-solicitar-informacion',
    templateUrl: './modal-solicitar-informacion.component.html',
    styleUrls: ['./modal-solicitar-informacion.component.scss']
  })

  export class ModalSolicitarInformacionComponent implements OnInit {
     
    Valorclose = {
      IsConfirmacion: false
    };

    constructor(
      public matDialogRef: MatDialogRef<ModalSolicitarInformacionComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private route: ActivatedRoute,
      private router: Router,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private dataShared: SharedService,
      private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
      throw new Error('Method not implemented.');
    }
    
    handleConfirmar = () => {
      this.Valorclose.IsConfirmacion = true;
      this.matDialogRef.close(this.Valorclose);
    }
    
    handleCancelConfirmacion = () => {
      this.matDialogRef.close(this.Valorclose);
    }

  }