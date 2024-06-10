import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HistoricoService, Localizacao, Parada } from 'src/app/services/cliente/historico.service';
import { ClienteComponent } from '../../../cliente.component';

import 'leaflet';
import 'leaflet.markercluster';
import { AppComponent } from 'src/app/app.component';
declare var L: any;

@Component({
  selector: 'app-paradas',
  templateUrl: './paradas.component.html',
  styleUrls: ['./paradas.component.scss']
})
export class HistoricoParadasComponent implements OnInit {
  @ViewChild('map') mapElement: ElementRef | undefined;
  titlePage: String = 'Paradas';
  paradas: Parada[] | undefined;
  map: any;

  // Paradas vars
  paradasLayer: L.FeatureGroup = L.featureGroup();
  paradasPasso: number = 0;
  paradasLatLng: L.LatLng[] = [];

  constructor(
    protected app: AppComponent,
    protected base: ClienteComponent,
    private service: HistoricoService,
    protected location: Location
  ){
    this.paradas = this.service.lastRota as Parada[];
  }

  ngOnInit(): void {
    if(this.paradas) {
      this.paradas.forEach( (posicao) => {
        this.paradasLatLng.push( new L.LatLng(
          parseFloat(posicao.latitude.toString()),
          parseFloat(posicao.longitude.toString())
        ) );
      });
    }
    this.carregarMapa();
    this.adicionarMarcadores();
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
    });
    L.control.layers(baseMaps).addTo(this.map);
  }

  adicionarMarcadores(){
    if(this.paradas){
      var me = this;
      this.map.addLayer(this.paradasLayer);

      this.paradas.forEach( (posicao: Parada, index: any) => {
        var CustomIconNumbered = L.Icon.extend({
          options: {
            iconUrl: 'assets/original/imgs/icon_parada.png',
            number: '',
            shadowUrl: null,
            iconSize: new L.Point(31, 51),
            popupAnchor: new L.Point(0, -31),
            className: 'leaflet-div-icon numbered-icon'
          },

          createIcon: function () {
            var div = document.createElement('div');
            var img = this._createImg(this.options['iconUrl']);
            var numdiv = document.createElement('div');
            numdiv.setAttribute ( "class", "number" );
            numdiv.innerHTML = index+1 || '';
            div.appendChild ( img );
            div.appendChild ( numdiv );
            this._setIconStyles(div, 'icon');
            return div;
          },

          //you could change this to add a shadow like in the normal marker if you really wanted
          createShadow: function () {
            return null;
          }
        });
        var marker = new L.Marker(
          new L.LatLng(
            parseFloat(posicao.latitude.toString()),
            parseFloat(posicao.longitude.toString())
            ), {
          icon:	new CustomIconNumbered()
        });
        var tempoParado = '';
        if(parseInt(posicao.Horas.toString()) >= 1) {
            tempoParado += parseInt(posicao.Horas.toString()) > 1 ? posicao.Horas+' horas e ' : posicao.Horas+' hora e ';
        } else {
            tempoParado += '0 horas e ';
        }

        if(parseInt(posicao.Minutos.toString()) >= 1) {
            tempoParado += parseInt(posicao.Minutos.toString()) > 1 ? posicao.Minutos+' minutos.' : posicao.Minutos+' minuto.';
        } else {
            tempoParado += '0 minutos.';
        }

        var infosDataCarro = posicao.dataParou;
        infosDataCarro = infosDataCarro.replace(/-/g, '/');
        var DataCarro = infosDataCarro.split(" ");
        infosDataCarro = DataCarro[1];
        DataCarro = DataCarro[0].split("/");
        infosDataCarro += " " + DataCarro[2] + "/" + DataCarro[1] + "/" + DataCarro[0];

        var infosDataCarroSaida = posicao.dataAndou;
        infosDataCarroSaida = infosDataCarroSaida.replace(/-/g, '/');
        var DataCarroSaida = infosDataCarroSaida.split(" ");
        infosDataCarroSaida = DataCarroSaida[1];
        DataCarroSaida = DataCarroSaida[0].split("/");
        infosDataCarroSaida += " " + DataCarroSaida[2] + "/" + DataCarroSaida[1] + "/" + DataCarroSaida[0];

        var markerPopup =
        '<div class="row">'
        +  '<div style="width: 270px; text-transform:uppercase; font-size:10px;" id="info-title" class="panel-heading ">'
        +  '<div class="col-md-12 col-sm-12 col-xs-12">'

        +  '</div>'

        +   '<div class="ft-marker-details" style="width: 240px; float: left;height: 100%;">'
        +    '<div class="info-marker"><span><i class="fa fa-location-arrow"></i> Placa: <strong>'+ posicao.Placa +'</strong></span></div>'
        +    '<div class="info-marker"><span><i class="fa fa-calendar"></i> Parou: <strong>'+infosDataCarro+'</strong></span></div>'
        +    '<div class="info-marker"><span><i class="fa fa-calendar"></i> Saiu: <strong>'+infosDataCarroSaida+'</strong></span></div>'
        +    '<div class="info-marker"><span><i class="fa fa-address-card" aria-hidden="true"></i> Motorista: <strong>'+posicao.motorista+'</strong></span></div>'
        +    '<div class="info-marker"><span><svg class="iconpop svg-inline--fa fa-key fa-w-16" aria-hidden="true" data-fa-processed="" data-prefix="fa" data-icon="key" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z"></path></svg>'
        +       'Parou por: <strong>' + tempoParado + '</strong></div>'
        +    '<div class="info-map-marker"><span><svg class="iconpop svg-inline--fa fa-map-marker-alt fa-w -12" style="margin-right: 0px;" aria-hidden="true" data-fa-processed="" data-prefix="fa" data-icon="map-marker-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>'
        +       'Endereço:<br><p class="endereco" style="margin: 0.2em 0 0 1.2em;font-size: 11px;"><strong>' + posicao.Endereco + '</strong></p>'
        +    '</div>'
        +  '</div>'
        + '</div>'
        +'</div>';


        marker.bindPopup(markerPopup, {className : 'popupVeiculo'});
        me.paradasLayer.addLayer(marker);
      });

      this.map.fitBounds(this.paradasLayer.getBounds());
    }
  }

  avancarPosicao(){
      this.paradasPasso++;
      var layerMarker = this.paradasLayer.getLayers()[this.paradasPasso];
      if (layerMarker === undefined && this.paradasPasso > 0) {
        this.paradasPasso = 0;
        layerMarker = this.paradasLayer.getLayers()[this.paradasPasso];
      }

      layerMarker.openPopup();
      this.map.setView(this.paradasLatLng[this.paradasPasso], 20);
  }

  voltarPosicao(){
    this.paradasPasso--;
    var layerMarker = this.paradasLayer.getLayers()[this.paradasPasso];
    if (layerMarker === undefined && this.paradasPasso < 0) {
      this.paradasPasso = this.paradasLatLng.length - 1;
      layerMarker = this.paradasLayer.getLayers()[this.paradasPasso];
    }

    layerMarker.openPopup();
    this.map.setView(this.paradasLatLng[this.paradasPasso], 20);
  }

  verPosicao(){
      var layerMarker = this.paradasLayer.getLayers()[this.paradasPasso];
      layerMarker.openPopup();
      this.map.setView(this.paradasLatLng[this.paradasPasso], 20);
  }
}
