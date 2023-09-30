import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { Cerca, CercasService } from 'src/app/services/cliente/cercas.service';
import { ClienteComponent } from '../../../cliente.component';
import { Veiculo, VeiculosService } from 'src/app/services/cliente/veiculos.service';

import * as moment from 'moment';
import Swal from 'sweetalert2';
import 'leaflet';
import 'leaflet.markercluster';
declare var L: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class CercasMapaComponent implements OnInit {
  @ViewChild('map') mapElement: ElementRef | undefined;
  map: L.Map | undefined;
  titlePage: String = 'Mapa';
  veiculo: Veiculo | undefined;
  cerca: Cerca | undefined;
  type: String | undefined;
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger',
      actions: 'btn-dialog-actions'
    },
    buttonsStyling: false
  })

  /* VARS CERCA */
  markers: Array<L.LatLng> = new Array();
  markerCerca:any;
  markerPoint:any;
  polygon: any;
  constructor(
    private app: AppComponent,
    protected base: ClienteComponent,
    private router: Router,
    private route: ActivatedRoute,
    protected location: Location,
    private service: CercasService,
    private veiculos: VeiculosService
  ) {
    
  }

  ngOnInit(): void {
    this.carregarMapa(); 
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
    }).on('click', (event: any) => this.mapClick(event))
    L.control.layers(baseMaps).addTo(this.map);
    this.markerCerca =  L.featureGroup([]).addTo(this.map);
    this.markerPoint =  L.featureGroup([]).addTo(this.map);
    this.map?.whenReady( () => this.prepararMapa() );
  }

  mapClick(e: any){
    if(this.type === 'create' && this.markers.length < 4 && this.map){
      this.addMarkerCerca(e.latlng);
      if(this.markers.length == 4){
        this.polygon = L.polygon(this.markers, {color: '#bacf65'}).addTo(this.map);
        const me = this;
        setTimeout( function(){
          me.saveCerca();
        }, 1000);
      }
    }
  }

  saveCerca(): void {
    this.swalWithBootstrapButtons.fire({
      title: 'Cerca Virtual',
      text: 'Informe o nome da cerca',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim',
      input: 'text',
      inputPlaceholder: 'Sua cerca',
      inputValidator: (value) => {
        if (!value) {
          return 'Nome inválido'
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && this.veiculo) {
        const coordenadas = this.markers[0].lat+','+this.markers[0].lng+'|'+
        this.markers[1].lat+','+this.markers[1].lng+'|'+
        this.markers[2].lat+','+this.markers[2].lng+'|'+
        this.markers[3].lat+','+this.markers[3].lng;
        this.service.create(this.veiculo, result.value, coordenadas).subscribe( (response) => {
          if (response.message) {
            this.base.openMessage(response.success, response.message.toString());
          }

          setTimeout( () => this.location.back(), 500);
        });
      } else {
        this.location.back();
      }
    })
  }

  prepararMapa(): void {
    this.route.queryParams.subscribe(params => {
      this.type = params['type'];
      if (this.type === "view") {
        this.cerca = this.service.get(parseInt(params['cercaId']));
        this.prepareCerca();
      }
      if (this.type === "create") {
        this.veiculo = this.veiculos.get(undefined, params['veiculoImei']);
        this.prepareVeiculo();
      }
      //console.log(this.type, this.veiculo, this.cerca);
    });
  }
  
  prepareCerca(): void {
    if(this.cerca && this.cerca.coordenadas != '' && this.map){
      var coords = this.cerca.coordenadas.split('|');
      for(var i=0;i<coords.length;i++){
        var a = coords[i];
        var b = a.split(',');
        this.markers.push(new L.LatLng(parseFloat(b[0]), parseFloat(b[1])));
      }

      this.polygon = L.polygon(this.markers, {color: '#bacf65'}).addTo(this.map);
      this.map.fitBounds(this.polygon.getBounds());
    }
  }

  addMarkerCerca(latlng: any): void {
    var me = this;

    var markerIcon = L.icon({
        iconUrl: 'assets/original/imgs/marker_point.png',
        iconSize: [18, 18],
        iconAnchor: [9, 19],
        popupAnchor: [2, -46],
        shadowUrl: 'assets/original/imgs/marker-shadow.png',
        shadowSize: [20, 20],
        shadowAnchor: [9, 25],
    });

    me.markers.push(latlng);
    var marker = L.marker(latlng, { icon: markerIcon });
    me.markerCerca.addLayer(marker);
  } 

  prepareVeiculo(): void {
    if (this.map && this.veiculo) {
      var item = this.veiculo;
      var imgTipo = '_ativo.png';
      if(item.ligado == 'N'){
          imgTipo = '_desativo.png';
      }
      else if(item.ligado == 'S'){
          imgTipo = '_ativo.png';
      }
      var image = 'marker_carro' + imgTipo;
      switch (item.tipo) {
        case 'MOTO':
            image = 'marker_moto' + imgTipo;
            break;

        case 'CARRO':
            image = 'marker_carro' + imgTipo;
            break;

        case 'JET':
            image = 'marker_jet' + imgTipo;
            break;

        case 'CAMINHAO':
            image = 'marker_caminhao' + imgTipo;
            break;

        case 'VAN':
            image = 'marker_van' + imgTipo;
            break;

        case 'PICKUP':
            image = 'marker_pickup' + imgTipo;
            break;

        case 'ONIBUS':
            image = 'marker_onibus' + imgTipo;
            break;

        case 'CELULAR':
            image = 'marker_celular' + imgTipo;
            break;

        default:
            image = 'marker_carro' + imgTipo;
            break;
      }

      var markerIcon = L.icon({
          iconUrl: 'assets/original/imgs/'+image,
          iconSize: [35, 44],
          iconAnchor: [14, 50],
          popupAnchor: [2, -46],
          shadowUrl: 'assets/original/imgs/marker-shadow.png',
          shadowSize: [41, 41],
          shadowAnchor: [9, 47],
      });

      moment.locale('pt-br');
      var a = moment();
      var b = moment(item.dt_ignicao_ligada?.toString()).format("YYYY-MM-DD HH:mm:ss");
      var c = a.diff(b, "seconds");

      //var seg0  = c%60;
      var min   = c/60;
      var min0  = min%60;
      var hor0  = min/60;
      var d = Math.floor(hor0)+" horas e "+Math.floor(min0)+" minutos";

      var markerPopup =
      '<div style="width: 270px; text-transform:uppercase; font-size:10px;" id="info-title" class="panel-heading ">('+(item.name)+')&nbsp'+item.marca+'&nbsp'+item.cor+'</div> <hr>'+
      '  <div style="width: 200px;" id="infoGeo" class="panel-body">'+
      '<svg class="iconpop svg-inline--fa fa-calendar-alt fa-w-14" aria-hidden="true" data-fa-processed="" data-prefix="fa" data-icon="calendar-alt" role="img" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M436 160H12c-6.6 0-12-5.4-12-12v-36c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48v36c0 6.6-5.4 12-12 12zM12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm116 204c0-6.6-5.4-12-12-12H76c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-40zm0-128c0-6.6-5.4-12-12-12H76c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-40zm128 128c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-40zm0-128c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-40zm128 128c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-40zm0-128c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-40z"></path></svg> Data: '+  '<strong style="color:#403d39 !important;" >' + moment(item.date.toString(), "YYYY-MM-DD HH:mm:ss").format("HH:mm DD/MM/YYYY") + '</strong>'  +'<br>'+
      '</div>'
      + item.injectHtml +
        '<svg width="12px" height="12px" class="svg-inline--fa fa-podcast fa-w-14" aria-hidden="true" data-fa-processed="" data-prefix="fa" data-icon="podcast" role="img" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M267.429 488.563C262.286 507.573 242.858 512 224 512c-18.857 0-38.286-4.427-43.428-23.437C172.927 460.134 160 388.898 160 355.75c0-35.156 31.142-43.75 64-43.75s64 8.594 64 43.75c0 32.949-12.871 104.179-20.571 132.813zM156.867 288.554c-18.693-18.308-29.958-44.173-28.784-72.599 2.054-49.724 42.395-89.956 92.124-91.881C274.862 121.958 320 165.807 320 220c0 26.827-11.064 51.116-28.866 68.552-2.675 2.62-2.401 6.986.628 9.187 9.312 6.765 16.46 15.343 21.234 25.363 1.741 3.654 6.497 4.66 9.449 1.891 28.826-27.043 46.553-65.783 45.511-108.565-1.855-76.206-63.595-138.208-139.793-140.369C146.869 73.753 80 139.215 80 220c0 41.361 17.532 78.7 45.55 104.989 2.953 2.771 7.711 1.77 9.453-1.887 4.774-10.021 11.923-18.598 21.235-25.363 3.029-2.2 3.304-6.566.629-9.185zM224 0C100.204 0 0 100.185 0 224c0 89.992 52.602 165.647 125.739 201.408 4.333 2.118 9.267-1.544 8.535-6.31-2.382-15.512-4.342-30.946-5.406-44.339-.146-1.836-1.149-3.486-2.678-4.512-47.4-31.806-78.564-86.016-78.187-147.347.592-96.237 79.29-174.648 175.529-174.899C320.793 47.747 400 126.797 400 224c0 61.932-32.158 116.49-80.65 147.867-.999 14.037-3.069 30.588-5.624 47.23-.732 4.767 4.203 8.429 8.535 6.31C395.227 389.727 448 314.187 448 224 448 100.205 347.815 0 224 0zm0 160c-35.346 0-64 28.654-64 64s28.654 64 64 64 64-28.654 64-64-28.654-64-64-64z"></path></svg>' +
        '  Satélites: ' + '<strong style="color:#403d39 !important;">' + ( (item.satelites == null) ? "Indisponível" : (item.satelites + " Visíveis") )  + '</strong>' + ' <br>'+

      '<svg class="iconpop svg-inline--fa fa-tachometer-alt fa-w-18" aria-hidden="true" data-fa-processed="" data-prefix="fa" data-icon="tachometer-alt" role="img" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M75.694 480a48.02 48.02 0 0 1-42.448-25.571C12.023 414.3 0 368.556 0 320 0 160.942 128.942 32 288 32s288 128.942 288 288c0 48.556-12.023 94.3-33.246 134.429A48.018 48.018 0 0 1 500.306 480H75.694zM512 288c-17.673 0-32 14.327-32 32 0 17.673 14.327 32 32 32s32-14.327 32-32c0-17.673-14.327-32-32-32zM288 128c17.673 0 32-14.327 32-32 0-17.673-14.327-32-32-32s-32 14.327-32 32c0 17.673 14.327 32 32 32zM64 288c-17.673 0-32 14.327-32 32 0 17.673 14.327 32 32 32s32-14.327 32-32c0-17.673-14.327-32-32-32zm65.608-158.392c-17.673 0-32 14.327-32 32 0 17.673 14.327 32 32 32s32-14.327 32-32c0-17.673-14.327-32-32-32zm316.784 0c-17.673 0-32 14.327-32 32 0 17.673 14.327 32 32 32s32-14.327 32-32c0-17.673-14.327-32-32-32zm-87.078 31.534c-12.627-4.04-26.133 2.92-30.173 15.544l-45.923 143.511C250.108 322.645 224 350.264 224 384c0 35.346 28.654 64 64 64 35.346 0 64-28.654 64-64 0-19.773-8.971-37.447-23.061-49.187l45.919-143.498c4.039-12.625-2.92-26.133-15.544-30.173z"></path></svg>'+
      '  Velocidade: '+ '<strong style="color:#403d39 !important;">' + item.speed + ' Km/h</strong>' + '<br>'+
      '<svg class="iconpop svg-inline--fa fa-key fa-w-16" aria-hidden="true" data-fa-processed="" data-prefix="fa" data-icon="key" role="img" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z"></path></svg>'+
      ' Parado à: ' + '<strong style="color:#403d39 !important;">' + d + '</strong>' + '<br>'+
      '<svg class="iconpop svg-inline--fa fa-map-marker-alt fa-w-12" aria-hidden="true" data-fa-processed="" data-prefix="fa" data-icon="map-marker-alt" role="img" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>Endereço: ' + '<br>'  + '<div style="margin-left:12px;"><u style="text-decoration: none !important; "><strong style="color:#403d39 !important;  ">' + item.endereco + '</strong></u></div>'

      if (item.latitude && item.longitude) {
        var latlng = new L.LatLng(parseFloat(item.latitude.toString()), parseFloat(item.longitude.toString()));
        var marker = L.marker(latlng, { title: item.name.toString(), icon: markerIcon });
        this.markerPoint.addLayer(marker);
        marker.addTo(this.map).bindPopup(markerPopup);
      }

      this.map.fitBounds(this.markerPoint.getBounds());
      this.map.setZoom(15);
    }
  }
  

}
