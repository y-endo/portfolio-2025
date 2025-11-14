/**
 * グリッチエフェクト管理
 * Three.jsのGlitchPassとカスタムシェーダーのグリッチ効果を制御
 */

import { effectParameters } from '../config/effectParameters.js';

/**
 * グリッチエフェクトの状態を管理するクラス
 */
export class GlitchEffectManager {
  /**
   * @param {Object} glitchPass Three.jsのGlitchPassインスタンス
   * @param {Object} shaderPass カスタムシェーダーのShaderPassインスタンス
   */
  constructor(glitchPass, shaderPass) {
    this.glitchPass = glitchPass;
    this.shaderPass = shaderPass;

    // 基本パラメータ（残響効果から復元するために保持）
    this.baseSmallAmplitude = shaderPass.uniforms.smallAmplitude.value;
    this.baseBigAmplitude = shaderPass.uniforms.bigAmplitude.value;

    // グリッチ効果が現在アクティブか
    this.isActive = false;

    // 残響効果の強度（0.0-1.0、時間で減衰）
    this.residualIntensity = 0.0;

    // 最後にグリッチが発生した時刻（ミリ秒）
    this.lastTriggerTime = 0;

    // タイムアウトID（効果終了時にクリーンアップするため）
    this.timeoutId = null;
  }

  /**
   * グリッチエフェクトを更新（フレームごとに呼び出す）
   * @param {number} deltaTime 前フレームからの経過時間（秒）
   */
  update(deltaTime) {
    const config = effectParameters.glitchPass;

    if (!config.enabled) {
      return;
    }

    // ===== 1. 確率的なグリッチ発生 =====
    const currentTime = Date.now();
    const timeSinceLastGlitch = currentTime - this.lastTriggerTime;

    // 最小間隔が経過していて、かつ確率判定を通過したら発動
    if (!this.isActive && timeSinceLastGlitch >= config.minInterval && Math.random() < config.probability) {
      this.trigger();
    }

    // ===== 2. 残響効果の減衰 =====
    if (this.residualIntensity > 0) {
      this.residualIntensity = Math.max(0, this.residualIntensity - config.residualDecay * deltaTime);
    }

    // ===== 3. シェーダーパラメータに残響を反映 =====
    // 残響の強度に応じて、微細ノイズと大ジッターの振幅を増加
    this.shaderPass.uniforms.smallAmplitude.value =
      this.baseSmallAmplitude + this.residualIntensity * config.residualSmallAmplitude;

    this.shaderPass.uniforms.bigAmplitude.value =
      this.baseBigAmplitude + this.residualIntensity * config.residualBigAmplitude;
  }

  /**
   * グリッチエフェクトを発動
   */
  trigger() {
    const config = effectParameters.glitchPass;

    // 状態を更新
    this.isActive = true;
    this.lastTriggerTime = Date.now();
    this.residualIntensity = 1.0; // 残響を最大に

    // GlitchPassの「goWild」モードを確率的に有効化
    // goWildは非常に強いグリッチ効果なので、控えめに使う
    const previousGoWild = this.glitchPass.goWild;
    if (Math.random() < config.goWildProbability) {
      this.glitchPass.goWild = true;
    }

    // 一定時間後に効果を終了
    this.timeoutId = setTimeout(
      () => {
        this.glitchPass.goWild = previousGoWild;
        this.isActive = false;
        this.timeoutId = null;
      },
      Math.max(20, Math.floor(config.duration))
    );
  }

  /**
   * クリーンアップ（インスタンス破棄時に呼び出す）
   */
  dispose() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
