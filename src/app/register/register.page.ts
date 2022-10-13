import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppNet } from '../app.net';
import { PageBase } from '../app.page';
import { AppStore } from '../app.store';
import { AppUtil } from '../app.util';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage extends PageBase implements OnInit {

  form = {
    name: '',
    account: '',
    password: 'xxxxxx',
    rePassword: 'xxxxxx',
  };

  // agree = false;
  ccc = '';

  constructor(
    protected appStore: AppStore,
    protected navCtrl: NavController,
    public route: ActivatedRoute
  ) {
    super(appStore, navCtrl, route);
  }

  ngOnInit() { }

  async onSubmit() {
    //fixme

    await this.toast('Register success');
    this.hrefReplace('/login');
  }
}
