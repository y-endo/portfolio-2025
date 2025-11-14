/**
 * サイバーパンク風ビジュアルエフェクト
 *
 * このスクリプトは以下の機能を提供します:
 * - 背景画像の表示（アスペクト比を保持したobject-fit: cover風の表示）
 * - RGB カラーシフト（色収差風エフェクト）
 * - グリッチエフェクト（デジタルノイズ）
 * - ストライプによる画像歪み
 * - 走査線エフェクト（ブラウン管TV風）
 * - ビッグジッター（画面全体の揺れ）
 * - サブトルノイズ（微細な揺らぎ）
 */

import { initializeScene, loadBackgroundImage } from './core/sceneSetup.js';
import { setupPostProcessing, handleResize } from './core/postProcessing.js';
import { startAnimationLoop } from './core/animationLoop.js';
import { getCurrentBreakpoint } from '@/scripts/utils/responsive.js';

/**
 * アプリケーションの初期化
 */
export class MainVisual {
  constructor(selector) {
    const rootElement = document.querySelector(selector);
    if (!rootElement) {
      console.error(`Element not found for selector: ${selector}`);
      return;
    }

    // ===== Three.js の基本セットアップ =====
    const { scene, camera, renderer } = initializeScene(rootElement);

    // ===== 背景画像の読み込み =====
    // アスペクト比を保持しながら画面全体にフィットさせる
    loadBackgroundImage(scene, '/assets/images/bg.jpg').then((backgroundMesh) => {
      // ===== ポストプロセッシングのセットアップ =====
      const {
        composer,
        cyberpunkPass,
        stripeManager,
        glitchEffectManager,
        rgbShiftManager,
        bigJitterManager,
        subtleNoiseManager,
      } = setupPostProcessing(renderer, scene, camera);

      // ===== ウィンドウリサイズ対応 =====
      let resizeTimeout = null;
      const resizeHandler = () => {
        const breakpoint = getCurrentBreakpoint();
        if (breakpoint === 'sm' || breakpoint === 'xs') {
          return;
        }

        handleResize(backgroundMesh);

        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        resizeTimeout = setTimeout(() => {
          handleResize(backgroundMesh);
        }, 50);
      };

      window.addEventListener('resize', resizeHandler);

      // ===== アニメーションループの開始 =====
      startAnimationLoop({
        composer,
        cyberpunkPass,
        stripeManager,
        glitchEffectManager,
        rgbShiftManager,
        bigJitterManager,
        subtleNoiseManager,
      });
    });
  }
}
