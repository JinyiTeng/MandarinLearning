import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { FirestoreService } from '../services/firestore.service';
import { Router } from '@angular/router';

//Tab 2 to add new word to database
@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {
  audio: any;

  audioFile: File;
  public createWordForm: FormGroup;
  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private firestoreService: FirestoreService,
    formBuilder: FormBuilder,
    private router: Router
  ) {
    this.createWordForm = formBuilder.group({
      mandarin: ['', Validators.required],
      english: ['', Validators.required],
      example: ['', Validators.required],
      partOfSpeech: ['', Validators.required],
    });
  }
  async createWord() {
    const loading = await this.loadingCtrl.create();

    const english = this.createWordForm.value.english;
    const mandarin = this.createWordForm.value.mandarin;
    const example = this.createWordForm.value.example;
    const partOfSpeech = this.createWordForm.value.partOfSpeech;
    const audio = null;
    this.firestoreService
      .createWord(mandarin, english, example, partOfSpeech, audio)
      .then(
        () => {
          loading.dismiss().then(() => {
            this.router.navigateByUrl('');
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

  ngOnInit() {}
}
