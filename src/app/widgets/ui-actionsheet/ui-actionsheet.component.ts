import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { showActionSheet } from 'src/app/app.animation';

export interface Option {
  text: String,
  icon?: String,
  handler: Function
}

@Component({
  selector: 'app-ui-actionsheet',
  templateUrl: './ui-actionsheet.component.html',
  styleUrls: ['./ui-actionsheet.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: [ showActionSheet ]
})
export class UiActionsheetComponent implements AfterViewInit {
  status: String = 'closed';
  select: Observable<String> = new Observable();
  menu: HTMLElement | null = null;
  @Input('android') android: Boolean = false;
  @Input('title') title: String | undefined;
  @Input('description') description: String | undefined;
  @Input('items') items: Array<Option> = new Array();
  @Output('close') close: EventEmitter<Boolean> = new EventEmitter<Boolean>;

  ngAfterViewInit() {
    setTimeout( () => {
      this.status = 'opened';
      this.menu = document.getElementById('actionsheet-element');
      let component = <HTMLElement>document.getElementsByTagName('app-ui-actionsheet')[0];
      component.addEventListener('click', (elem: any) => {
        if (!this.menu?.contains(elem.target)) {
          this.dismiss();
        }
      })
    }, 100 );
  }

  selectItem (item: Option) {
    item.handler();
    this.dismiss();
  }

  dismiss(): void {
    this.close.emit();
  }
}
