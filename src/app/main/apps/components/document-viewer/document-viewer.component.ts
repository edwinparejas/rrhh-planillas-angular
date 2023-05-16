import { saveAs } from 'file-saver';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class DocumentViewerComponent implements OnInit {

  modal = {
    icon: "",
    title: "",
    file: null,
    fileName: ""
  }

  file: any = null;

  constructor(
    public matDialogRef: MatDialogRef<DocumentViewerComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // this.modal = this.data.modal;
    // this.file = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(this.modal.file));
    this.modal = this.data.modal;
    const data = window.URL.createObjectURL(this.modal.file);
    this.file = this.sanitizer.bypassSecurityTrustResourceUrl(data);

        // console.log("datos MATDATA inyectada ",this.data);
        // console.log("datos archivo ",this.modal.fileName);
    
  }

  // handleDescargar() {
  //   this.handleCancelar({ download: true });
  // }

  // handleCancelar(data?: any) {
  //   this.matDialogRef.close(data);
  // }
  handleDescargar() {
    saveAs(this.modal.file, this.modal.fileName + ".pdf");
  }

  handleCancelar(data?: any) {
    this.matDialogRef.close(data);
  }

}
