/**
 * ストライプエフェクト管理
 * 画面上にランダムに出現する横帯（ストライプ）による歪み効果を管理
 */

import { effectParameters } from '../config/effectParameters.js';

/**
 * ストライプの状態を管理するクラス
 */
export class StripeManager {
  /**
   * @param {number} maxStripes 同時に管理できる最大ストライプ数
   */
  constructor(maxStripes) {
    this.maxStripes = maxStripes;

    // 各ストライプの中心位置（Y座標、UV座標系で0.0-1.0）
    // -1.0 は「非アクティブ」を意味する
    this.centers = new Float32Array(maxStripes);

    // 各ストライプによる横方向のずれ量
    this.offsets = new Float32Array(maxStripes);

    // 各ストライプの幅（高さ）
    this.widths = new Float32Array(maxStripes);

    // 各ストライプの残り寿命（秒）
    this.lifetimes = new Float32Array(maxStripes);

    // すべてのストライプを非アクティブ状態で初期化
    this.initializeAll();
  }

  /**
   * すべてのストライプを非アクティブ状態に初期化
   */
  initializeAll() {
    const defaultWidth = effectParameters.stripe.width;

    for (let i = 0; i < this.maxStripes; i++) {
      this.centers[i] = -1.0; // 非アクティブ
      this.offsets[i] = 0.0;
      this.widths[i] = defaultWidth;
      this.lifetimes[i] = 0.0;
    }
  }

  /**
   * 現在アクティブなストライプの数を取得
   * @returns {number} アクティブなストライプ数
   */
  getActiveCount() {
    let count = 0;
    for (let i = 0; i < this.maxStripes; i++) {
      if (this.centers[i] > -0.5) {
        count++;
      }
    }
    return count;
  }

  /**
   * 新しいストライプを生成
   * @returns {boolean} 生成に成功したか
   */
  spawn() {
    const config = effectParameters.stripe;

    // 空きスロットを探す
    for (let i = 0; i < this.maxStripes; i++) {
      if (this.centers[i] < -0.5) {
        // ランダムな垂直位置を設定（画面の端は避ける）
        this.centers[i] = 0.05 + Math.random() * 0.9;

        // ランダムな横方向のずれ量（左右どちらにも振れる）
        const offsetAmount = config.minOffset + Math.random() * (config.maxOffset - config.minOffset);
        this.offsets[i] = offsetAmount * (Math.random() < 0.5 ? -1 : 1);

        // ランダムな幅（基本幅の1倍から2倍）
        this.widths[i] = config.width * (1.0 + Math.random());

        // ランダムな寿命
        this.lifetimes[i] = config.minLifetime + Math.random() * (config.maxLifetime - config.minLifetime);

        return true;
      }
    }

    return false; // 空きスロットがない
  }

  /**
   * すべてのストライプを更新（時間経過による減衰と消滅）
   * @param {number} deltaTime 前フレームからの経過時間（秒）
   */
  update(deltaTime) {
    const config = effectParameters.stripe;

    // フレームレート補正（60FPSを基準とした減衰係数の調整）
    const decayFrames = Math.max(1, deltaTime * 60);

    for (let i = 0; i < this.maxStripes; i++) {
      // アクティブなストライプのみ処理
      if (this.centers[i] > -0.5) {
        // 寿命を減らす
        this.lifetimes[i] = Math.max(0, this.lifetimes[i] - deltaTime);

        // オフセットと幅を徐々に減衰（フェードアウト効果）
        this.offsets[i] *= Math.pow(config.offsetDecay, decayFrames);
        this.widths[i] *= Math.pow(config.widthDecay, decayFrames);

        // 寿命が尽きたら非アクティブ化
        if (this.lifetimes[i] <= 0) {
          this.deactivate(i);
        }
      }
    }
  }

  /**
   * 指定したインデックスのストライプを非アクティブ化
   * @param {number} index ストライプのインデックス
   */
  deactivate(index) {
    this.centers[index] = -1.0;
    this.offsets[index] = 0.0;
    this.widths[index] = effectParameters.stripe.width;
    this.lifetimes[index] = 0.0;
  }

  /**
   * 新しいストライプを確率的に生成
   * @param {number} deltaTime 前フレームからの経過時間（秒）
   */
  trySpawn(deltaTime) {
    const config = effectParameters.stripe;

    // 現在のアクティブ数をチェック
    const activeCount = this.getActiveCount();

    // 最大数に達していなければ、確率的に生成
    if (activeCount < config.maxCount && Math.random() < config.spawnRate) {
      this.spawn();
    }
  }
}
