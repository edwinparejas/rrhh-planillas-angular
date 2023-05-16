import { Component, OnInit, Input, Output, ViewChild, ElementRef, Renderer2, EventEmitter, HostListener } from '@angular/core';
import { DataService } from 'app/core/data/data.service';
import { environment } from 'environments/environment';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { DOCUMENTO_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'minedu-single-file-input',
  templateUrl: './single-file-input.component.html',
  styleUrls: ['./single-file-input.component.scss']
})
export class SingleFileInputComponent implements OnInit {

  accept: string = environment.documentoConfig.FORMATOS_SOPORTADO;

  maximumSize: number = environment.documentoConfig.TAMANIO_MAXIMO_EN_MB;

  @Input('inputText') inputText: string = 'Seleccionar documento a adjuntar';
  @Input('noFileText') noFileText: string = 'Adjunto no seleccionado';
  @Input('removeButtonLabel') removeButtonLabel: string = 'Eliminar adjunto';
  @Input('labelText') labelText: string = 'Documento adjuntado';

  @Output('mineduUpload') mineduUpload: EventEmitter<any> = new EventEmitter();
  @ViewChild('mineduInput') mineduInput: ElementRef<HTMLInputElement>;

  @Input() mineduFormControl: FormControl;

  hasFiles: boolean = false;
  id: string;
  name: string = "";

  constructor(
    private renderer: Renderer2,
    private dataService: DataService
  ) { }

  ngOnInit() {
  }

  @HostListener('document:dragover', ['$event']) public onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  @HostListener('document:drop', ['$event']) public onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const files: FileList = e.dataTransfer.files;
    this.create(files);
  }

  public adjuntarDocumento(e: Event) {
    const files: FileList = (e.currentTarget as HTMLInputElement).files;
    this.create(files);
  }

  public eliminarDocumento(e?: Event) {
    this.renderer.setProperty(this.mineduInput.nativeElement, 'value', '');
    this.name = "";
    this.hasFiles = false;
    this.mineduUpload.emit(null);
  }

  private create(files: FileList) {
    if (files.length) {
      const file = files[0];
      if (!file.type.match(this.accept)) {
        this.dataService.Message().msgWarning('El tipo del archivo que intenta ajuntar no esta permitido.', () => { });
        return;
      }
      
      if (file.size >= this.maximumSize * 1024 * 1024) {
        this.dataService.Message().msgWarning('El tamaño del archivo que intenta ajuntar debe tener un tamaño maximo de ' + this.maximumSize + ' MB', () => { });
        return;
      }
      const documento = new FormData();
      documento.append('codigoSistema', environment.documentoConfig.CODIGO_SISTEMA);
      documento.append('descripcionDocumento', file.name);
      documento.append('codigoUsuarioCreacion', 'Admin'); //obtener del sso passport
      documento.append('archivo', file);

      // this.dataService.Spinner().show("sp6");
      // this.dataService.Documento().crear(documento).pipe(
      //   catchError(() => { this.dataService.SnackBar().msgError(DOCUMENTO_MESSAGE.CREAR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
      //   finalize(() => { this.dataService.Spinner().hide("sp6"); }),
      //   map((response: any) => response)
      // ).subscribe(response => {
      //   if (response && response.result) {
          this.renderer.setProperty(this.mineduInput.nativeElement, 'files', files);
          this.hasFiles = true;
          this.name = file.name;
          // const documento = response.data;
          this.mineduUpload.emit(files);

          // debugger;
      //   } else {
      //     this.dataService.Message().msgError('No se pudo crear el documento que intenta adjuntar.', () => { });
      //     this.mineduUpload.emit(null);
      //   }
      // });
    }
  }
}
