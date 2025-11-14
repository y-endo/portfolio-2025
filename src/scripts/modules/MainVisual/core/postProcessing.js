/**
 * ポストプロセッシング設定
 * Three.jsのEffectComposerを使用して複数のエフェクトを組み合わせる
 */

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { createCyberpunkShader } from '../shaders/cyberpunkShader.js';
import { effectParameters, shaderConstants } from '../config/effectParameters.js';
import { StripeManager } from '../effects/StripeManager.js';
import { GlitchEffectManager } from '../effects/GlitchEffectManager.js';
import { RgbShiftManager } from '../effects/RgbShiftManager.js';
import { BigJitterManager } from '../effects/BigJitterManager.js';
import { SubtleNoiseManager } from '../effects/SubtleNoiseManager.js';
import { getViewportSize, updateBackgroundAspect } from './sceneSetup.js';

/**
 * ポストプロセッシングコンポーザーをセットアップ
 * @param {THREE.WebGLRenderer} renderer WebGLレンダラー
 * @param {THREE.Scene} scene 描画するシーン
 * @param {THREE.Camera} camera カメラ
 * @returns {Object} コンポーザーと各エフェクトマネージャー
 */
export function setupPostProcessing(renderer, scene, camera) {
  // ===== EffectComposer の作成 =====
  // 複数のポストプロセッシングパスを順次適用するコンテナ
  const composer = new EffectComposer(renderer);

  // ===== RenderPass の追加 =====
  // シーンを通常通りレンダリングしてテクスチャに描き込む
  // これがすべてのポストプロセッシングの入力となる
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // ===== カスタムシェーダーパスの追加 =====
  // サイバーパンク風のエフェクト（RGB シフト、ストライプなど）
  const cyberpunkShader = createCyberpunkShader();
  const cyberpunkPass = new ShaderPass(cyberpunkShader);

  // シェーダーパラメータの初期値を設定
  initializeShaderParameters(cyberpunkPass);

  // コンポーザーに追加
  composer.addPass(cyberpunkPass);

  // ===== GlitchPass の追加 =====
  // Three.js標準のグリッチエフェクト
  const glitchPass = new GlitchPass();
  glitchPass.goWild = false; // 最初は穏やかなモード
  glitchPass.enabled = effectParameters.glitchPass.enabled;
  composer.addPass(glitchPass);

  // ===== エフェクトマネージャーの作成 =====
  const stripeManager = new StripeManager(shaderConstants.maxStripes);
  const glitchEffectManager = new GlitchEffectManager(glitchPass, cyberpunkPass);
  const rgbShiftManager = new RgbShiftManager(cyberpunkPass);
  const bigJitterManager = new BigJitterManager(cyberpunkPass);
  const subtleNoiseManager = new SubtleNoiseManager(cyberpunkPass);

  return {
    composer,
    cyberpunkPass,
    stripeManager,
    glitchEffectManager,
    rgbShiftManager,
    bigJitterManager,
    subtleNoiseManager,
  };
}

/**
 * シェーダーパラメータの初期値を設定
 * @param {ShaderPass} cyberpunkPass カスタムシェーダーパス
 */
function initializeShaderParameters(cyberpunkPass) {
  const uniforms = cyberpunkPass.uniforms;

  // 微細ノイズ
  uniforms.smallAmplitude.value = effectParameters.subtleNoise.baseAmplitude;

  // ビッグジッター
  uniforms.bigAmplitude.value = effectParameters.bigJitter.amplitude;
  uniforms.bigActive.value = 0.0;

  // 走査線
  uniforms.scanlineIntensity.value = effectParameters.scanline.intensity;
  uniforms.scanlineFrequency.value = effectParameters.scanline.frequency;

  // ビネット
  uniforms.vignetteStrength.value = effectParameters.vignette.strength;

  // 彩度
  uniforms.saturation.value = effectParameters.saturation;

  // RGB シフト
  uniforms.rgbShiftRed.value = 0.0;
  uniforms.rgbShiftGreen.value = 0.0;
  uniforms.rgbShiftBlue.value = 0.0;
  uniforms.rgbPulse.value = 0.0;

  // ストライプ
  uniforms.stripeCount.value = 0;
}

/**
 * ウィンドウリサイズ時の処理
 * @param {THREE.Mesh} backgroundMesh 背景メッシュ（アスペクト比調整用）
 */
export function handleResize(backgroundMesh) {
  const { width, height } = getViewportSize();

  // 背景画像のアスペクト比を調整
  if (backgroundMesh) {
    updateBackgroundAspect(backgroundMesh, width, height);
  }
}
