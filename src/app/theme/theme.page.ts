import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getFirestore,
  getDocs,
  collection,
  doc,
  deleteDoc,
} from '@firebase/firestore';
import { LoadingController, NavController } from '@ionic/angular';
import { firebaseApp } from 'src/config/firebase';
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

  constructor(
    private router: Router,
    protected loadingCtrl: LoadingController,
    protected appStore: AppStore,
    protected navCtrl: NavController,
    public route: ActivatedRoute
  ) {
    super(appStore, navCtrl, route);
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.getData();
  }

  async getData() {
      console.log('---------');

    this.loadingWin = await this.loadingCtrl.create({
      message: 'data loading ...',
      showBackdrop: true,
      duration: 120000,
    });
    this.loadingWin.present();

    const db = getFirestore(firebaseApp);
    console.log('---------', db);

    const querySnapshot = await getDocs(collection(db, 'DropDownList'));
    const arr = [];
    querySnapshot.forEach((doc) => {
      // console.log(`${doc.id} => ${doc.data()}`, JSON.stringify(doc.data()));
      const ditem = doc.data();
      if (!ditem.id) {
        ditem.id = doc.id;
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

  openWordList(v: any) {
    this.router.navigate(['/english-list', v]);
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
}
