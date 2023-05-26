import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { MotoristaComponent } from '../motorista.component';
import { PerfilService } from 'src/app/services/motorista/perfil.service';
import { ActivatedRoute, ChildrenOutletContexts, Router } from '@angular/router';
import { showRouterPainelMotoristas, slideOutAnimation, slideOutAnimationMotorista } from 'src/app/app.animation';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [slideOutAnimationMotorista]
})
export class HomeComponent implements OnInit, OnDestroy {
  photo: string = '';
  routerPainelMotoristaLoaded: String | undefined;
  constructor (
    private app: AppComponent,
    protected motorista: MotoristaComponent,
    private router: Router,
    private route: ActivatedRoute,
    private contexts: ChildrenOutletContexts,
  ){
  }

  getRouteAnimationData() {
    this.routerPainelMotoristaLoaded = this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    // console.log('dev-rlv', this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation']);
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  protected openCombustivel() {
    this.router.navigate(['motorista/home/combustivel'], { queryParams: { veiculo: undefined } });
  }

  protected openQRCode() {
    this.motorista.openMessage(false, 'Essa função ainda não está disponível');
  }

  protected exit() {
    this.motorista.logout();
  }
}
