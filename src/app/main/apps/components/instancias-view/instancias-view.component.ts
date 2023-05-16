import { SelectionModel } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";
import { HttpErrorResponse } from "@angular/common/http";
import {
    AfterViewInit,
    Component,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
    MatTreeFlattener,
    MatTreeFlatDataSource,
} from "@angular/material/tree";
import { Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { InstanciaModel } from "app/core/model/security/passport-rol.model";
import { TablaEquivalenciaSede } from "app/core/model/types";
import { SharedService } from "app/core/shared/shared.service";
import { Subject } from "rxjs";
import { of } from "rxjs";
import { catchError, debounceTime, distinctUntilChanged, finalize } from "rxjs/operators";
import { MESSAGE_GESTION } from "../../gestion/_utils/messages";
import { BandejaRotacionComponent } from '../../procesos/rotacion/bandeja-rotacion/bandeja-rotacion.component';

@Component({
    selector: "minedu-instancias-view",
    templateUrl: "./instancias-view.component.html",
    styleUrls: ["./instancias-view.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InstanciasViewComponent implements OnInit, AfterViewInit {
    form: FormGroup;
    @ViewChild("tree") tree;
    treeData: any[] = [];
    searchFilter: Subject<string> = new Subject<string>();
    

    flatNodeMap = new Map<ItemFlatNode, ItemNode>();
    nestedNodeMap = new Map<ItemNode, ItemFlatNode>();
    selectedParent: ItemFlatNode | null = null;

    newItemName = "";
    treeControl: FlatTreeControl<ItemFlatNode>;
    treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;
    dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;
    checklistSelection = new SelectionModel<ItemFlatNode>(true);

    getLevel = (node: ItemFlatNode) => node.level;
    isExpandable = (node: ItemFlatNode) => node.expandable;
    getChildren = (node: ItemNode): ItemNode[] => node.children;
    hasChild = (_: number, _nodeData: ItemFlatNode) => _nodeData.expandable;
    // hasNoContent = (_: number, _nodeData: ItemFlatNode) => _nodeData.item === "";
    hasNoContent = (_: number, _nodeData: ItemFlatNode) => _nodeData.item === null;


    selectedItem: string = "";

    constructor(
        public matDialogRef: MatDialogRef<InstanciasViewComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        private _sharedService: SharedService,
        private formBuilder: FormBuilder,
        private _router: Router
    ) { }

    ngOnInit(): void {
        // this.dataService.Storage().setInstanciaSelected(null);
        this.buildForm();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            filtroInstancia: [null]
        });

        this.searchFilter.pipe(debounceTime(500), distinctUntilChanged())
            .subscribe(value => {
                if (value && value.length >= 2) {
                    this.search(value.toLowerCase());
                } else if (!value) {
                    this.resetTreeData();
                }
            });

        this.initialize();
    }

    initialize() {
        this.initializeTree();
        setTimeout(() => {
            this.dataService.Spinner().show("sp6");
            const instancia = this.dataService.Storage().getInstanciaSelected();
            if (instancia) {
                this.selectedItem = instancia.codigoInstancia;
            }
            this.getInstancias();
        }, 0);
    }

    resetTreeData() {
        const node = new ItemNode();
        node.item = {
            idDre: null,
            idUgel: null,
            descripcionInstancia: "MINEDU",
        };
        node.children = this.buildTree(this.treeData, 0);
        this.dataSource.data = [].concat(node);
        this.expandedNodes();
    }

    filterChanged(filter: string): void {
        this.searchFilter.next(filter);
    }

    search(filter: string): any {
        let filteredTreeData: any[] = [];
        this.treeData.map(item => {
            const subInstancias = item.subInstancias.filter(pred => pred.descripcionInstancia.toLowerCase().indexOf(filter) >= 0);
            if (subInstancias && subInstancias.length > 0) {
                filteredTreeData.push({
                    ...item,
                    subInstancias: subInstancias
                });
            }
        });
        const node = new ItemNode();
        node.item = {
            idDre: null,
            idUgel: null,
            descripcionInstancia: "MINEDU",
        };
        node.children = this.buildTree(filteredTreeData, 0);
        this.dataSource.data = [].concat(node);
        this.tree.treeControl.expandAll();
    }

    private expandedNodes() {
        this.tree.treeControl.dataNodes.filter(node => node.level === 0).forEach(node => {
            this.tree.treeControl.expand(this.tree.treeControl.dataNodes.find(n => n.level === node.level));
        });
    }

    ngAfterViewInit() {
        this.expandedNodes();
    }

    initializeTree() {
        this.treeFlattener = new MatTreeFlattener(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );
        this.treeControl = new FlatTreeControl<ItemFlatNode>(
            this.getLevel,
            this.isExpandable
        );
        this.dataSource = new MatTreeFlatDataSource(
            this.treeControl,
            this.treeFlattener
        );
        this.dataSource.data = [];
    }

    selected(node: ItemFlatNode) {
        //debugger;
        this.checklistSelection.isSelected(node);
        this.checklistSelection.toggle(node);
        const intancia = node.item;
        this.selectedItem = intancia.codigoInstancia;        
        //this.handleBandejaRotacion();
    }

    instanciaSelected(node: ItemFlatNode) {

        this.checklistSelection.isSelected(node);
        this.checklistSelection.toggle(node);

        const intancia = node.item;
        this.selectedItem = intancia.codigoInstancia;
        this.dataService.Storage().setInstanciaSelected(intancia);

        let sede = this.dataService.Storage().getPassportRolSelected();
        sede.NOMBRE_SEDE = intancia.descripcionInstancia;

        this._sharedService.sendSedeChanged(true);

        this.handleCancelar(true);
        
    }

    getInstancias() {
        const rol = this.dataService.Storage().getPassportRolSelected();
        this.dataService
            .Maestro()
            .getInstanciasAgrupadas()
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
                }),
                finalize(() => { this.dataService.Spinner().hide("sp6"); })
            ).subscribe((response) => {
                if (response.data && response.data.length > 0) {

                    // debugger;
                    if (rol.CODIGO_TIPO_SEDE == TablaEquivalenciaSede.CODIGO_TIPO_SEDE_DRE)
                        response.data = response.data.filter(x => x.codigoInstancia === rol.CODIGO_SEDE);

                    const node = new ItemNode();
                    node.item = {
                        idDre: null,
                        idUgel: null,
                        codigoTipoSede: 'TS005',
                        descripcionInstancia: "MINEDU",
                    };

                    this.treeData = response.data;
                    node.children = this.buildTree(response.data, 0);
                    this.dataSource.data = [].concat(node);
                    this.expandedNodes();
                } else {
                    this.dataSource.data = [];
                }
            });
    }

    buildTree(obj: any[], level: number): ItemNode[] {
        return obj.map((item) => {
            const node = new ItemNode();
            node.item = item;
            if (item.subInstancias) {
                node.children = this.buildTree(item.subInstancias, level + 1);
            }
            return node;
        });
    }

    transformer = (node: ItemNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode =
            existingNode && existingNode.item === node.item
                ? existingNode
                : new ItemFlatNode();
        flatNode.item = node.item;
        flatNode.level = level;
        flatNode.expandable = node.children && node.children.length > 0;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    };

    descendantsAllSelected(node: ItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        return descendants.every((child) =>
            this.checklistSelection.isSelected(child)
        );
    }

    descendantsPartiallySelected(node: ItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some((child) =>
            this.checklistSelection.isSelected(child)
        );
        return result && !this.descendantsAllSelected(node);
    }

    todoItemSelectionToggle(node: ItemFlatNode): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        this.checklistSelection.isSelected(node)
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);
    }

    handleCancelar(data?: any) {
        var instancia = this.dataService.Storage().getInstanciaSelected();
        if (instancia)
            this.matDialogRef.close(data);
        else
            this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_INSTANCIA_MONITOR);
    }

}

export class ItemNode {
    children: ItemNode[];
    item: InstanciaModel;
}

export class ItemFlatNode {
    item: InstanciaModel;
    level: number;
    expandable: boolean;
}
