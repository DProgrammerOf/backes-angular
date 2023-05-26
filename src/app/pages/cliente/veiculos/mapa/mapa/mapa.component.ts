import { Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { Veiculo, VeiculosService } from 'src/app/services/cliente/veiculos.service';
import { ClienteComponent } from '../../../cliente.component';

import 'leaflet';
import 'leaflet.markercluster';
declare var L: any;

import * as moment from 'moment';
import Swal from 'sweetalert2';
import { slideVeiculoMapPopup } from 'src/app/app.animation';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
  animations: [ slideVeiculoMapPopup ]
})
export class VeiculosMapaComponent implements OnDestroy {
  @ViewChild('map') mapElement: ElementRef | undefined;
  map: L.Map | undefined;
  titlePage: String = 'Mapa';
  veiculoId: Number = -1;
  veiculos: Veiculo[] | undefined;
  veiculoFocus: Veiculo | undefined;
  veiculoFocusStatus: Boolean = false;
  veiculoAlertas: Number = 0;
  veiculosTimer: NodeJS.Timer | undefined;
  veiculoIcon: String = "None"; // None => nada ; Placa => mostra placa ; Motorista => mostra motorista
  veiculoIconExecution: Boolean = false;

  // Map vars
  markersCluster: any;
  markersLatLng: any;
  precoCombustivel: any = "";

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger',
      actions: 'btn-dialog-actions'
    },
    buttonsStyling: false
  })

  constructor(
    protected app: AppComponent,
    protected base: ClienteComponent,
    private router: Router,
    private route: ActivatedRoute,
    protected location: Location,
    private service: VeiculosService  
  ) {
  }

  ngOnInit(): void {
    this.app.setStatus(true);

    //@ts-ignore
    document.moneyMask = function (elem) {
      var v = elem.value.replace(/\D/g,'');
      v = (v/100).toFixed(2) + '';
      v = v.replace(",", ".");
      v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
      elem.value = v.replace('.', ',');
    }

    // Icons label
    this.addStyle('.iconLabel', 'display', 'none');
    this.addStyle('.icon-label-plafca', 'display', 'none');
    this.addStyle('.icon-label-motorista', 'display', 'none');
    // Icons label

    this.route.queryParams.subscribe( (params) => {
      this.veiculoId = params['veiculoId'];
      setTimeout( () => {
        this.carregarMapa();
      }, 300 );
    });

  }

  ngOnDestroy(): void {
    clearInterval(this.veiculosTimer);
  }

  sendCallNative(event: any): void {
    if (window.parent.postMessage) {
      window.parent.postMessage(event, '*');
    } else {
      alert('error call native ' + event.type);
    }
  }

  MoneyBRL(i:any) {
    var v = i.replace(/\D/g,'');
    v = (v/100).toFixed(2) + '';
    v = v.replace(",", ".");
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
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

    L.Map.prototype.MoveToVehicle = function (elem: any, targetZoom: any) {
      var offsetLeft = document.querySelector(`.icon-vehicle[title="${elem.options.title}"]`)?.scrollWidth;
      console.log(offsetLeft);
      if (offsetLeft) {
        offsetLeft = offsetLeft == 44 ? 0 : -(offsetLeft/2);
      }
      var targetPoint = this.project(elem.getLatLng(), targetZoom).subtract([offsetLeft, -150]),
      targetLatLng = this.unproject(targetPoint, targetZoom);
      return this.setView(targetLatLng, targetZoom);
    }

    let veiculo = this.service.get(this.veiculoId, undefined);

    this.map = L.map('map',{
      center: veiculo ? [veiculo.latitude, veiculo.longitude] : [-12.940225, -50.475085] ,
      zoom: this.veiculoId == -1 ? 4 : 15,
      layers: [OpenStreetMap],
      zoomControl: false,
      keyboard: false
    });
    L.control.zoom({
        position: 'bottomright'
    }).addTo(this.map);

     // Control show Motorista or Placa
     L.Control.SwitchStyleMarker = L.Control.extend({
      onAdd: function(elemMap: any) {
        var el = L.DomUtil.create('div', 'leaflet-bar leaflet-control-icon');
        el.innerHTML = `
          <a id="leaflet-control-icon" (click)="switchStyleIcon()">
            <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Eye Off</title><path d="M432 448a15.92 15.92 0 01-11.31-4.69l-352-352a16 16 0 0122.62-22.62l352 352A16 16 0 01432 448zM255.66 384c-41.49 0-81.5-12.28-118.92-36.5-34.07-22-64.74-53.51-88.7-91v-.08c19.94-28.57 41.78-52.73 65.24-72.21a2 2 0 00.14-2.94L93.5 161.38a2 2 0 00-2.71-.12c-24.92 21-48.05 46.76-69.08 76.92a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416a239.13 239.13 0 0075.8-12.58 2 2 0 00.77-3.31l-21.58-21.58a4 4 0 00-3.83-1 204.8 204.8 0 01-51.16 6.47zM490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96a227.34 227.34 0 00-74.89 12.83 2 2 0 00-.75 3.31l21.55 21.55a4 4 0 003.88 1 192.82 192.82 0 0150.21-6.69c40.69 0 80.58 12.43 118.55 37 34.71 22.4 65.74 53.88 89.76 91a.13.13 0 010 .16 310.72 310.72 0 01-64.12 72.73 2 2 0 00-.15 2.95l19.9 19.89a2 2 0 002.7.13 343.49 343.49 0 0068.64-78.48 32.2 32.2 0 00-.1-34.78z"/><path d="M256 160a95.88 95.88 0 00-21.37 2.4 2 2 0 00-1 3.38l112.59 112.56a2 2 0 003.38-1A96 96 0 00256 160zM165.78 233.66a2 2 0 00-3.38 1 96 96 0 00115 115 2 2 0 001-3.38z"/></svg>
          </a>
        `;
        el.addEventListener('click', (event:any) => me.switchLabelIcon());
        return el;
      },
      onRemove: function(elemMap: any) {
      }
    });

    L.control.switchMarker = function(opts: any) {
      return new L.Control.SwitchStyleMarker(opts);
    }
    L.control.switchMarker({
      position: 'bottomright'
    }).addTo(this.map);
    // Control show Motorista or Placa

    L.control.layers(baseMaps).addTo(this.map);
    this.markersCluster = new L.MarkerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 50}); // Raio do Cluster
    this.map?.addLayer(this.markersCluster);
  
    
    const me = this;
    this.map?.whenReady( () => {
      this.loadMarkers(me.veiculoId);
      if (me.veiculoId != -1) {
        setTimeout( () => {
          this.showInfo(this.veiculoId);
          // @ts-ignore
          this.map?.MoveToVehicle(this.markersCluster.getLayers()[0], 15);
        }, 500 );
      }

      this.veiculosTimer = setInterval( () => me.loadMarkers(me.veiculoId, false), 8000 );
    });
  }

  loadMarkers(veiculoId: Number, centered: Boolean = true): void {
    if (veiculoId == -1) { // Todos veículos
      this.veiculos = this.service.getList();
      if (this.veiculoFocusStatus) {
        this.veiculoFocus = this.service.get(this.veiculoFocus?.id);
      }
    } 
    else // Individual 
    {
      let veiculo = this.service.get(veiculoId, undefined);
      if (veiculo) {
        this.veiculos = [veiculo];
        if (this.veiculoFocusStatus) {
          this.veiculoFocus = this.service.get(this.veiculoFocus?.id);
        }
        this.service.alertas(veiculo.imei).subscribe( (response) => {
          if (response.success && response.alertas) {
            this.veiculoAlertas = response.alertas;
          }
        });
      }
    }

    // Draw markers
    if (this.veiculos) {
      this.markersCluster.clearLayers();
      for (let veiculo of this.veiculos) {
        this.prepareVeiculo(veiculo);
      }

      if (centered && this.veiculoId == -1 && this.veiculoIconExecution == false)
        this.map?.fitBounds(this.markersCluster.getBounds());
    }

    if (this.app.getStatus()) {
      this.app.setStatus(false);
    }
  }

  prepareVeiculo(veiculo: Veiculo): void {
    if (this.map && veiculo) {
      var item = veiculo;
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

      var corIcon =  "#d20000"; // Desligado padrão
      // if(item.bloqueado == "S")
      //   corIcon = "#dace63";
      if(item.ligado == "S")
        corIcon = "#87cb5b";

      var htmlIcon = '<div style="min-width:44px;display: flex;flex-direction: row;align-items: center; background-image: url(assets/original/imgs/marker-shadow.png'+');background-position-x: 4px;background-position-y: 3px;background-repeat: no-repeat;">'+
                '<img width="35px" height="44px" src="assets/original/imgs/'+image+'" style="min-width:35px;width: 35px;height: 44px;position: relative;z-index: 2; background-size: cover; background-repeat: no-repeat; cursor: pointer; animation: pulse 1.4s infinite; animation-direction: alternate; webkit-animation-name: pulse; animation-name: pulse;">' +
                '<div class="iconLabel" style="overflow-x: hidden;text-overflow: ellipsis;max-width: 220px;white-space: nowrap;background: '+corIcon+';color: whitesmoke; font-size: 14px;line-height: 18px;word-break: initial;height: 21px;font-weight:bold;text-align: center;border-radius: 0px 5px 5px 0px;align-self: self-start;margin-left: -10px;margin-top: 6px;z-index: 1;position: relative;border:1px solid rgb(125 120 120 / 40%);padding: 0 10px 0px 15px;">' +
                '<span class="icon-label-placa">' + item.name + '</span>' +
                '<span class="icon-label-motorista">' + item.motorista + '</span>' +
                '</div>' +
                '</div>';
      var markerIcon = L.divIcon({
          // iconUrl: 'assets/original/imgs/'+image,
          // iconSize: [35, 44],
          iconAnchor: [14, 50],
          html: htmlIcon,
          popupAnchor: [2, -46],
          shadowUrl: 'assets/original/imgs/marker-shadow.png',
          shadowSize: [41, 41],
          shadowAnchor: [9, 47],
          className: 'icon-vehicle'
      });

      // Tempo parado
      moment.locale('pt-br');
      var a = moment();
      var b = moment(item?.dt_ignicao_ligada?.toString() || new Date(), "YYYY-MM-DD HH:mm:ss");
      var c = a.diff(b, "seconds");
      var min   = c/60;
      var min0  = min%60;
      var hor0  = min/60;
      item.parado = Math.floor(hor0)+" horas e "+Math.floor(min0)+" minutos";
      //

      // Horimetro
      if (item.horimetro) {
        item.horimetroFormatted = Math.floor(item.horimetro / 60).toString() + 'h ' + (item.horimetro % 60).toString() + 'm';
      }
      //

      if (item.latitude && item.longitude) {
        let me = this;
        var latlng = new L.LatLng(parseFloat(item.latitude.toString()), parseFloat(item.longitude.toString()));
        var marker = L.marker(latlng, { title: item.name.toString(), icon: markerIcon })
        .on('click', function(ev:any, veiculoId: Number = veiculo.id){
          me.showInfo(veiculoId);
          // @ts-ignore
          me.map?.MoveToVehicle(ev.target, 15);
      }, this);
        this.markersCluster.addLayer(marker);
      }
    }
  }

  showInfo(veiculoId: Number): void {
    this.veiculoFocus = this.service.get(veiculoId, undefined);
    this.veiculoFocusStatus = true;
  }

  closeInfo(): void {
    this.veiculoFocusStatus = false;
  }

  refresh(): void {
    this.app.setStatus(true);
    this.service.load().subscribe( (response) => {
      this.app.setStatus(false);
      if (response.success) {
        this.service.set(response.veiculos);
        this.loadMarkers(this.veiculoId);
      }
    })
  }

  refreshSync(): Observable<Boolean> {
    this.app.setStatus(true);
    return new Observable<Boolean>( (subscriber) => {
      this.service.load().subscribe( (response) => {
        this.app.setStatus(false);
        if (response.success) {
          this.service.set(response.veiculos);
          this.loadMarkers(this.veiculoId);
        }
        subscriber.next(true);
      })
    })
  }

  openAlertas(){
    const veiculo = this.veiculos?.[0];
    if (veiculo) {
      this.router.navigate(['cliente/veiculos/mapa/alertas'], { queryParams: {veiculo: veiculo.imei} });
    } 
  }

  openExternMaps(){
    const veiculo = this.veiculos?.[0];
    if (veiculo) {
      this.base.openActionSheet(
        '', 'Abrir mapa externo',
        [
          {
            text: 'Waze',
            icon: 'WAZE-ICON',
            handler: () => this.sendCallNative({ 
              type: 'openLink', 
              url: "https://waze.com/ul?ll=" + veiculo.latitude + "," + veiculo.longitude + "&z=10", 
              target: '_system' 
            })
          },
          {
            text: 'Google Maps',
            icon: 'fa-google',
            handler: () => this.sendCallNative({ 
              type: 'openLink', 
              url: "https://www.google.com/maps/search/?api=1&query=" + veiculo.latitude + "," + veiculo.longitude, 
              target: '_system' 
            })
          },
          {
            text: 'Street View',
            icon: 'fa-street-view',
            handler: () => this.sendCallNative({ 
              type: 'openLink', 
              url: "https://maps.google.com/maps?q=&layer=c&cbll=" + veiculo.latitude + "," + veiculo.longitude, 
              target: '_system' 
            })
          }
        ]
      )
    }
  }

  openComandos(): void {
    const veiculo = this.veiculos?.[0];
    if (veiculo) {
      this.base.openActionSheet(
        '', 'Veículo - Ações',
        [
          {
            text: 'Alterar Odômetro',
            icon: 'fa-tachometer',
            handler: () => this.alterarOdometro(veiculo)
          },
          {
            text: 'Alterar Gasto/Combustível',
            icon: 'fa-money',
            handler: () => this.alterarGastoCombustivel(veiculo)
          },
          {
            text: 'Alterar Horímetro',
            icon: 'fa-clock-o',
            handler: () => this.alterarHorimetro(veiculo)
          },
          {
            text: 'Alterar Motorista',
            icon: 'fa-id-card-o',
            handler: () => this.alterarMotorista(veiculo)
          },
          {
            text: veiculo.bloqueado == 'S' ? 'Desbloquear Veículo' : 'Bloquear Veículo',
            icon: veiculo.bloqueado == 'S' ? 'fa-unlock' : 'fa-lock',
            handler: () => veiculo.bloqueado == 'S' ? this.desbloquear(veiculo) : this.bloquear(veiculo)
          }
        ]
      )  
    }
  }

  alterarOdometro(veiculo: Veiculo) {
    this.swalWithBootstrapButtons.fire({
      title: 'Alterar Odômetro',
      text: 'Informe a nova quilometragem (km)',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Salvar',
      input: 'number',
      inputPlaceholder: veiculo.hodometro?.toString(),
      inputValidator: (value) => {
        if (!value) {
          return 'Valor de odômetro inválido'
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.alterar_odometro(veiculo.imei, parseInt(result.value)).subscribe( (response) => {
          response.success 
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success')
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error')
        });
      }
    })
  }

  alterarHorimetro(veiculo: Veiculo) {
    this.swalWithBootstrapButtons.fire({
      title: 'Alterar Horímetro',
      text: 'Informe o novo valor de horímetro',
      // imageUrl: 'assets/modals/horimetro.png',
      imageWidth: 100,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Salvar',
      input: 'number',
      inputPlaceholder: veiculo.horimetro?.toString(),
      inputValidator: (value) => {
        if (!value) {
          return 'Valor de horímetro inválido'
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.alterar_horimetro(veiculo.imei, parseInt(result.value)).subscribe( (response) => {
          response.success 
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success')
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error')
        });
      }
    })
  }

  alterarMotorista(veiculo: Veiculo) {
    this.swalWithBootstrapButtons.fire({
      title: 'Alterar Motorista',
      text: 'Informe o nome do novo motorista',
      // imageUrl: 'assets/modals/motorista.png',
      imageWidth: 100,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Salvar',
      input: 'text',
      inputPlaceholder: veiculo.motorista?.toString(),
      inputValidator: (value) => {
        if (!value) {
          return 'O nome informado é inválido'
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.alterar_motorista(veiculo.imei, result.value).subscribe( (response) => {
          response.success 
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success')
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error')
        });
      }
    })
  }

  alterarGastoCombustivel(veiculo: Veiculo) {
    this.swalWithBootstrapButtons.fire({
      title: 'Alterar Gasto/Combustível',
      text: 'Informe a nova quilometragem (km)',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Salvar',
      html:
      '<input style="margin: .4rem 0;" id="precoCombustivel" maxlength=6 placeholder="Preço combustível" type="text" oninput="document.moneyMask(this)" class="swal2-input" ke />' +
      '<input style="margin: .4rem 0;" id="gastoCombustivel" placeholder="Gasto (Km/L)" type="string" class="swal2-input">',
      focusConfirm: false
    }).then((result) => {
      this.precoCombustivel = "";
      if (result.isConfirmed) {
        const preco = (<HTMLInputElement>document.querySelector("#precoCombustivel"))?.value;
        //;$("#precoCombustivel").val();
        const gasto = (<HTMLInputElement>document.querySelector("#gastoCombustivel"))?.value;
        //;$("#gastoCombustivel").val();
        this.service.alterar_combustivel(veiculo.imei, parseFloat(preco.replace(',', '.')), parseInt(gasto)).subscribe( (response) => {
          response.success 
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success')
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error')
        });
      }
    })
  }

  bloquear(veiculo: Veiculo) {
    this.swalWithBootstrapButtons.fire({
      title: 'Bloqueio',
      text: 'Tem certeza que quer enviar o comando de bloqueio?',
      // imageUrl: 'assets/modals/bloquear.png',
      imageWidth: 100,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.bloquear(veiculo.imei).subscribe( (response) => {
          response.success 
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success')
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error')
        });
      }
    })
  }
  
  desbloquear(veiculo: Veiculo) {
    this.swalWithBootstrapButtons.fire({
      title: 'Desbloqueio',
      text: 'Tem certeza que quer enviar o comando de desbloqueio?',
      // imageUrl: 'assets/modals/desbloquear.png',
      imageWidth: 100,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.desbloquear(veiculo.imei).subscribe( (response) => {
          response.success 
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success')
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error')
        });
      }
    })
  }


  showLabelIcon(type: String) {
    const elementLeafletSwitchIcon = document.getElementById('leaflet-control-icon');
    if (!elementLeafletSwitchIcon) {
      return;
    }

    switch(type) {
      case 'None':
        elementLeafletSwitchIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M432 448a15.92 15.92 0 01-11.31-4.69l-352-352a16 16 0 0122.62-22.62l352 352A16 16 0 01432 448zM255.66 384c-41.49 0-81.5-12.28-118.92-36.5-34.07-22-64.74-53.51-88.7-91v-.08c19.94-28.57 41.78-52.73 65.24-72.21a2 2 0 00.14-2.94L93.5 161.38a2 2 0 00-2.71-.12c-24.92 21-48.05 46.76-69.08 76.92a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416a239.13 239.13 0 0075.8-12.58 2 2 0 00.77-3.31l-21.58-21.58a4 4 0 00-3.83-1 204.8 204.8 0 01-51.16 6.47zM490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96a227.34 227.34 0 00-74.89 12.83 2 2 0 00-.75 3.31l21.55 21.55a4 4 0 003.88 1 192.82 192.82 0 0150.21-6.69c40.69 0 80.58 12.43 118.55 37 34.71 22.4 65.74 53.88 89.76 91a.13.13 0 010 .16 310.72 310.72 0 01-64.12 72.73 2 2 0 00-.15 2.95l19.9 19.89a2 2 0 002.7.13 343.49 343.49 0 0068.64-78.48 32.2 32.2 0 00-.1-34.78z"/><path d="M256 160a95.88 95.88 0 00-21.37 2.4 2 2 0 00-1 3.38l112.59 112.56a2 2 0 003.38-1A96 96 0 00256 160zM165.78 233.66a2 2 0 00-3.38 1 96 96 0 00115 115 2 2 0 001-3.38z"/>
        </svg>
        `;
        this.addStyle('.iconLabel', 'display', 'none');
        this.addStyle('.icon-label-motorista', 'display', 'none');
      break;
      case 'Placa':
        elementLeafletSwitchIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M80,224l37.78-88.15C123.93,121.5,139.6,112,157.11,112H354.89c17.51,0,33.18,9.5,39.33,23.85L432,224" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><rect x="80" y="224" width="352" height="144" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><polyline points="112 368 112 400 80 400 80 368" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><polyline points="432 368 432 400 400 400 400 368" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><circle cx="144" cy="288" r="16" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><circle cx="368" cy="288" r="16" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
        </svg>
        `;
        this.removeStyle('.icon-label-placa', 'display');
        this.removeStyle('.iconLabel', 'display');
      break;
      case 'Motorista':
        elementLeafletSwitchIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M344,144c-3.92,52.87-44,96-88,96s-84.15-43.12-88-96c-4-55,35-96,88-96S348,90,344,144Z" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M256,304c-87,0-175.3,48-191.64,138.6C62.39,453.52,68.57,464,80,464H432c11.44,0,17.62-10.48,15.65-21.4C431.3,352,343,304,256,304Z" style="fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:32px"/>
            </svg>`;
        this.removeStyle('.icon-label-motorista', 'display');
        this.addStyle('.icon-label-placa', 'display', 'none');
      break;
      default:break;
    }
  }

  switchLabelIcon() {
    if (this.veiculoIcon == 'None') {
      this.veiculoIcon = 'Placa';
    } else if (this.veiculoIcon == 'Placa') {
      this.veiculoIcon = 'Motorista';
    } else if (this.veiculoIcon == 'Motorista') {
      this.veiculoIcon = 'None';
    }

    this.showLabelIcon(this.veiculoIcon);
  }


  getAppStylesheet() {
    var stylesheet = document.getElementById('stylesIconMap');
    if (!stylesheet) {
      const elem = document.getElementsByTagName('app-mapa')[0];
      stylesheet = document.createElement("style");
      stylesheet.id = 'stylesIconMap';
      //@ts-ignore
      elem.appendChild(stylesheet);
    }
    //@ts-ignore
    stylesheet = stylesheet.sheet;
    return stylesheet;
  }

  addStyle(selector:String, rulename:String, value:String) {
    var stylesheet = this.getAppStylesheet();
    if (stylesheet) {
      // @ts-ignore
      var cssRules = stylesheet.cssRules || stylesheet.rules;
      // @ts-ignore
      stylesheet.insertRule(selector + ' { ' + rulename + ':' + value + ';}', cssRules.length);
    }
  }

  removeStyle(selector:String, rulename:String) {
    var stylesheet = this.getAppStylesheet();
    if (stylesheet) {
      // @ts-ignore
      var cssRules = stylesheet.cssRules || stylesheet.rules;
      for (var i=0; i<cssRules.length; i++) {
        var rule = cssRules[i];
        if (rule.selectorText == selector && rule.style[0] == rulename) {
          // @ts-ignore
          stylesheet.deleteRule(i);
          break;
        }
      }
    }
  }
}
