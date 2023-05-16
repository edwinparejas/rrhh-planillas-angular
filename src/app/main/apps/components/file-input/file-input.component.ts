import { Component, OnInit, Input, Output, ViewChild, ElementRef, Renderer2, EventEmitter, HostListener } from '@angular/core';
import { UniqueGeneratorService } from './unique-generator.service';
import { DataService } from 'app/core/data/data.service';
import { environment } from 'environments/environment';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { DOCUMENTO_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';

export type FileInputButtonType = 'basic' | 'raised' | 'stroked' | 'flat';
export type FileInputButtonTheme = 'primary' | 'accent' | 'warn';

export interface FileReaderEventTarget extends EventTarget {
  result: string
}

export interface FileReaderEvent extends ProgressEvent {
  target: FileReaderEventTarget;
  getMessage(): string;
}

@Component({
  selector: 'minedu-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss']
})
export class FileInputComponent implements OnInit {

  accept: string = environment.documentoConfig.FORMATOS_SOPORTADO;
  maximumSize: number = environment.documentoConfig.TAMANIO_MAXIMO_EN_MB;
  @Input('buttonType') buttonType: FileInputButtonType = 'stroked';
  @Input('buttonText') buttonText: string = 'Seleccionar documento a adjuntar';
  @Input('buttonTheme') buttonTheme: FileInputButtonTheme = 'accent';
  @Input('noFileText') noFileText: string = 'Adjunto no seleccionado';
  @Input('removeButtonLabel') removeButtonLabel: string = 'Eliminar adjunto';
  @Input('labelText') labelText: string = 'Documento adjuntado';

  @Output('mineduUpload') mineduUpload: EventEmitter<any> = new EventEmitter();

  @ViewChild('mineduLabel') mineduLabel: ElementRef<HTMLLabelElement>;
  @ViewChild('mineduInput') mineduInput: ElementRef<HTMLInputElement>;
  @ViewChild('mineduBtn') mineduBtn: ElementRef<HTMLButtonElement>;
  @ViewChild('clearBtn') clearBtn: ElementRef<HTMLButtonElement>;

  hasFiles: boolean = false;
  id: string;
  name: string = "";

  constructor(
    private idGeneratorService: UniqueGeneratorService,
    private renderer: Renderer2,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.id = this.id ? this.id : this.idGeneratorService.generate();
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
    //eliminar  in service
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
      documento.append('descripcionDocumento', ' ');
      documento.append('codigoUsuarioCreacion', 'Admin'); //obtener del sso passport
      documento.append('archivo', file);

      this.dataService.Spinner().show("sp6");
      this.dataService.Documento().crear(documento).pipe(
        catchError(() => { this.dataService.SnackBar().msgError(DOCUMENTO_MESSAGE.CREAR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); }),
        map((response: any) => response)
      ).subscribe(response => {
        if (response && response.result) {
          this.renderer.setProperty(this.mineduInput.nativeElement, 'files', files);
          this.hasFiles = true;
          this.name = file.name;
          const documento = response.data;
          this.mineduUpload.emit(documento.codigoDocumento);
        } else {
          this.dataService.Message().msgError('No se pudo crear el documento que intenta adjuntar.', () => { });
          this.mineduUpload.emit(null);
        }
      });
    }
  }
}