/**
 * Three.jsシーンの初期化
 * 背景画像を表示するためのシーン、カメラ、レンダラーをセットアップ
 */

import * as THREE from 'three';

/**
 * 正確なビューポートサイズを取得
 * iOS Safari のステータスバーなどを除いた実際の表示領域を取得
 * @returns {{ width: number, height: number }}
 */
export function getViewportSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return { width, height };
}

/**
 * Three.jsの基本要素（シーン、カメラ、レンダラー）を初期化
 * @returns {Object} scene, camera, renderer を含むオブジェクト
 */
export function initializeScene(rootElement) {
  // ===== シーンの作成 =====
  // シーンは3Dオブジェクトを配置するための仮想空間
  const scene = new THREE.Scene();

  // ===== カメラの作成 =====
  // OrthographicCamera（正投影カメラ）を使用
  // 遠近感がないため、2D画像をそのまま表示するのに適している
  // パラメータ: left, right, top, bottom, near, far
  // -1 から 1 の範囲で画面全体をカバーする設定
  const camera = new THREE.OrthographicCamera(
    -1, // left（左端）
    1, // right（右端）
    1, // top（上端）
    -1, // bottom（下端）
    0, // near（最も近い描画距離）
    10 // far（最も遠い描画距離）
  );

  // カメラをZ軸方向に少し移動（オブジェクトが見える位置に配置）
  camera.position.z = 1;

  // ===== レンダラーの作成 =====
  // WebGLを使用して3Dグラフィックスを描画
  const renderer = new THREE.WebGLRenderer({
    antialias: true, // エッジを滑らかにする（アンチエイリアシング）
  });

  // デバイスのピクセル比を設定（Retina ディスプレイなどの高解像度対応）
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  // 正確なビューポートサイズを取得
  const { width, height } = getViewportSize();
  renderer.setSize(width, height, false); // false: スタイルを更新しない

  // canvas要素のスタイルを明示的に設定（余白を完全に除去）
  const canvas = renderer.domElement;
  canvas.classList.add('absolute', 'top-0', 'left-0', 'w-full', 'h-full', 'block');

  // レンダラーのcanvas要素をDOMに追加（画面に表示）
  rootElement.appendChild(canvas);

  return { scene, camera, renderer };
}

/**
 * 背景画像を読み込んでシーンに追加
 * @param {THREE.Scene} scene 画像を追加するシーン
 * @param {string} imagePath 画像ファイルのパス
 * @returns {Promise<THREE.Mesh>} 背景メッシュ（アスペクト比調整用に返す）
 */
export function loadBackgroundImage(scene, imagePath) {
  return new Promise((resolve, reject) => {
    // ===== テクスチャの読み込み =====
    // TextureLoaderを使用して画像を非同期で読み込む
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      imagePath,
      // 読み込み完了時のコールバック
      (loadedTexture) => {
        // テクスチャフィルタの設定
        // LinearFilterは拡大・縮小時に滑らかに補間する
        loadedTexture.minFilter = THREE.LinearFilter; // 縮小時
        loadedTexture.magFilter = THREE.LinearFilter; // 拡大時

        // テクスチャを更新（GPUに再転送）
        loadedTexture.needsUpdate = true;

        // ===== 画像のアスペクト比を取得 =====
        const imageAspect = loadedTexture.image.width / loadedTexture.image.height;

        // ===== 画面全体を覆う平面の作成 =====
        // PlaneGeometry: 幅2、高さ2の平面（カメラの可視範囲に合わせている）
        const planeGeometry = new THREE.PlaneGeometry(2, 2);

        // MeshBasicMaterial: ライトの影響を受けない単純なマテリアル
        // テクスチャをそのまま表示するのに適している
        const planeMaterial = new THREE.MeshBasicMaterial({
          map: loadedTexture, // 読み込んだテクスチャを適用
        });

        // メッシュ（ジオメトリとマテリアルを組み合わせたオブジェクト）を作成
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

        // メッシュに画像のアスペクト比を保存（リサイズ時に使用）
        planeMesh.userData.imageAspect = imageAspect;

        // シーンに追加
        scene.add(planeMesh);

        // 初回のアスペクト比調整を実行
        updateBackgroundAspect(planeMesh, window.innerWidth, window.innerHeight);

        // メッシュを返す（リサイズ処理で使用するため）
        resolve(planeMesh);
      },
      // 読み込み進行中のコールバック（オプション）
      undefined,
      // エラー時のコールバック
      (error) => {
        console.error('背景画像の読み込みに失敗しました:', error);
        reject(error);
      }
    );
  });
}

/**
 * 背景画像のアスペクト比を調整（object-fit: cover と同じ動作）
 * @param {THREE.Mesh} backgroundMesh 背景メッシュ
 * @param {number} windowWidth ウィンドウ幅
 * @param {number} windowHeight ウィンドウ高さ
 */
export function updateBackgroundAspect(backgroundMesh, windowWidth, windowHeight) {
  if (!backgroundMesh || !backgroundMesh.userData.imageAspect) {
    return;
  }

  // 画像のアスペクト比
  const imageAspect = backgroundMesh.userData.imageAspect;

  // 画面のアスペクト比
  const windowAspect = windowWidth / windowHeight;

  // テクスチャのUV座標を調整するためのオフセットとスケール
  let offsetX = 0;
  let offsetY = 0;
  let scaleX = 1;
  let scaleY = 1;

  // ===== object-fit: cover のロジック =====
  // 画像が画面全体を覆うように、はみ出た部分をトリミング
  if (imageAspect > windowAspect) {
    // 画像の方が横長 → 上下にフィット、左右をトリミング
    scaleX = windowAspect / imageAspect;
    offsetX = (1 - scaleX) / 2; // 中央揃え
  } else {
    // 画像の方が縦長 → 左右にフィット、上下をトリミング
    scaleY = imageAspect / windowAspect;
    offsetY = (1 - scaleY) / 2; // 中央揃え
  }

  // ===== テクスチャのUV座標を調整 =====
  // repeat: テクスチャの繰り返し（スケール）
  // offset: テクスチャの開始位置（トリミング位置）
  const texture = backgroundMesh.material.map;
  if (texture) {
    texture.repeat.set(scaleX, scaleY);
    texture.offset.set(offsetX, offsetY);
    texture.needsUpdate = true;
  }
}
