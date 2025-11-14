/**
 * カスタムシェーダー定義
 * サイバーパンク風のポストプロセッシング効果を実現するGLSLシェーダー
 */

import * as THREE from 'three';
import { shaderConstants } from '../config/effectParameters.js';

/**
 * サイバーパンクエフェクト用のカスタムシェーダーを生成
 * @returns {Object} シェーダーオブジェクト（uniforms, vertexShader, fragmentShader）
 */
export function createCyberpunkShader() {
  const MAX_STRIPES = shaderConstants.maxStripes;

  return {
    // ===== Uniforms: JavaScriptからシェーダーに渡す変数 =====
    uniforms: {
      // 前段階のレンダリング結果（テクスチャ）
      tDiffuse: { value: null },

      // 時間（秒単位、アニメーション用）
      time: { value: 0 },

      // 画面解像度（ピクセル単位）
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },

      // ===== 微細なノイズ効果 =====
      // 画像全体にわずかな色ずれを加える振幅
      smallAmplitude: { value: 0.0 },

      // ===== 大きなジッター効果 =====
      // 画面全体が揺れる効果の振幅
      bigAmplitude: { value: 0.02 },
      // 効果の有効/無効フラグ（0.0 or 1.0）
      bigActive: { value: 0.0 },

      // ===== 走査線エフェクト =====
      // 走査線の強度と密度
      scanlineIntensity: { value: 0.12 },
      scanlineFrequency: { value: 1.5 },

      // ===== RGB カラーシフト =====
      // 各チャンネルの横方向のずれ量
      rgbShiftRed: { value: 0.0 },
      rgbShiftGreen: { value: 0.0 },
      rgbShiftBlue: { value: 0.0 },
      // パルス強度（0.0-1.0、時間で減衰）
      rgbPulse: { value: 0.0 },

      // ===== ビネット効果 =====
      // 画面周辺の暗さ（0.0-1.0）
      vignetteStrength: { value: 0.0 },

      // ===== 彩度調整 =====
      // 色の鮮やかさ（0.0=モノクロ、1.0=元の色）
      saturation: { value: 1.0 },

      // ===== ストライプ効果 =====
      // 現在アクティブなストライプの数
      stripeCount: { value: 0 },
      // 各ストライプの中心位置（Y座標、UV座標系）
      stripes: { value: new Float32Array(MAX_STRIPES) },
      // 各ストライプによる横方向のずれ量
      stripeOffsets: { value: new Float32Array(MAX_STRIPES) },
      // 各ストライプの幅（高さ）
      stripeWidths: { value: new Float32Array(MAX_STRIPES) },
    },

    // ===== 頂点シェーダー =====
    // 画面全体を覆う四角形の各頂点を処理
    // UV座標（テクスチャ座標）をフラグメントシェーダーに渡すだけのシンプルな実装
    vertexShader: `
      // UV座標（0.0-1.0の範囲で画面上の位置を表す）
      varying vec2 vUv;

      void main() {
        // UV座標をフラグメントシェーダーに渡す
        vUv = uv;

        // 頂点の最終位置を計算（標準的な変換）
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    // ===== フラグメントシェーダー =====
    // 画面の各ピクセル（フラグメント）の色を計算
    fragmentShader: `
      // 浮動小数点の精度を指定（mediump=中精度、パフォーマンスと品質のバランス）
      precision mediump float;

      // ===== Uniform変数（JavaScriptから受け取る値） =====
      uniform sampler2D tDiffuse;        // 入力テクスチャ
      uniform float time;                // 経過時間
      uniform vec2 resolution;           // 画面解像度
      uniform float smallAmplitude;      // 微細ノイズの振幅
      uniform float bigAmplitude;        // 大ジッターの振幅
      uniform float bigActive;           // 大ジッターの有効フラグ
      uniform float scanlineIntensity;   // 走査線の強度
      uniform float rgbShiftRed;         // R チャンネルのずれ
      uniform float rgbShiftGreen;       // G チャンネルのずれ
      uniform float rgbShiftBlue;        // B チャンネルのずれ
      uniform float rgbPulse;            // RGB パルスの強度
      uniform float scanlineFrequency;   // 走査線の密度
      uniform float vignetteStrength;    // ビネット効果の強さ
      uniform float saturation;          // 彩度
      uniform int stripeCount;           // アクティブなストライプ数
      uniform float stripes[${MAX_STRIPES}];        // ストライプの位置
      uniform float stripeOffsets[${MAX_STRIPES}];  // ストライプのずれ量
      uniform float stripeWidths[${MAX_STRIPES}];   // ストライプの幅

      // 頂点シェーダーから受け取るUV座標
      varying vec2 vUv;

      /**
       * 擬似乱数生成関数
       * 同じ座標に対して常に同じ値を返す決定論的な乱数
       * @param co 2次元座標
       * @return 0.0-1.0の範囲の乱数
       */
      float random(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        // 現在のピクセルのUV座標
        vec2 uv = vUv;

        // ===== 1. 微細な色ずれ効果 =====
        // 画面全体にわずかな揺らぎを加えて質感を出す
        vec2 subtleOffset = vec2(
          sin(uv.y * 30.0),
          cos(uv.x * 20.0)
        ) * smallAmplitude;

        // ===== 2. 大きなジッター効果 =====
        // ランダムな方向に画面全体を大きく揺らす
        vec2 bigJitterOffset = vec2(
          random(uv + time) - 0.5,
          random(uv * 2.0 - time) - 0.5
        ) * bigAmplitude * bigActive;

        // ===== 3. ストライプによる歪み効果 =====
        // 横帯が現れた部分で画像を横方向にずらす
        vec2 stripeOffset = vec2(0.0);
        for (int i = 0; i < ${MAX_STRIPES}; i++) {
          if (i < stripeCount) {
            float center = stripes[i];
            float width = stripeWidths[i];

            // smoothstep で滑らかなグラデーションを作る
            // ストライプの上端から中心にかけて 0→1
            float fadeIn = smoothstep(center - width * 0.5, center, uv.y);
            // ストライプの中心から下端にかけて 1→0
            float fadeOut = 1.0 - smoothstep(center, center + width * 0.5, uv.y);

            // 両方を掛け合わせることで、中心で最大、両端で0のグラデーションになる
            float influence = fadeIn * fadeOut;

            stripeOffset.x += stripeOffsets[i] * influence;
          }
        }

        // ===== 4. すべてのオフセットを合成 =====
        vec2 totalOffset = subtleOffset + bigJitterOffset + stripeOffset;

        // ===== 5. RGB チャンネル個別サンプリング =====
        // 各色チャンネルを少しずつ異なる位置から取得することで
        // カラーフリンジ（色収差）のような効果を生む

        // パルス強度を加味したシフト量を計算
        float redShift = rgbShiftRed * rgbPulse;
        float greenShift = rgbShiftGreen * rgbPulse;
        float blueShift = rgbShiftBlue * rgbPulse;

        // 各チャンネルを異なるオフセットでサンプリング
        // totalOffset の係数を変えることで、各チャンネルの歪み方も変える
        float red = texture2D(
          tDiffuse,
          uv + totalOffset * 1.0 + vec2(redShift, 0.0)
        ).r;

        float green = texture2D(
          tDiffuse,
          uv + totalOffset * 0.6 + vec2(greenShift, 0.0)
        ).g;

        float blue = texture2D(
          tDiffuse,
          uv + totalOffset * 0.2 + vec2(blueShift, 0.0)
        ).b;

        // RGB を合成して最終的な色を作る
        vec3 color = vec3(red, green, blue);

        // ===== 6. 走査線エフェクト =====
        // ブラウン管TVのような水平ラインを描画
        float scanline = sin(
          uv.y * resolution.y * scanlineFrequency + time * 40.0
        ) * scanlineIntensity;
        color -= scanline;

        // ===== 7. ビネット効果 =====
        // 画面の中心から離れるほど暗くする
        float distanceFromCenter = distance(uv, vec2(0.5));
        // smoothstep で滑らかなグラデーションを作る
        float vignette = smoothstep(0.8, 0.2, distanceFromCenter);
        // vignetteStrength で効果の強さを調整
        color *= mix(1.0 - vignetteStrength, 1.0, vignette);

        // ===== 8. 彩度調整 =====
        // 輝度（明るさ）を計算（人間の目の感度に合わせた係数）
        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
        // 元の色とモノクロ（輝度）を彩度パラメータでブレンド
        color = mix(vec3(luminance), color, saturation);

        // ===== 最終出力 =====
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  };
}
