import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { firebaseApp } from 'src/config/firebase';
import {
  getFirestore,
  getDocs,
  collection,
  setDoc,
  doc,
  getDoc,
  query,
  where,
} from '@firebase/firestore';
import { PageBase } from '../app.page';
import { AppStore } from '../app.store';
import { AppConfig } from '../app.config';

//Tab 2 to add new word to database
@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class ThemeCreatePage extends PageBase implements OnInit {
  audio: any;

  audioFile: File;
  public createWordForm: FormGroup;
  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    formBuilder: FormBuilder,
    protected appStore: AppStore,
    protected navCtrl: NavController,
    public route: ActivatedRoute
  ) {
    super(appStore, navCtrl, route);

    this.createWordForm = formBuilder.group({
      topic: ['', Validators.required],
      translate: ['', Validators.required],
    });
  }

  ngOnInit() {
  }

  async createTheme() {
    const loading = await this.loadingCtrl.create();
    /// {"Topic":"运动会","Translate":"sports competition"}

    const topic = this.createWordForm.value.topic;
    const translate = this.createWordForm.value.translate;

    const db = getFirestore(firebaseApp);
    const querySnapshot = await getDocs(collection(db, 'DropDownList'));
    let id = 0;
    querySnapshot.forEach((doc) => {
      let did = Number(doc.id);
      id = Math.max(id, isNaN(did) ? 0 : did);
    });

    id++;
    console.log(id, id);
    setDoc(doc(db, 'DropDownList', '' + id), {
      id: '' + id,
      uid: this.$sess.uid,
      Topic: topic,
      Translate: translate,
    }).then(
      () => {
        loading.dismiss().then(() => {
          this.navCtrl.pop();
        });
      },
      (error) => {
        loading.dismiss().then(() => {
          console.error(error);
        });
      }
    );

    return await loading.present();
  }
}
