import { Injectable } from '@angular/core';
import { WebStorageService } from './web-storage.service';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    constructor(private storageService: WebStorageService) { }

    // Set the json data to local 
    setItem(key: string, value: any) {
        this.storageService.secureStorage.setItem(key, value);
    }
    // Get the json value from local 
    getItem(key: string) {
        var result = this.storageService.secureStorage.getItem(key);
        return result;
    }

    // Clear the local 
    clear() {
        return this.storageService.secureStorage.clear();
    }

    // Remove the json value from local 
    removeItem(key: string) {
        return this.storageService.secureStorage.removeItem(key);
    }
}
