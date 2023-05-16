import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as _ from 'lodash';

import { MineduNavigationItem } from '@minedu/types/minedu-navigation';

@Injectable({
    providedIn: 'root'
})
export class MineduNavigationService
{
    onItemCollapsed: Subject<any>;
    onItemCollapseToggled: Subject<any>;

    private _onNavigationChanged: BehaviorSubject<any>;
    private _onNavigationRegistered: BehaviorSubject<any>;
    private _onNavigationUnregistered: BehaviorSubject<any>;
    private _onNavigationItemAdded: BehaviorSubject<any>;
    private _onNavigationItemUpdated: BehaviorSubject<any>;
    private _onNavigationItemRemoved: BehaviorSubject<any>;

    private _currentNavigationKey: string;
    private _registry: { [key: string]: any } = {};

    constructor()
    {
        this.onItemCollapsed = new Subject();
        this.onItemCollapseToggled = new Subject();
        this._currentNavigationKey = null;
        this._onNavigationChanged = new BehaviorSubject(null);
        this._onNavigationRegistered = new BehaviorSubject(null);
        this._onNavigationUnregistered = new BehaviorSubject(null);
        this._onNavigationItemAdded = new BehaviorSubject(null);
        this._onNavigationItemUpdated = new BehaviorSubject(null);
        this._onNavigationItemRemoved = new BehaviorSubject(null);
    }

    get onNavigationChanged(): Observable<any>
    {
        return this._onNavigationChanged.asObservable();
    }

    get onNavigationRegistered(): Observable<any>
    {
        return this._onNavigationRegistered.asObservable();
    }

    get onNavigationUnregistered(): Observable<any>
    {
        return this._onNavigationUnregistered.asObservable();
    }

    get onNavigationItemAdded(): Observable<any>
    {
        return this._onNavigationItemAdded.asObservable();
    }

    get onNavigationItemUpdated(): Observable<any>
    {
        return this._onNavigationItemUpdated.asObservable();
    }

    get onNavigationItemRemoved(): Observable<any>
    {
        return this._onNavigationItemRemoved.asObservable();
    }

    register(key, navigation): void
    {
        if ( this._registry[key] )
        {           
            return;
        }
        this._registry[key] = navigation;
        this._onNavigationRegistered.next([key, navigation]);
    }
    
    unregister(key): void
    {
        if ( !this._registry[key] )
        {
            console.warn(`The navigation with the key '${key}' doesn't exist in the registry.`);
        }

        delete this._registry[key];
        this._onNavigationUnregistered.next(key);
    }

    getNavigation(key): any
    {
        if ( !this._registry[key] )
        {
            console.warn(`The navigation with the key '${key}' doesn't exist in the registry.`);
            return;
        }
        return this._registry[key];
    }

    getFlatNavigation(navigation, flatNavigation: MineduNavigationItem[] = []): any
    {
        for ( const item of navigation )
        {
            if ( item.type === 'item' )
            {
                flatNavigation.push(item);
                continue;
            }

            if ( item.type === 'collapsable' || item.type === 'group' )
            {
                if ( item.children )
                {
                    this.getFlatNavigation(item.children, flatNavigation);
                }
            }
        }

        return flatNavigation;
    }

    getCurrentNavigation(): any
    {
        if ( !this._currentNavigationKey )
        {
            console.warn(`The current navigation is not set.`);
            return;
        }

        return this.getNavigation(this._currentNavigationKey);
    }

    setCurrentNavigation(key): void
    {
        if ( !this._registry[key] )
        {
            console.warn(`The navigation with the key '${key}' doesn't exist in the registry.`);
            return;
        }

        this._currentNavigationKey = key;
        this._onNavigationChanged.next(key);
    }

    getNavigationItem(id, navigation = null): any | boolean
    {
        if ( !navigation )
        {
            navigation = this.getCurrentNavigation();
        }

        for ( const item of navigation )
        {
            if ( item.id === id )
            {
                return item;
            }
            if ( item.children )
            {
                const childItem = this.getNavigationItem(id, item.children);

                if ( childItem )
                {
                    return childItem;
                }
            }
        }

        return false;
    }

    getNavigationItemParent(id, navigation = null, parent = null): any
    {
        if ( !navigation )
        {
            navigation = this.getCurrentNavigation();
            parent = navigation;
        }

        for ( const item of navigation )
        {
            if ( item.id === id )
            {
                return parent;
            }

            if ( item.children )
            {
                const childItem = this.getNavigationItemParent(id, item.children, item);

                if ( childItem )
                {
                    return childItem;
                }
            }
        }

        return false;
    }

    addNavigationItem(item, id): void
    {
        const navigation: any[] = this.getCurrentNavigation();
        if ( id === 'end' )
        {
            navigation.push(item);
            this._onNavigationItemAdded.next(true);
            return;
        }
        if ( id === 'start' )
        {
            navigation.unshift(item);
            this._onNavigationItemAdded.next(true);

            return;
        }
        const parent: any = this.getNavigationItem(id);

        if ( parent )
        {
            if ( !parent.children )
            {
                parent.children = [];
            }
            parent.children.push(item);
        }
        this._onNavigationItemAdded.next(true);
    }

    updateNavigationItem(id, properties): void
    {
        const navigationItem = this.getNavigationItem(id);
        if ( !navigationItem )
        {
            return;
        }
        _.merge(navigationItem, properties);
        this._onNavigationItemUpdated.next(true);
    }

    removeNavigationItem(id): void
    {
        const item = this.getNavigationItem(id);
        if ( !item )
        {
            return;
        }

        let parent = this.getNavigationItemParent(id);       
        parent = parent.children || parent;
        parent.splice(parent.indexOf(item), 1);
        this._onNavigationItemRemoved.next(true);
    }
}
