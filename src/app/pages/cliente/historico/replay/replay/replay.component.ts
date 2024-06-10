import { Component, ElementRef, ViewChild } from '@angular/core';
import { HistoricoService, Localizacao } from 'src/app/services/cliente/historico.service';
import { ClienteComponent } from '../../../cliente.component';
import { Location } from '@angular/common';
import { Veiculo } from 'src/app/services/cliente/veiculos.service';
import { AppComponent } from 'src/app/app.component';

import 'leaflet';
import 'leaflet.markercluster';
import { first, last } from 'rxjs';
declare var L: any;

@Component({
  selector: 'app-replay',
  templateUrl: './replay.component.html',
  styleUrls: ['./replay.component.scss']
})
export class HistoricoReplayComponent {
  @ViewChild('map') mapElement: ElementRef | undefined;
  map: L.Map | undefined;
  titlePage: String = 'Replay';
  historico: Localizacao[] | undefined;

  // Replay
  posicao:any;
  veiculo: Veiculo | undefined;
  polyline: any = null;
  trajeto: Localizacao[] | undefined;
  trajetoPasso: number = 0;
  trajetoLatLng: L.LatLng[] = [];
  timerReplay: any = null;
  playReplay: boolean = false;
  velReplay: number = 600;

  // Infos Replay
  distance: any = 0;
  date: String | undefined;
  data: any = "00/00/0000";
  horario: any = "00:00";
  velocidade: any = 0;
  tempo: any = 0;
  paradas: any = 0;
  gasto: any = "";
  distancia: any = 0;

  // Calculate odometers diff diario
  diff: any = 0;
  diffType: String = 'none';

  constructor(
    protected app: AppComponent,
    protected base: ClienteComponent,
    private service: HistoricoService,
    protected location: Location
  ){
    this.trajeto = this.service.lastRota as Localizacao[];
    this.veiculo = this.service.lastVeiculo;
    this.gasto = this.service.lastRotaInfos?.gasto;
    this.tempo = this.service.lastRotaInfos?.tempomovimento;
    this.paradas = this.service.lastRotaInfos?.paradas;
    this.distancia = this.service.lastRotaInfos?.distancia ? this.service.lastRotaInfos?.distancia : 0;
  }

  ngOnInit(): void {
    if (this.trajeto) {
      var trajetoAllStr = "";
      this.trajeto.forEach( (posicao) => {
        this.trajetoLatLng.push(
          new L.LatLng(
            parseFloat(posicao.latitudeDecimalDegrees.toString()),
            parseFloat(posicao.longitudeDecimalDegrees.toString())
          )
        );
        trajetoAllStr += posicao.latitudeDecimalDegrees + "," + posicao.longitudeDecimalDegrees + ";";
      });
      //console.log(trajetoAllStr);
      //  Preenchendo infos
      this.velocidade = this.trajeto[0].speed;
     // let dateParse = this.trajeto[0].date.split(' ');
      this.date = this.trajeto[0].date;
     // this.data = dateParse[0];
     // this.horario = dateParse[1];

     if (this.veiculo?.calc_hodometro) {
      const firstMove = JSON.parse(this.trajeto[0].attributes.toString());
      const lastMove = JSON.parse(this.trajeto[this.trajeto.length-1].attributes.toString());
      console.log('dev-rlv', 'moves', firstMove, lastMove);
      if (firstMove.odometer && lastMove.odometer) {
        console.log('dev-rlv', 'diff brute', lastMove.odometer - firstMove.odometer, this.distancia);
        this.diff = lastMove.odometer - firstMove.odometer;
        this.diff = (this.diff - this.distancia) / this.trajeto.length;
        this.diffType = this.diff > 0 ? 'sub' : 'add';
        console.log('dev-rlv', 'diff per move', this.diff);
      }
     }
    }

    this.carregarMapa();
    this.adicionarMarcador();
  }

  carregarMapa(): void {
    var Mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWR1YmFja2VzIiwiYSI6ImNqc2J6b2tybzBmbGo0OXBlMHFlMG44MTIifQ.w_qEtn54gtndupB1vG0DnA', {
          maxZoom: 19,
          minZoom:2,
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
          id: 'mapbox.streets'
    });
    var MapboxAereo = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWR1YmFja2VzIiwiYSI6ImNqc2J6b2tybzBmbGo0OXBlMHFlMG44MTIifQ.w_qEtn54gtndupB1vG0DnA', {
        maxZoom: 19,
        minZoom:2,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    var Dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY3JsaW51eCIsImEiOiJjajZwNmpxdTQwYzViMndxZWJvcWozc3p4In0.eqvcxKfyHMhWx1ns1tjsEQ', {
        maxZoom: 19,
        minZoom:2,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var Light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY3JsaW51eCIsImEiOiJjajZwNmpxdTQwYzViMndxZWJvcWozc3p4In0.eqvcxKfyHMhWx1ns1tjsEQ', {
        maxZoom: 19,
        minZoom:2,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom:2,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });


    var Mapbox2 = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY3JsaW51eCIsImEiOiJjajZwNmpxdTQwYzViMndxZWJvcWozc3p4In0.eqvcxKfyHMhWx1ns1tjsEQ', {
    maxZoom: 19,
    minZoom:2,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'

    });

    var GoogleSatelite = L.tileLayer('https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga', {
      maxZoom: 19,
      minZoom: 2,
      attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery ©️ <a href="https://mapbox.com">Mapbox</a>',
      id: 'mapbox.streets'
    });

    var GooglePadrão = L.tileLayer('https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=Ga', {
      maxZoom: 19,
      minZoom: 2,
      attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery ©️ <a href="https://mapbox.com">Mapbox</a>',
      id: 'mapbox.streets'
    });

    var GoogleHíbrido = L.tileLayer('https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}&s=Ga', {
      maxZoom: 19,
      minZoom: 2,
      attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery ©️ <a href="https://mapbox.com">Mapbox</a>',
      id: 'mapbox.streets'
    });

    var GoogleTraffic = L.tileLayer('https://mt0.google.com/vt/lyrs=r,traffic&hl=en&x={x}&y={y}&z={z}&s=Ga', {
      maxZoom: 19,
      minZoom: 2,
      attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery ©️ <a href="https://mapbox.com">Mapbox</a>',
      id: 'mapbox.streets'
    });

    var baseMaps = {
      "GoogleRealTime": GoogleTraffic,
      "GoogleSatelite": GoogleSatelite,
      "GooglePadrão": GooglePadrão,
      "GoogleHíbrido": GoogleHíbrido,
      "OpenStreetMap": OpenStreetMap,
      "RealTime": Mapbox,
      "Mapbox": Mapbox2,
      "Aereo": MapboxAereo,
      "Dark": Dark,
      "Light": Light
    };

    this.map = L.map('map',{
      center: [-12.940225, -50.475085],
      zoom: 3,
      layers: [OpenStreetMap],
      zoomControl: true,
      keyboard: false
    }).whenReady(
      () => this.map?.invalidateSize()
    )
    L.control.layers(baseMaps).addTo(this.map);
  }

  adicionarMarcador(){
    if(this.trajeto){
      var posicaoInicial = this.trajetoLatLng[this.trajetoPasso];


      var markerIcon = this.getIcon(posicaoInicial);
      var marker = L.marker(posicaoInicial, { icon: markerIcon }).bindPopup();
      this.posicao = marker;

      this.updatePopup();
      this.map?.addLayer(this.posicao);
      this.map?.setView(this.posicao.getLatLng(), 16);
      this.posicao.openPopup();
    }
  }

  avancarPosicao(passo?: string){
    if(passo == undefined)
      this.trajetoPasso++;
    else
      this.trajetoPasso = parseInt(passo);

    if(this.trajeto && this.trajetoPasso == this.trajeto.length-1) {
      this.playReplay = false;
      clearInterval(this.timerReplay);
    }

    // Desenhar o trajeto
    if(this.trajetoPasso>0){
      var path = this.trajetoLatLng.slice(0, this.trajetoPasso+1);
      if (this.veiculo?.calc_hodometro && this.trajeto) {
        const firstAttributes = JSON.parse(this.trajeto?.[0].attributes.toString());
        const currentAttributes = JSON.parse(this.trajeto?.[this.trajetoPasso].attributes.toString());
        if (currentAttributes.odometer) {
          this.distance = currentAttributes.odometer - firstAttributes.odometer;
          console.log('dev-rlv', this.distance, this.trajetoPasso, currentAttributes.odometer, firstAttributes.odometer);
          if (this.diffType == 'add') {
            this.distance -= this.diff * this.trajetoPasso+1;
          } else if (this.diffType == 'sub') {
            this.distance -= this.diff * this.trajetoPasso+1;
          }
          this.distance = (this.distance / 1000).toFixed(1);
        }

        // if (this.trajetoPasso == this.trajeto.length-1) {
        //   this.distance = (this.distancia / 1000) > 0 ? this.distancia / 1000 : 0;
        //   this.distance = this.distance.toFixed(2);
        // }
      } else if (this.veiculo?.calc_hodometro == 0) {
        this.distance = this.getDistance(path);
      }
      if(this.polyline == null){
        this.polyline = L.polyline(path, {
          color: '#8800aa',
          weight: 6,
          opacity: 1,
          lineJoin: 'round'
        })

        this.map?.addLayer(this.polyline);
      }
      else
      {
        this.polyline.setLatLngs(path);
      }
    }

    if (this.trajeto?.[this.trajetoPasso] === undefined)
      return;

    // Preencher velocidade e horário
    this.velocidade = this.trajeto[this.trajetoPasso].speed;
    //let dateParse = this.trajeto[this.trajetoPasso].date.split(' ');
    this.date = this.trajeto[this.trajetoPasso].date;
    //this.data = dateParse[0];
    //this.horario = dateParse[1];

    // Atualizar marcador conforme ignição
    this.posicao.setIcon(this.getIcon(this.trajeto[this.trajetoPasso]));
    // Atualizar popup
    this.updatePopup();
    // Mover marcador
    var proxPosicao = this.trajetoLatLng[this.trajetoPasso];
    this.posicao.setLatLng(proxPosicao);
    this.map?.setView(this.posicao.getLatLng(), 16)
  }

  getDistance(path:any) {
    // distance in meters
    var mDistance = 0,
        length = path.length;
    for (var i = 1; i < length; i++) {
      mDistance += path[i].distanceTo(path[i - 1]);
    }
    // return km
    return (mDistance / 1000).toFixed(2);
  }

  getTotalDistance() {
    // distance in meters
    var mDistance = 0,
        length = this.trajetoLatLng.length;
    for (var i = 1; i < length; i++) {
      mDistance += this.trajetoLatLng[i].distanceTo(this.trajetoLatLng[i - 1]);
    }
    // return km
    return (mDistance / 1000);
  }

  play(){
    if(this.playReplay == false) {
      // Caso já tenha terminado
      if(this.trajeto && this.trajetoPasso == this.trajeto.length-1) this.trajetoPasso = 0;
      this.playReplay = true;
      this.timerReplay = setInterval(() => this.avancarPosicao(), this.velReplay);
    }else {
      this.playReplay = false;
      clearInterval(this.timerReplay);
    }
  }

  mudarVelocidade() {
    if (this.velReplay == 600) // Esta alta
      this.velReplay = 1200;
    else // Esta baixa
      this.velReplay = 600;

    if(this.playReplay == true) {
      clearInterval(this.timerReplay);
      this.timerReplay = setInterval(() => this.avancarPosicao(), this.velReplay);
    }
  }

  getIcon(trajeto: any): L.Icon {
    let iconUrl = "assets/original/imgs/";
    switch(this.veiculo?.tipo){
      case 'MOTO':
          iconUrl += 'marker_moto';
          break;

      case 'CARRO':
          iconUrl += 'marker_carro';
          break;

      case 'JET':
          iconUrl += 'marker_jet';
          break;

      case 'CAMINHAO':
          iconUrl += 'marker_caminhao';
          break;

      case 'VAN':
          iconUrl += 'marker_van';
          break;

      case 'PICKUP':
          iconUrl +=  'marker_pickup';
          break;

      case 'ONIBUS':
          iconUrl +=  'marker_onibus';
          break;

      case 'CELULAR':
          iconUrl += 'marker_celular';
          break;

      default:
          iconUrl += 'marker_carro';
          break;
    }

    iconUrl += (trajeto.ligado == "S") ? '_ativo' : '_desativo';
    iconUrl += '.png';
    let markerIcon = L.icon({
      iconUrl: iconUrl,
      iconSize: [35, 44],
      iconAnchor: [14, 50],
      popupAnchor: [2, -46],
      shadowUrl: 'assets/original/imgs/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [9, 47],
    });

    return markerIcon;
  }

  updatePopup(): void {
    let html = `<div class='popup-replay'>
      <div>
      <i class="fa fa-location-arrow" aria-hidden="true"></i>
        <span>Placa:</span>
        <span class='value'>${this.veiculo?.name}</span>
      </div>
      <div>
        <i class="fa fa-clock-o" aria-hidden="true"></i>
        <span>Duração:</span>
        <span class='value'>${this.tempo}</span>
      </div>
      <div>
        <i class="fa fa-flag-o" aria-hidden="true"></i>
        <span>Paradas:</span>
        <span class='value'>${this.paradas}</span>
      </div>
      <div>
        <i class="fa fa-usd" aria-hidden="true"></i>
        <span>Gasto:</span>
        <span class='value'>R$${this.gasto}</span>
      </div>
      <div>
        <i class="fa fa-road" aria-hidden="true"></i>
        <span>Distância:</span>
        <span class='value'>${this.distance} km</span>
      </div>
      <div>
        <i class="fa fa-tachometer" aria-hidden="true"></i>
        <span>Velocidade:</span>
        <span class='value'>${this.velocidade} km/h</span>
      </div>
    </div>`;
    this.posicao.setPopupContent(html);
  }
}
