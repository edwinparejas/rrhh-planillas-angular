import { Component, OnInit, Input, Output, EventEmitter, ContentChildren, QueryList, ViewChild, ViewEncapsulation, AfterViewInit, AfterContentInit, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TemplateDirective } from '../../directives/template.directive';
import { MatPaginator } from '@angular/material/paginator';
import { tap } from 'rxjs/operators';
import { mineduAnimations } from '@minedu/animations/animations';
import { Observable } from 'rxjs';
@Component({
    selector: 'minedu-grilla-actividad',
    templateUrl: './grilla-actividad.component.html',
    styleUrls: ['./grilla-actividad.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class GrillaActividadComponent implements OnInit, AfterContentInit, OnChanges {
    @Input() emptyRowsMsg: string = 'No se encontraron resultados';
    @Input() loading: boolean;
    @Input() definition: IGrillaDefinition;
    @Input() source: IGrillaSource<any>;
    @Input() pageSizeOptions = [10, 25, 50, 100];
    @Output() loadData: EventEmitter<any> = new EventEmitter();
 


    displayedColumns: string[];
    @ContentChildren(TemplateDirective) templates: QueryList<TemplateDirective>;
    customTemplates: any = {};
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.source) {
            const source = changes?.source?.currentValue;
            this.paginator.pageIndex = (source?.paginaActual - 1);
        }
    }

    ngOnInit(): void {
        this.displayedColumns = this.definition.columns.map(x => x.field);
        this.buildPaginators(this.paginator);

    }

    ngAfterContentInit(): void {
        const customColumns = this.definition.columns
            .filter(x => x.template);
        if (customColumns.length > 0) {
            customColumns.forEach(x => {
                const matches = this.templates
                    .filter(temp => temp.getType() == x.template);
                if (matches.length > 0) {
                    this.customTemplates[x.template] = matches[0].template;
                }
            });
        }


        this.paginator.page.pipe(tap((event) => {
            this.loadData.emit(event);
        })).subscribe();
    }



    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) { return `0 de ${length}`; }

            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length ?
                Math.min(startIndex + pageSize, length) :
                startIndex + pageSize;

            return `${startIndex + 1} – ${endIndex} de ${(length)}`;
        }
    }

}
export interface IGrillaSource<T> {
    items: T[];
    paginaActual?: number;
    tamanioPagina?: number;
    total?: number;
    orderBy?: string;
    orderDir?: string;
    skip?: number;
}
export interface IGrillaDefinition {
    columns: IGrillaColumnDefinition[];
    editable?: boolean;
}
export interface IGrillaColumnDefinition {
    field: string;
    label?: string;
    template?: string;
    isDatetime?: boolean;
}
export interface IGrillaEvent {
    page: number;
    pageSize: number;
    orderBy: string;
    orderDir: string;
    skip?: number;
}
