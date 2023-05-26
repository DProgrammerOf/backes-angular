import { Component, ViewChild, ViewContainerRef, ComponentRef, OnInit } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';
import { slideInOutAnimation } from 'src/app/app.animation';
import { AppComponent } from 'src/app/app.component';
import { VeiculosService } from 'src/app/services/cliente/veiculos.service';
import { LoginService } from 'src/app/services/login.service';
import { UiActionsheetComponent, Option } from 'src/app/widgets/ui-actionsheet/ui-actionsheet.component';
import { UiMessagemodalComponent } from 'src/app/widgets/ui-messagemodal/ui-messagemodal.component';


@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss'],
  animations: [
    slideInOutAnimation
  ]
})
export class ClienteComponent implements OnInit {
  @ViewChild('overlay', { read: ViewContainerRef }) overlayElem!: ViewContainerRef;
  actionSheetElem: ComponentRef<UiActionsheetComponent> | undefined;
  messageModalElem: ComponentRef<UiMessagemodalComponent> | undefined;
  protected menu: Boolean | undefined;

  constructor(
    protected app: AppComponent,
    private contexts: ChildrenOutletContexts,
    private loginService: LoginService,
    private veiculosService: VeiculosService
  ) {
  }

  ngOnInit(): void {
    
  }

  getRouteAnimationData() {
    //console.log(this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation']);
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
  
  openActionSheet(title: String, description: String | null, options: Array<Option>): void {
    if (this.overlayElem) {
      this.overlayElem.clear();
      this.actionSheetElem = this.overlayElem.createComponent(UiActionsheetComponent);
      this.actionSheetElem.setInput('android', this.app.platform?.toLocaleLowerCase() == 'android');
      this.actionSheetElem.setInput('title', title);
      this.actionSheetElem.setInput('description', description);
      this.actionSheetElem.setInput('items', options);
      this.actionSheetElem.instance.close.subscribe( () => this.closeActionSheet() );
    }
  }

  closeActionSheet() {
    if (this.overlayElem) {
      this.overlayElem.clear();
    }
  }

  clickActionSheet(elem: any): void {
    console.log(elem);
    if(typeof elem == HTMLElement.toString()) {
      alert('is element html');
    }
  }
 
  openMessage(status: Boolean, text: String) {
    if (this.overlayElem) {
      this.overlayElem.clear();
      this.messageModalElem = this.overlayElem.createComponent(UiMessagemodalComponent);
      this.messageModalElem.setInput('message', text);
      this.messageModalElem.setInput('error', !status);
      this.messageModalElem.instance.close.subscribe( () => this.closeMessage() );
    }
  }

  closeMessage() {
    if (this.overlayElem) {
      this.overlayElem.clear();
    }
  }

  logout(): void {
    this.veiculosService.clear();
    this.loginService.logout();
  }

  setMenu(status: Boolean): void {
    if (this.menu === undefined && status === false) 
      return;
    
    this.menu = status;
  }
}
