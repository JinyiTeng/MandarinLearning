import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getFirestore,
  getDocs,
  collection,
  getDoc,
  setDoc,
  where,
  query,
  doc,
  deleteDoc,
} from '@firebase/firestore';
import { LoadingController, NavController } from '@ionic/angular';
import { firebaseApp } from 'src/config/firebase';
import { AppConfig } from '../app.config';
import { PageBase } from '../app.page';
import { AppStore } from '../app.store';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.page.html',
  styleUrls: ['./theme.page.scss'],
})
export class ThemePage extends PageBase implements OnInit {
  drapdownList = [];
  loadingWin: any;

  favorite = false;
  myFavoriteSett: any;

  constructor(
    private router: Router,
    protected loadingCtrl: LoadingController,
    protected appStore: AppStore,
    protected navCtrl: NavController,
    private activeRoute: ActivatedRoute,
    public route: ActivatedRoute
  ) {
    super(appStore, navCtrl, route);
  }

  ngOnInit() {
    this.favorite = !!this.activeRoute.snapshot.params['favorite'];
  }

  ionViewWillEnter() {
    this.getData();
  }

  async getData() {
    console.log('=============');
    this.loadingWin = await this.loadingCtrl.create({
      message: 'data loading ...',
      showBackdrop: true,
      duration: 120000,
    });
    this.loadingWin.present();

    const db = getFirestore(firebaseApp);
    console.log('---------', db);
    const docRef = collection(db, 'DropDownList');
    let qr: any = docRef;
    if (this.favorite) {
      await this.getFavorite();
      console.log('this.myFavoriteSett', this.myFavoriteSett);

      let arr = Object.keys(this.myFavoriteSett);
      if (!arr || arr.length < 1) {
        arr = ['-1'];
      }
      qr = query(docRef, where('Topic', 'in', arr));
    }

    const querySnapshot = await getDocs(qr);
    const arr = [];
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`, JSON.stringify(doc.data()));
      const ditem: any = doc.data();
      if (!ditem.id) {
        ditem.id = doc.id + 1;
      }
      arr.push(ditem);
    });
    this.drapdownList = arr;

    this.loadingWin.dismiss();

    /*
    const docRef = doc(db, 'wordList', '0');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log('No such document!');
    }
  */
  }

  async openWordList(v: any) {
    const fv = await this.getFavorite();
    console.log(fv);

    const arr = fv ? (fv[v.Topic] ?? []) : [];
    const fvStr = arr.join(',');
    this.navCtrl.navigateForward([
      '/english-list',
      { ...v, fvStr: fvStr, favorite: this.favorite ? 1 : '' },
    ]);
  }

  deleteItem(item) {
    this.confirm('Confirm delete the item ?', () => {
      console.log('deleteItem', item);
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, 'DropDownList', item.id);
      deleteDoc(docRef).then(
        () => {
          this.toast('Delete success');
          this.getData();
        },
        (err) => {
          this.toast('Delete faile: ' + err.toString());
        }
      );
    });
  }

  async getFavorite() {
    if (this.myFavoriteSett) {
      return this.myFavoriteSett;
    }
    const db = getFirestore(firebaseApp);
    const dataDoc = await getDoc(doc(db, 'myFavorites', this.$sess.uid));

    let ditem = dataDoc.data();
    console.log(this.$sess.uid, JSON.stringify(ditem));
    this.myFavoriteSett = ditem ? this.copy(ditem['items']) : {};
  }
}
