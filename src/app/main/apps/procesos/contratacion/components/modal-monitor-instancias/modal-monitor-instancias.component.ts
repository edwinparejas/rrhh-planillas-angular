import { SelectionModel } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, of, Subject } from "rxjs";
import { catchError, finalize, debounceTime, distinctUntilChanged } from "rxjs/operators";
import { InstanciaModel } from "../../models/contratacion.model";

@Component({
    selector: "minedu-modal-monitor-instancias",
    templateUrl: "./modal-monitor-instancias.component.html",
    styleUrls: ["./modal-monitor-instancias.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalMonitorInstanciasComponent implements OnInit {
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
    hasNoContent = (_: number, _nodeData: ItemFlatNode) => _nodeData.item === "";

    selectedItem: string = "";

    codigoRol:string = null;
    codigoSede:string = null;
    codigoTipoSede:string = null;

    constructor(
        public matDialogRef: MatDialogRef<ModalMonitorInstanciasComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        private formBuilder: FormBuilder,
        private _router: Router
    ) { 
        this.codigoRol = this.data.codigoRol;
        this.codigoTipoSede = this.data.codigoTipoSede;
        this.codigoSede = this.data.codigoSede;
    }

    ngOnInit(): void {
        // console.log("Datos recibidos de DATA: ", this.data);
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
            // const instancia = this.dataService.Contrataciones().getInstanciaSelected();
            // if (instancia) {
            //     this.selectedItem = instancia.codigoInstancia;
            // }
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
        this.checklistSelection.isSelected(node);
        this.checklistSelection.toggle(node);
        const intancia = node.item;
        this.selectedItem = intancia.codigoInstancia;
    }

    instanciaSelected(node: ItemFlatNode) {

        // console.log("nodo Seleccionado",node);

        this.checklistSelection.isSelected(node);
        this.checklistSelection.toggle(node);

        const intancia = node.item;
        this.selectedItem = intancia.codigoInstancia;
        // this.dataService.Storage().setInstanciaSelected(intancia);
        this.dataService.Contrataciones().setInstanciaSelected(intancia);


        let sede = this.dataService.Storage().getPassportRolSelected();
        sede.NOMBRE_SEDE = intancia.descripcionInstancia;
        // this._sharedService.sendSedeChanged(true);
        let response = {
            codigoSede:node.item.codigoInstancia,
            codigoTipoSede:node.item.codigoTipoSede,
            idDre: node.item.idDre,
            idUgel:node.item.idUgel,
        };
        this.handleCancelar(response);
    }

    getInstancias() {
        var data = {
            activo:true,
            codigoTipoSede:this.codigoTipoSede,
            codigoRol:this.codigoRol,
            codigoSede:this.codigoSede // cambiar nombre segun estilo de backedn 
        };

        this.dataService
            .Contrataciones()
            .getInstancias(data)
            .pipe(
                catchError((e) => { return of(e); }),
                finalize(() => { this.dataService.Spinner().hide("sp6"); })
            ).subscribe((response) => {
                if (response && response.data) {
                    // console.log("1. ",response);
                    const node = new ItemNode();
                    node.item = {
                        idDre: null,
                        idUgel: null,
                        codigoTipoSede: 'TS005',
                        descripcionInstancia: "MINEDU",
                    };
                    // console.log("2. ",response);
                    this.treeData = response.data;
                    node.children = this.buildTree(response.data, 0);
                    this.dataSource.data = [].concat(node);
                    this.expandedNodes();
                    // console.log("3. ",response);
                } else if (response && (response.statusCode === 401 )) { // || response.error === MISSING_TOKEN.INVALID_TOKEN
                    this.dataService.Message().msgInfo("CERRAR SESION", () => { this.dataService.Storage().passportUILogin(); });
                } else {
                    this.dataSource.data = [];
                }
            });

            // console.log("Detalles de Sesion 150103",this.dataService.Storage().getPassportRolSelected());
            // var rolSession = this.dataService.Storage().getPassportRolSelected();
            // rolSession.CODIGO_SEDE = "150209";
            // this.dataService.Storage().setPassportRolSelected(rolSession);
            // console.log("Detalles de Sesion ¿150209??",this.dataService.Storage().getPassportRolSelected());


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
        // console.log("Datos retornados", data);
        this.matDialogRef.close(data);
        // if (data) { this._router.navigate(["ayni", "resoluciones"]); }
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

