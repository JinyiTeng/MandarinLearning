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
import Recorder from 'js-audio-recorder';
import Player from '../utils/player/player';
import { encodeWAV } from '../utils/transform/transform';
import { AppConfig } from '../app.config';

let recorder = null;
let playTimer = null;
let drawPlayId = null;
let drawRecordId = null;

//Tab 2 to add new word to database
@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class WordCreatePage extends PageBase implements OnInit {
  item: any;
  rec: Recorder;

  audio: any;
  topic = '';

  audioFile: File;
  public createWordForm: FormGroup;

  state = {
    sampleBit: 16,
    sampleRate: 16000,
    numChannel: 1,
    compiling: false,
    isRecording: false, // 是否正在录音
    duration: 0,
    fileSize: 0,
    vol: 0,
  };

  recordStatusStr = 'none';
  fileUrlData = '';

  constructor(
  private activeRoute: ActivatedRoute,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    formBuilder: FormBuilder,
    public navCtrl: NavController,
    protected appStore: AppStore,
    public route: ActivatedRoute
  ) {
    super(appStore, navCtrl, route);

    this.createWordForm = formBuilder.group({
      translation: ['', Validators.required],
      mandarin: ['', Validators.required],
      literal: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.item = this.activeRoute.snapshot.params;
    this.topic = this.item ? this.item.Topic : '';
  }

  async createWord() {
    const loading = await this.loadingCtrl.create();

    const translation = this.createWordForm.value.translation;
    const mandarin = this.createWordForm.value.mandarin;
    const literal = this.createWordForm.value.literal;

    const db = getFirestore(firebaseApp);
    const querySnapshot = await getDocs(collection(db, 'wordList'));
    let id = 0;
    querySnapshot.forEach((doc) => {
      let did = Number(doc.id);
      id = Math.max(id, isNaN(did) ? 0 : did);
    });

    id++;
    console.log(id, id);
    setDoc(doc(db, 'wordList', '' + id), {
      id: '' + id,
      uid: this.$sess.uid,
      Topic: this.topic,
      Translation: translation,
      Mandarin: mandarin,
      Literal: literal,
      FileUrl: this.fileUrlData,
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

  // 录音开启
  startRecord() {
    this.clearPlay();

    const config = this.collectData();

    if (!recorder) {
      recorder = new Recorder(config);

      recorder.onprocess = function (duration) {
        // this.setState({
        //     duration: duration.toFixed(5),
        // });
        // 推荐使用 onprogress
      };

      recorder.onprogress = (params: any) => {
        // console.log(recorder.duration);
        // console.log(recorder.fileSize);

        this.setState({
          duration: params.duration.toFixed(5),
          fileSize: params.fileSize,
          vol: params.vol.toFixed(2),
        });
        // 此处控制数据的收集频率
        if (config.compiling) {
          console.log('音频总数据：', params.data);
        }
      };

      recorder.onplay = () => {};
      recorder.onpauseplay = () => {};
      recorder.onresumeplay = () => {};
      recorder.onstopplay = () => {};
      recorder.onplayend = () => {
        this.stopDrawPlay();
      };

      config.compiling &&
        (playTimer = setInterval(() => {
          if (!recorder) {
            return;
          }

          let newData = recorder.getNextData();
          if (!newData.length) {
            return;
          }
          let byteLength = newData[0].byteLength;
          let buffer = new ArrayBuffer(newData.length * byteLength);
          let dataView = new DataView(buffer);

          // 数据合并
          for (let i = 0, iLen = newData.length; i < iLen; ++i) {
            for (let j = 0, jLen = newData[i].byteLength; j < jLen; ++j) {
              dataView.setInt8(i * byteLength + j, newData[i].getInt8(j));
            }
          }

          let a = encodeWAV(
            dataView,
            config.sampleRate,
            config.sampleRate,
            config.numChannels,
            config.sampleBits
          );
          let blob: any = new Blob([a], { type: 'audio/wav' });

          blob.arrayBuffer().then((arraybuffer) => {
            Player.play(arraybuffer);
          });
        }, 3000));
    } else {
      recorder.stop();
    }
    this.state.isRecording = true;
    recorder.start().then(
      () => {
        console.log('开始录音');
      },
      (error) => {
        console.log(`异常了,${error.name}:${error.message}`);
      }
    );
  }

  clearPlay() {
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    if (drawRecordId) {
      cancelAnimationFrame(drawRecordId);
      drawRecordId = null;
    }
    this.stopDrawPlay();
  }

  setState(v: any) {}

  stopDrawPlay = () => {
    drawPlayId && cancelAnimationFrame(drawPlayId);
    drawPlayId = null;
  };

  collectData() {
    return {
      sampleBits: this.state.sampleBit,
      sampleRate: this.state.sampleRate,
      numChannels: this.state.numChannel,
      compiling: this.state.compiling, // 是否开启边录音边转化（后期改用web worker）
    };
  }

  //录音停止
  endRecord() {
    recorder && recorder.stop();
    console.log('结束录音');
    drawRecordId && cancelAnimationFrame(drawRecordId);
    drawRecordId = null;
    this.clearPlay();
    this.state.isRecording = false;
    this.saveRecord();
  }

  recordStartOrStop() {
    if (this.state.isRecording) {
      this.endRecord();
    } else {
      this.startRecord();
    }
  }

  saveRecord() {
    const wavBlob = recorder.getWAVBlob();
    const a = new FileReader();
    a.onload = (e) => {
      if (e.target.result) {
        this.recordStatusStr = 'Completed';
        this.fileUrlData = e.target.result.toString();
      }
    };
    a.readAsDataURL(wavBlob);
  }
}
