import { Injectable } from '@angular/core';

import { MineduSidebarComponent } from './sidebar.component';

@Injectable({
    providedIn: 'root'
})
export class MineduSidebarService
{
    private _registry: { [key: string]: MineduSidebarComponent } = {};

    constructor()
    {

    }

    register(key, sidebar): void
    {
        if ( this._registry[key] )
        {
            return;
        }
        this._registry[key] = sidebar;
    }

    unregister(key): void
    {
        if ( !this._registry[key] )
        {
            console.warn(`The sidebar with the key '${key}' doesn't exist in the registry.`);
        }
        delete this._registry[key];
    }

    getSidebar(key): MineduSidebarComponent
    {
        if ( !this._registry[key] )
        {
            console.warn(`The sidebar with the key '${key}' doesn't exist in the registry.`);

            return;
        }
        return this._registry[key];
    }
}
