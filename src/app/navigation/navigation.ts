import { MineduNavigation } from "@minedu/types/minedu-navigation";

export const navigation: MineduNavigation[] = [
    {
        id: "applications",
        title: "Maestros",
        type: "group",
        icon: "apps",
        children: [
            {
                id: "pdp",
                title: "Procesos de personal",
                type: "collapsable",
                icon: "view_list",
                children: [
                    {
                        id: "cdp",
                        title: "Maestro de haberes y descuento",
                        type: "item",
                        url: "/ayni/personal/planillas/maestros/haberes",
                    },
                    {
                        id: "contra",
                        title: "maestro de AFP",
                        type: "item",
                        url: "/ayni/personal/planillas/maestros/afp",
                    }           
                ],
            },
        ]
        
        // children: [
        //     {
        //         id: "pdp",
        //         title: "Procesos de personal",
        //         type: "collapsable",
        //         icon: "settings",
        //         children: [
        //             {
        //                 id: "cdp",
        //                 title: "Configuración",
        //                 type: "item",
        //                 icon: "settings_applications",
        //                 url: "/ayni/personal/procesos/configuracion",
        //             },
        //             {
        //                 id: "contra",
        //                 title: "Contratación",
        //                 type: "item",
        //                 icon: "settings_applications",
        //                 url: "/ayni/personal/procesos/contratacion",
        //             },     
        //             {
        //                 id: "asc",
        //                 title: "Ascensos",
        //                 type: "item",
        //                 icon: "settings_applications",
        //                 url: "/ayni/personal/procesos/ascenso",
        //             },               
        //         ],
        //     },
        //     {
        //         id: "adp",
        //         title: "Acciones de personal",
        //         type: "collapsable",
        //         icon: "groups",
        //         children: [
        //             {
        //                 id: "adpv",
        //                 title: "Vinculación",
        //                 type: "item",
        //                 icon: "device_hub",
        //                 url: "/ayni/personal/acciones/vinculacion",
        //             },
        //             {
        //                 id: "adpcga",
        //                 title: "Contratos y adendas",
        //                 type: "item",
        //                 icon: "file_copy",
        //                 url: "/ayni/personal/acciones/contrato-adenda",
        //             },
        //             {
        //                 id: "adpoa",
        //                 title: "Otras acciones",
        //                 type: "item",
        //                 icon: "scatter_plot",
        //                 url: "/ayni/personal/acciones/otras-acciones",
        //             }
        //         ],
        //     },
        //     {
        //         id: "aaa",
        //         title: "Asistencia",
        //         type: "collapsable",
        //         icon: "date_range",
        //         url: "/ayni/personal/asistencia/",
        //         children: [
        //             {
        //                 id: "bbb",
        //                 title: "Control de asistencia mensual",
        //                 type: "item",
        //                 icon: "",
        //                 url: "/ayni/personal/asistencia/bandeja",
        //             },
        //             {
        //                 id: "ccc",
        //                 title: "Control de asistencia consolidado",
        //                 type: "item",
        //                 icon: "",
        //                 url: "/ayni/personal/asistencia/consolidado",
        //             },
        //         ],
        //     },
        //     {
        //         id: "licencias",
        //         title: "Licencias",
        //         type: "collapsable",
        //         icon: "search",
        //         url: "/ayni/personal/licencias/",
        //         children: [
        //             {
        //                 id: "lll",
        //                 title: "Lic. goce por salud y maternidad",
        //                 type: "item",
        //                 icon: "",
        //                 url: "/ayni/personal/licencias/gestion-licencia",
        //             },
        //             {
        //                 id: "ll92",
        //                 title: "Lic. goce otros y Sin Goce",
        //                 type: "item",
        //                 icon: "",
        //                 url: "/ayni/personal/licencias/licencias-otras",
        //             },
        //         ],
        //     },
        //     {
        //         id: "bandejas",
        //         title: "Bandejas",
        //         type: "collapsable",
        //         icon: "search",
        //         children: [
        //             {
        //                 id: "alertas",
        //                 title: "Alertas",
        //                 type: "item",
        //                 icon: "search",
        //                 url: "/ayni/personal/bandejas/alertas/",
        //             },
        //             {
        //                 id: "actividades",
        //                 title: "Actividades",
        //                 type: "item",
        //                 icon: "search",
        //                 url: "/ayni/personal/bandejas/actividades/",
        //             },
        //             {
        //                 id: "solicitudesatenciones",
        //                 title: "Bandeja de Solicitudes y Atenciones",
        //                 type: "item",
        //                 icon: "search",
        //                 url: "/ayni/personal/bandejas/solicitudesatenciones/",
        //             }
        //             // {
        //             //     id: "atenciones",
        //             //     title: "Atenciones",
        //             //     type: "item",
        //             //     icon: "search",
        //             //     url: "/ayni/personal/bandejas/atenciones/",
        //             // }
        //         ],
        //     },
        //     {
        //         id: "faltas-sanciones",
        //         title: "Faltas y sanciones",
        //         type: "collapsable",
        //         icon: "search",
        //         url: "/ayni/personal/faltas-sanciones/",
        //         children: [
        //             {
        //                 id: "fffsss",
        //                 title: "Gestión de faltas y sanciones",
        //                 type: "item",
        //                 icon: "",
        //                 url: "/ayni/personal/faltas-sanciones/gestion-faltas-sanciones",
        //             },
        //         ],
        //     },
        // ],
    },
];
