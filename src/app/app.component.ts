import { trigger, state, transition, animate, style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';
import { fadeInOutAnimation, contentLoading, openLoading, showActionSheet } from './app.animation';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    fadeInOutAnimation, 
    contentLoading,
    openLoading
  ]
})
export class AppComponent implements OnInit {
  platform: String | undefined; //= 'android';
  protected loading: Boolean = false;
  protected loadingText: String = '';
  constructor (private contexts: ChildrenOutletContexts) {}

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  log(name: any, data: any = null): void {
    console.log("angular (webview)", name, data);
  }

  setStatus(status: Boolean): void {
    this.loading = status;
  }

  getStatus(): Boolean {
    return this.loading;
  }

  setStatusText(text: String): void {
    this.loadingText = text;
  }

  ngOnInit(): void {
  }
}
