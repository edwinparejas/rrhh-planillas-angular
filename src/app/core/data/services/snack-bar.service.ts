import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class SnackBarService {

    timeOut = 10000;
    private msgQueue = [];
    private isInstanceVisible = false;

    constructor(public snackBar: MatSnackBar) {
    }

    private showNext() {
        if (this.msgQueue.length === 0) {
            return;
        }

        let sbMessage = this.msgQueue.shift();
        this.isInstanceVisible = true;

        this.snackBar.open(sbMessage.message, sbMessage.action, {
            duration: this.timeOut,
            verticalPosition: 'top', // 'top' | 'bottom'
            horizontalPosition: 'right', //'start' | 'center' | 'end' | 'left' | 'right'
            panelClass: ['message-snackbar', sbMessage.className],
        }).afterDismissed().subscribe(() => {
            this.isInstanceVisible = false;
            this.showNext();
        });

    }

    private add(message: string, action?: string, className?: string): void {
        let sbMessage = new SnackBarMessage();
        sbMessage.message = message;
        sbMessage.action = action;
        sbMessage.className = className;

        this.msgQueue.push(sbMessage);
        if (!this.isInstanceVisible) {
            this.showNext();
        }
    }

    msgError(message: string, action?: string): void {
        this.add(message, action, 'error');
    }

    msgWarning(message: string, action?: string): void {
        this.add(message, action, 'warning');
    }

    msgInformation(message: string, action?: string): void {
        this.add(message, action, 'info');
    }

    msgSuccess(message: string, action?: string): void {
        this.add(message, action, 'success');
    }
}


export class SnackBarMessage {
    message: string;
    action: string = null;
    className: string = null;
}