import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PageBase } from '../app.page';
import { AppStore } from '../app.store';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage extends PageBase implements OnInit {
  public folder: string;

  constructor(private activatedRoute: ActivatedRoute,
    protected appStore: AppStore,
    protected navCtrl: NavController,
    public route: ActivatedRoute,
    ) {
    super(appStore, navCtrl, route);
   }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
  }

}
