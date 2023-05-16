import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'minedu-single-file-input-temp',
  templateUrl: './single-file-input-temp.component.html',
  styleUrls: ['./single-file-input-temp.component.scss']
})
export class SingleFileInputTempComponent implements OnInit {

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
    const usuario = this.dataService.Storage().getPassportUserData();
    if (!usuario) {
      this.dataService.Util().msgWarning('Datos de usuario no encontrado, por favor vuelva ingresar.', () => { });
      return;
    }

    if (files.length) {
      const file = files[0];
      if (!file.type.match(this.accept)) {
        this.dataService.Message().msgWarning('El tipo del archivo que intenta adjuntar no esta permitido.', () => { });
        return;
      }
      if (file.size >= this.maximumSize * 1024 * 1024) {
        this.dataService.Message().msgWarning('El tamaño del archivo que intenta adjuntar debe tener un tamaño máximo de ' + this.maximumSize + ' MB', () => { });
        return;
      }

      const documento = new FormData();
      documento.append('codigoSistema', environment.documentoConfig.CODIGO_SISTEMA);
      documento.append('descripcionDocumento', file.name);
      documento.append('codigoUsuarioCreacion', usuario.NOMBRES_USUARIO); //obtener del sso passport
      documento.append('archivo', file);
      const request = {
        documento: documento,
        files: files,
        file: file ,
      };

      this.uploadDocument(request);
    } else {
      this.dataService.Message().msgWarning('Seleccione el documento a adjuntar.', () => { this.eliminarDocumento(); });
    }
  }

  private uploadDocument(request) {
    if (!request) {
      this.dataService.Message().msgWarning('SELECCIONE EL DOCUMENTO A ADJUNTAR.', () => { this.eliminarDocumento(); });
    }
    
    this.dataService.Spinner().show("sp6");
    this.dataService.Spinner().hide("sp6");
    
    this.renderer.setProperty(this.mineduInput.nativeElement, 'files', request.files  );
    this.hasFiles = true;
    this.name = request.file.name;
    this.mineduUpload.emit(request);

    // this.dataService.Documento().crear(request.documento).pipe(
    //   catchError((error) => { 
    //     if (error && (error.statusCode === 401 || error.error === MISSING_TOKEN.INVALID_TOKEN)) {
    //       this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
    //     }else if (error && (error.statusCode === 422 || !error.result)) {
    //       this.dataService.Message().msgError(error.messages[0], () => { });
    //     }else {
    //       this.dataService.Message().msgError('No se pudo crear el documento que intenta adjuntar.', () => { });
    //       this.mineduUpload.emit(null);
    //     }
    //     return of(null); 
    //   }),
    //   finalize(() => { this.dataService.Spinner().hide("sp6"); }),
    //   map((response: any) => response)
    // ).subscribe(response => {
    //   if (response && response.result) {
    //     this.renderer.setProperty(this.mineduInput.nativeElement, 'files', request.files);
    //     this.hasFiles = true;
    //     this.name = request.file.name;
    //     const documento = response.data;
    //     this.mineduUpload.emit(documento.codigoDocumento);
    //   }
      // else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
      //   this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
      // }else if (response && (response.statusCode === 422 || !response.result)) {
      //   this.dataService.Message().msgError(response.messages[0], () => { });
      // }else {
      //   this.dataService.Message().msgError('No se pudo crear el documento que intenta adjuntar.', () => { });
      //   this.mineduUpload.emit(null);
      // }
  //  });
  }

}
