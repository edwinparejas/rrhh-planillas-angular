import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
//import { servidorPublicoAnimations } from '@servidorpublico/animations';
import { mineduAnimations } from "@minedu/animations/animations";
import { saveAs } from 'file-saver';

@Component({
  selector: 'servidorpublico-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
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
    this.modal = this.data.modal;
    const data = window.URL.createObjectURL(this.modal.file);
    this.file = this.sanitizer.bypassSecurityTrustResourceUrl(data);
  }

  handleDescargar() {
    saveAs(this.modal.file, this.modal.fileName);
    this.handleCancelar();
  }

  handleCancelar(data?: any) {
    this.matDialogRef.close(data);
  }

}
