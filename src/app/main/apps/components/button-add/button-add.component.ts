import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup } from '@angular/forms';

@Component({
    selector: "minedu-button-add",
    templateUrl: "./button-add.component.html",
    styleUrls: ["./button-add.component.scss"],
})
export class ButtonAddComponent implements OnInit {
    @Input()
    disabled = false;

    @Input()
    mineduForm: FormGroup;

    @Output()
    onAddEvent: EventEmitter<any> = new EventEmitter<any>();

    constructor() {}

    ngOnInit() {}

    // onClickChild(e) {
    //     if (this.disabled) return false;
    //     this.onAddEvent.emit(e);
    // }

    onClickChild(event) {
        if (!this.mineduForm.valid) {
          event.preventDefault();
        }
        if (this.onAddEvent) {
          this.onAddEvent.next(event);
        }
      }
}
