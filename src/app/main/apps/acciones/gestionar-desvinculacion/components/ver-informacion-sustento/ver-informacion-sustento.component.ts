import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';

@Component({
  selector: 'minedu-ver-informacion-sustento',
  templateUrl: './ver-informacion-sustento.component.html',
  styleUrls: ['./ver-informacion-sustento.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerInformacionSustentoComponent implements OnInit {

  InfoDocumentoSustento: any = {};

  constructor(
    public matDialogRef: MatDialogRef<VerInformacionSustentoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dataShared: SharedService,
    private materialDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.setInfo();
  }

  handleCancel = () => {
    this.matDialogRef.close();
  }

  setInfo() {
    this.InfoDocumentoSustento = this.data.info;
    console.log(this.InfoDocumentoSustento);
  }
}
