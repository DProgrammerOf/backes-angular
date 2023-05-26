import { Location } from '@angular/common';
import { AfterContentInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HistoricoService, Localizacao } from 'src/app/services/cliente/historico.service';
import { ClienteComponent } from '../../../cliente.component';
import { AppComponent } from 'src/app/app.component';

import 'leaflet';
import 'leaflet.markercluster';
declare var L: any;

@Component({
  selector: 'app-desenho',
  templateUrl: './desenho.component.html',
  styleUrls: ['./desenho.component.scss']
})
export class HistoricoDesenhoComponent implements OnInit {
  @ViewChild('map') mapElement: ElementRef | undefined;
  map: L.Map | undefined;
  titlePage: String = 'Desenho';
  historico: Localizacao[] | undefined;
  trajetoLine: any;
  markers:any = [];
  polyline: any;
  constructor(
    protected base: ClienteComponent,
    private service: HistoricoService,
    protected location: Location
  ){
    this.historico = this.service.lastRota as Localizacao[];
  }

  ngOnInit(): void {
    this.loadMap();
  }

  loadMap(): void {
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
      this.trajetoLine =  L.featureGroup([]).addTo(this.map);
      this.proccessRota();
  }

  addMarkerRota(latlng: any, index: any){
    var me = this;

    if(index != null){
      var markerIcon = L.icon({
        iconUrl: 'assets/original/imgs/'+(index == 0 ? 'start.png' : 'end.png'),
        iconAnchor: [14, 35],
        popupAnchor: [2, -46],
      });
      var marker = L.marker(latlng, { icon: markerIcon });
      me.trajetoLine.addLayer(marker);
    }
    else{
      me.markers.push(latlng);
    }
  }

  proccessRota(){
    if(this.historico){
      var mk0 = this.historico[0];
      var mk1 = this.historico[this.historico.length-1];
      console.log(mk0, parseFloat(mk0.latitudeDecimalDegrees.toString()));
      this.addMarkerRota(new L.LatLng(
        parseFloat(mk0.latitudeDecimalDegrees.toString()),
        parseFloat(mk0.longitudeDecimalDegrees.toString())), 0);
      this.addMarkerRota(new L.LatLng(
        parseFloat(mk1.latitudeDecimalDegrees.toString()), 
        parseFloat(mk1.longitudeDecimalDegrees.toString())), 1);
    

      for(var i=0;i<this.historico.length;i++){
        var item = this.historico[i];
        this.addMarkerRota(new L.LatLng(
          parseFloat(item.latitudeDecimalDegrees.toString()),
          parseFloat(item.longitudeDecimalDegrees.toString())), null);
      }
    }
    
    if(this.markers.length>0){
      this.polyline = L.polyline(this.markers, {
        color: '#8800aa',
        weight: 5,
        opacity: 1,
        lineJoin: 'round'
      });
      this.polyline.addTo(this.map)
      this.map?.fitBounds(this.trajetoLine.getBounds());
    }
  }
}
