import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import {
  getFirestore,
  getDocs,
  collection,
  doc,
  deleteDoc,
  query,
  setDoc,
  where,
} from '@firebase/firestore';
import { LoadingController, NavController } from '@ionic/angular';
import { firebaseApp } from 'src/config/firebase';
import { PageBase } from '../app.page';
import { AppStore } from '../app.store';

@Component({
  selector: 'app-english-list',
  templateUrl: './english-list.page.html',
  styleUrls: ['./english-list.page.scss'],
})
export class EnglishListPage extends PageBase implements OnInit {
  wordList = [];
  item: any;
  favorite = false;
  fvArr: any[];

  loadingWin: any;
  loadingWin1: any;
  drapdownList = [];
  constructor(
    private router: Router,
    protected appStore: AppStore,
    protected navCtrl: NavController,
    public route: ActivatedRoute,
    private activeRoute: ActivatedRoute,
    protected loadingCtrl: LoadingController
  ) {
    super(appStore, navCtrl, route);
  }

  ngOnInit() {
    this.item = this.activeRoute.snapshot.params;
    this.favorite = !!this.item['favorite'];
    this.fvArr = (this.item['fvStr'] ?? '-1').split(',');
    console.log(this.item);
  }

  ionViewWillEnter() {
    this.getData();
  }

  async getData() {
    if (!this.item) {
      return;
    }

    this.loadingWin = await this.loadingCtrl.create({
      message: 'data loading ...',
      showBackdrop: true,
      duration: 120000,
    });
    this.loadingWin.present();

    const db = getFirestore(firebaseApp);
    const docsRef = collection(db, 'wordList');

    // Create a query against the collection.
    let wh = where('Topic', '==', this.item.Topic);
    if (this.favorite) {
      let arr = this.fvArr;
      if (!arr) {
        arr = ['-1'];
      }
      wh = where('id', 'in', arr);
    }
    console.log('wh', wh);
    const q = query(docsRef, wh);

    const querySnapshot = await getDocs(q);
    const arr = [];
    const docFunc = doc;
    querySnapshot.forEach((doc) => {
      // console.log(`${doc.id} => `, JSON.stringify(doc.data()));
      const ditem = doc.data();
      if (!ditem.id) {
        ditem.id = doc.id + 1;
      }
      arr.push(ditem);
    });
    this.wordList = arr;


    this.loadingWin.dismiss();
  }

  openWordInfo(v: any) {
    this.navCtrl.navigateForward([
      '/word-info',
      { ...v, favorite: this.favorite ? 1 : '' },
    ]);
  }

  openAddWord() {
    console.log(this.item, '++++++++++++++');
    this.router.navigate(['/word-create', this.item]);
  }

  deleteItem(item) {
    this.confirm('Confirm delete the item ?', () => {
      console.log('deleteItem', item);
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, 'wordList', item.id);
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
