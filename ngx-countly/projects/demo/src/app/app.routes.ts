import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({ standalone: true, template: '<h2>Home</h2>' })
class Home {}

@Component({ standalone: true, template: '<h2>Pricing</h2>' })
class Pricing {}

export const routes: Routes = [
  { path: '', component: Home, title: 'Home' },
  { path: 'pricing', component: Pricing, title: 'Pricing' },
];
