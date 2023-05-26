import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Veiculo } from 'src/app/services/cliente/veiculos.service';
import { LoginService } from 'src/app/services/login.service';
import { Perfil, PerfilService } from 'src/app/services/motorista/perfil.service';
import { Option, UiActionsheetComponent } from 'src/app/widgets/ui-actionsheet/ui-actionsheet.component';
import { UiMessagemodalComponent } from 'src/app/widgets/ui-messagemodal/ui-messagemodal.component';

@Component({
  selector: 'app-motorista',
  templateUrl: './motorista.component.html',
  styleUrls: ['./motorista.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MotoristaComponent implements OnInit {
  @ViewChild('overlay', { read: ViewContainerRef }) overlayElem!: ViewContainerRef;
  actionSheetElem: ComponentRef<UiActionsheetComponent> | undefined;
  messageModalElem: ComponentRef<UiMessagemodalComponent> | undefined;
  protected menu: Boolean | undefined;
  public perfil: Perfil | undefined;
  public veiculos: Veiculo[] | undefined;
  private actionSheetOpened: Boolean = false;
  
  constructor(
    protected app: AppComponent,
    private perfilService: PerfilService,
    private loginService: LoginService
  ){}

  ngOnInit(): void {
    this.app.setStatus(true);
    this.perfilService.get().subscribe(
      (perfil) => {
        this.app.setStatus(false);
        if (perfil.success) {
          this.perfil = perfil.perfil;
          this.veiculos = perfil.veiculos;
        }
      }
    )
  }

  openActionSheet(title: String, description: String | null, options: Array<Option>): void {
    if (this.overlayElem) {
      this.overlayElem.clear();
      this.actionSheetOpened = true;
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
      this.actionSheetOpened = false;
      this.overlayElem.clear();
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
    if (this.overlayElem && !this.actionSheetOpened) {
      this.overlayElem.clear();
    }
  }

  logout(): void {
    this.loginService.logout();
  }
}
