import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { MindARThree } from 'mindar-image-three';

// ══════════════════════════════════════════════
//  CONFIGURACIÓN DE TARGETS
// ══════════════════════════════════════════════
const CONFIG = [
  {
    id: 'TGT-001',
    tag: 'Jubi Agil',
    color: 0xff2244,
    colorHex: '#FF2244',
    colorName: 'Rojo',
    extra: 'Jubi es muy agil ya que el tigrillo es un excelente trepador de arboles, en los cuales se refugian amenudo',
  },
  {
    id: 'TGT-002',
    tag: 'Jubi Noche',
    color: 0x0066ff,
    colorHex: '#0066FF',
    colorName: 'Azul',
    extra: 'Jubi trabaja más de noche ya que el tigrillo es un animal más nocturno, aparte de que tiene un organo el cual le da una vision nocturna superior',
  },
  {
    id: 'TGT-003',
    tag: 'Jubi Frio',
    color: 0x0066ff,
    colorHex: '#00ff22',
    colorName: 'verde',
    extra: 'Su denso pelaje lo hace adaptarse a los frios, de ahi el nombre Tigrillo Lanudo, tambien por eso logra vivir en los bosques altoandinos y paramos',
  },
  {
    id: 'TGT-004',
    tag: 'Jubi Peligro',
    color: 0x0066ff,
    colorHex: '#ff00f2',
    colorName: 'Pink',
    extra: 'Jubi es una especie paraguas en peligro de extincion, lo cual es malo porque al ser paraguas significa que cumple un rol significativo en su ecosistema',
  },
   {
    id: 'TGT-005',
    tag: 'Jubi Solitario',
    color: 0xff2244,
    colorHex: '#FF2244',
    colorName: 'Rojo',
    extra: 'Jubi es alguien muy solitario al ser asi la naturaleza del animal, algo sorprendente es que se ha adapato a vivir en sitios mas urbanos como la sabana de Bogotá',
  },
];

// ══════════════════════════════════════════════
//  REFERENCIAS DOM
// ══════════════════════════════════════════════
const splashEl   = document.getElementById('splash');
const hudEl      = document.getElementById('hud');
const startBtn   = document.getElementById('startButton');
const stopBtn    = document.getElementById('stopButton');
const hudStopBtn = document.getElementById('hudStopButton');

const hudCard    = document.getElementById('target-card');
const hudHint    = document.getElementById('hudHint');
const hudId      = document.getElementById('hud-id');
const hudTag     = document.getElementById('hud-tag');
const hudColor   = document.getElementById('hud-color');
const hudSwatch  = document.getElementById('hud-swatch');
const hudExtra   = document.getElementById('hud-extra');

// ══════════════════════════════════════════════
//  HUD — actualizar info de un target
// ══════════════════════════════════════════════
function showTargetInfo(cfg) {
  hudId.textContent     = cfg.id;
  hudTag.textContent    = cfg.tag;
  hudColor.textContent  = cfg.colorName;
  hudSwatch.style.background = cfg.colorHex;
  hudSwatch.style.boxShadow  = `0 0 8px ${cfg.colorHex}`;
  hudExtra.textContent  = cfg.extra;

  hudCard.classList.add('visible');
  hudHint.classList.add('hidden');
}

function hideTargetInfo() {
  hudCard.classList.remove('visible');
  hudHint.classList.remove('hidden');
}

// ══════════════════════════════════════════════
//  SETUP MINDAR
// ══════════════════════════════════════════════
const mindarThree = new MindARThree({
  container: document.querySelector('#container'),
  imageTargetSrc: './target/Targets_Tesis2.mind', // Archivo MIND actualizado
  maxTrack: CONFIG.length,
});

const { renderer, scene, camera } = mindarThree;

let activeTargets = 0;

// Variables para manejar las animaciones de los modelos GLB
const mixers = [];
const clock = new THREE.Clock();

CONFIG.forEach((cfg, index) => {
  const anchor = mindarThree.addAnchor(index);

  // Modelo GLB
  const loader = new GLTFLoader();
  
loader.load('./assets/3d/JubiTigrillo2.glb', (gltf) => {
    const model = gltf.scene;
    

    model.scale.set(2, 2, 2);
    

    model.position.set(0, 0, 0); 
    
    anchor.group.add(model);

    if (gltf.animations && gltf.animations.length) {
      const mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();
      mixers.push(mixer);
    }
  });

  anchor.onTargetFound = () => {
    activeTargets++;
    showTargetInfo(cfg);
    console.log(`Target ${index} detectado →`, cfg.tag);
  };

  anchor.onTargetLost = () => {
    activeTargets--;
    if (activeTargets <= 0) {
      activeTargets = 0;
      hideTargetInfo();
    }
    console.log(`Target ${index} perdido`);
  };
});

// Iluminación
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(light);

// ══════════════════════════════════════════════
//  START / STOP
// ══════════════════════════════════════════════
const startAR = async () => {
  // Ocultar splash, mostrar HUD
  splashEl.classList.add('hidden');
  hudEl.classList.add('active');

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    
    // Actualizar animaciones de los modelos si existen
    mixers.forEach((mixer) => mixer.update(delta));
    
    renderer.render(scene, camera);
  });
};

const stopAR = () => {
  mindarThree.stop();
  renderer.setAnimationLoop(null);

  hudEl.classList.remove('active');
  hideTargetInfo();
  splashEl.classList.remove('hidden');
  activeTargets = 0;
};

startBtn.addEventListener('click', startAR);
stopBtn.addEventListener('click', stopAR);
hudStopBtn.addEventListener('click', stopAR);