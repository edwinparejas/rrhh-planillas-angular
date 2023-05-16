import { Injectable } from '@angular/core';
import { MineduNavigationItem } from '@minedu/types/minedu-navigation';


@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    constructor() { }

    private comparator(item1, item2, key) {
        const obj1 = item1[key];
        const obj2 = item2[key];
        if (obj1 < obj2) {
            return -1
        }
        if (obj1 > obj2) {
            return 1
        }
        return 0
    }

    setChildrens(data: any[], item: any): any {
        let urlParent = item.URL;
        let childs = data.filter(f => f.ID_MENU_PADRE === item.ID_MENU).sort((first, secund) => this.comparator(first, secund, 'ORDEN_MENU'));

        if (childs.length > 0) {
            let children = [];

            childs.map(child => {
                child.URL = urlParent + '/' + child.URL;
                let menu = this.setChildrens(data, child);

                children.push(menu);
            });


            return {
                id: item.ID_MENU,
                title: item.NOMBRE_MENU,
                type: 'collapsable',
                icon: item.NOMBRE_ICONO,
                children: children
            };

        }
        else
            return {
                id: item.ID_MENU,
                title: item.NOMBRE_MENU,
                type: 'item',
                icon: item.NOMBRE_ICONO,
                url: item.URL
            };
    }

    setNavigation(data: any[]): MineduNavigationItem[] {
        const parents = data.filter(f => f.ID_MENU_PADRE === 0).sort((first, secund) => this.comparator(first, secund, 'ORDEN_MENU'));

        let children = [];

        children.push({
            id: 0,
            title: "Inicio",
            type: "item",
            icon: 'home',
            url: "/ayni/personal/inicio",
        });

        parents.map(parent => {

            parent.URL = '/ayni/personal/' + parent.URL;
            let child = this.setChildrens(data, parent);
            children.push(child);

        });

        let navigation: MineduNavigationItem[] = [{
            id: 'applications',
            title: 'Opciones',
            type: 'group',
            icon: 'apps',
            children: children
        }];
        return navigation;
    }
}
