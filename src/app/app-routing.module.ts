import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { CompartilharComponent } from './pages/cliente/compartilhar/compartilhar.component';
import { CompartilharCreateComponent } from './pages/cliente/compartilhar/create/create.component';
import { HistoricoDesenhoComponent } from './pages/cliente/historico/desenho/desenho/desenho.component';
import { HistoricoComponent } from './pages/cliente/historico/historico.component';
import { HistoricoListaComponent } from './pages/cliente/historico/lista/lista/lista.component';
import { HistoricoParadasComponent } from './pages/cliente/historico/paradas/paradas/paradas.component';
import { HistoricoReplayComponent } from './pages/cliente/historico/replay/replay/replay.component';
import { HistoricoViagensComponent } from './pages/cliente/historico/viagens/viagens/viagens.component';
import { NotificacoesComponent } from './pages/cliente/notificacoes/notificacoes.component';
import { PerfilComponent } from './pages/cliente/perfil/perfil.component';
import { SenhaComponent } from './pages/cliente/senha/senha.component';
import { VeiculosCercasComponent } from './pages/cliente/veiculos/cercas/cercas.component';
import { CercasMapaComponent } from './pages/cliente/veiculos/cercas/mapa/mapa.component';
import { VeiculosListaComponent } from './pages/cliente/veiculos/lista/lista.component';
import { VeiculosMapaAlertasComponent } from './pages/cliente/veiculos/mapa/alertas/alertas.component';
import { VeiculosMapaComponent } from './pages/cliente/veiculos/mapa/mapa/mapa.component';
import { LoginComponent } from './pages/login/login.component';
import { LoginService } from './services/login.service';
import { MotoristaComponent } from './pages/motorista/motorista.component';
import { HomeComponent } from './pages/motorista/home/home.component';
import { CombustivelComponent } from './pages/motorista/combustivel/combustivel.component';
import { CombustivelCreateComponent } from './pages/motorista/combustivel/create/create.component';
import { RotasComponent } from './pages/motorista/rotas/rotas.component';
import { RotasDetalhesComponent } from './pages/motorista/rotas/detalhes/detalhes.component';
import { RotasCheckinComponent } from './pages/motorista/rotas/checkin/checkin.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login', data: { animation: 'RedirectPage' } },
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'LoginPage' }
  },
  {
    path: 'motorista',
    component: MotoristaComponent,
    canActivate: [() => inject(LoginService).isAuth() ],
    data: { animation: 'MotoristaPage' },
    children: [
      {
        path: 'home',
        component: HomeComponent,
        data: { animation: 'MotoristaHomePage' },
        children: [
          {
            path: 'combustivel',
            component: CombustivelComponent,
            data: { animation: 'MotoristaCombustivelPage' }
          },
          {
            path: 'combustivel/create',
            component: CombustivelCreateComponent,
            data: { animation: 'MotoristaCombustivelCreatePage' }
          },
          {
            path: 'rotas',
            component: RotasComponent,
            data: { animation: 'MotoristaCombustivelPage' }
          },
          {
            path: 'rotas/detalhes',
            component: RotasDetalhesComponent,
            data: { animation: 'MotoristaCombustivelCreatePage' }
          },
          {
            path: 'rotas/checkin',
            component: RotasCheckinComponent,
            data: { animation: 'MotoristaCombustivelCreatePage' }
          }
        ]
      }
    ]
  },
  {
    path: 'cliente',
    component: ClienteComponent,
    canActivate: [() => inject(LoginService).isAuth() ],
    data: { animation: 'ClientePage' },
    children: [
      {
        path: 'veiculos',
        component: VeiculosListaComponent,
        data: { animation: 'VeiculosListaPage' },
        children: [
          {
            path: 'cercas',
            component: VeiculosCercasComponent,
            data: { animation: 'VeiculosCercasPage' }
          },
          {
            path: 'cercas/mapa',
            component: CercasMapaComponent,
            data: { animation: 'CercasMapaPage' }
          },
          {
            path: 'mapa',
            component: VeiculosMapaComponent,
            data: { animation: 'VeiculosMapaPage' }
          },
          {
            path: 'mapa/alertas',
            component: VeiculosMapaAlertasComponent,
            data: { animation: 'VeiculosMapaAlertasPage' }
          }
        ]
      },
      {
        path: 'notificacoes',
        component: NotificacoesComponent,
        data: { animation: 'NotificacoesPage' }
      },
      {
        path: 'historico',
        component: HistoricoComponent,
        data: { animation: 'HistoricoPage' }
      },
      {
        path: 'historico/lista',
        component: HistoricoListaComponent,
        data: { animation: 'HistoricoListaPage' }
      },
      {
        path: 'historico/desenho',
        component: HistoricoDesenhoComponent,
        data: { animation: 'HistoricoDesenhoPage' }
      },
      {
        path: 'historico/replay',
        component: HistoricoReplayComponent,
        data: { animation: 'HistoricoReplayPage' }
      },
      {
        path: 'historico/paradas',
        component: HistoricoParadasComponent,
        data: { animation: 'HistoricoParadasPage' }
      },
      {
        path: 'historico/viagens',
        component: HistoricoViagensComponent,
        data: { animation: 'HistoricoViagensPage' }
      },
      {
        path: 'perfil',
        component: PerfilComponent
      },
      {
        path: 'senha',
        component: SenhaComponent
      },
      {
        path: 'compartilhar',
        component: CompartilharComponent,
        data: { animation: 'CompartilharPage' }
      },
      {
        path: 'compartilhar/create',
        component: CompartilharCreateComponent,
        data: { animation: 'CompartilharCreatePage' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
