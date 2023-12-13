import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataService } from './services/data.service';
import { LoginService } from './services/login.service';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NotificacoesComponent } from './pages/cliente/notificacoes/notificacoes.component';
import { NotificacoesService } from './services/cliente/notificacoes.service';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { PerfilComponent } from './pages/cliente/perfil/perfil.component';
import { SenhaComponent } from './pages/cliente/senha/senha.component';
import { HistoricoComponent } from './pages/cliente/historico/historico.component';
import { HistoricoListaComponent } from './pages/cliente/historico/lista/lista/lista.component';
import { HistoricoDesenhoComponent } from './pages/cliente/historico/desenho/desenho/desenho.component';
import { UiMessagemodalComponent } from './widgets/ui-messagemodal/ui-messagemodal.component';
import { HistoricoReplayComponent } from './pages/cliente/historico/replay/replay/replay.component';
import { HistoricoParadasComponent } from './pages/cliente/historico/paradas/paradas/paradas.component';
import { VeiculosListaComponent } from './pages/cliente/veiculos/lista/lista.component';
import { VeiculosCercasComponent } from './pages/cliente/veiculos/cercas/cercas.component';
import { CercasMapaComponent } from './pages/cliente/veiculos/cercas/mapa/mapa.component';
import { VeiculosMapaComponent } from './pages/cliente/veiculos/mapa/mapa/mapa.component';
import { VeiculosMapaAlertasComponent } from './pages/cliente/veiculos/mapa/alertas/alertas.component';
import { NgxMaskModule } from 'ngx-mask';
import { CompartilharComponent } from './pages/cliente/compartilhar/compartilhar.component';
import { CompartilharCreateComponent } from './pages/cliente/compartilhar/create/create.component';
import { ToKm } from './replace.pipe';
import { ToDate } from './formate-date.pipe';
import { HistoricoViagensComponent } from './pages/cliente/historico/viagens/viagens/viagens.component';
import { MotoristaComponent } from './pages/motorista/motorista.component';
import { HomeComponent } from './pages/motorista/home/home.component';
import { CombustivelComponent } from './pages/motorista/combustivel/combustivel.component';
import { CombustivelCreateComponent } from './pages/motorista/combustivel/create/create.component';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { ToCnpj } from './format-cnpj.pipe';
import { RotasComponent } from './pages/motorista/rotas/rotas.component';
import { RotasDetalhesComponent } from './pages/motorista/rotas/detalhes/detalhes.component';


registerLocaleData(localePt, 'pt');

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotificacoesComponent,
    ClienteComponent,
    PerfilComponent,
    SenhaComponent,
    HistoricoComponent,
    HistoricoListaComponent,
    HistoricoDesenhoComponent,
    UiMessagemodalComponent,
    HistoricoReplayComponent,
    HistoricoParadasComponent,
    VeiculosListaComponent,
    VeiculosCercasComponent,
    CercasMapaComponent,
    VeiculosMapaComponent,
    VeiculosMapaAlertasComponent,
    CompartilharComponent,
    CompartilharCreateComponent,
    ToKm,
    ToDate,
    ToCnpj,
    HistoricoViagensComponent,
    MotoristaComponent,
    HomeComponent,
    CombustivelComponent,
    CombustivelCreateComponent,
    RotasComponent,
    RotasDetalhesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxMaskModule.forRoot()
  ],
  providers: [
    DataService,
    LoginService,
    NotificacoesService,
    {
      provide: LOCALE_ID,
      useValue: 'pt'
    },
    {provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
