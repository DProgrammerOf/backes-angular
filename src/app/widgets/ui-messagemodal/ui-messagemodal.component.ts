import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { showMessageModal } from 'src/app/app.animation';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-ui-messagemodal',
  templateUrl: './ui-messagemodal.component.html',
  styleUrls: ['./ui-messagemodal.component.scss'],
  animations: [ showMessageModal ]
})
export class UiMessagemodalComponent implements AfterViewInit {
  constructor(protected app: AppComponent){}
  status: String = 'closed';
  @Input('message') text: String | undefined;
  @Input('error') error: Boolean | undefined;
  @Output('close') close: EventEmitter<Boolean> = new EventEmitter<Boolean>;

  ngAfterViewInit() {
    setTimeout( () => this.status = 'opened', 100 );
    setTimeout( () => this.dismiss(), 3000 );
  }

  dismiss(): void {
    this.status = 'closed';
    setTimeout( () => this.close.emit(), 200 );
  }
}
