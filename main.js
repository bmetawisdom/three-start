import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";

let experience = {
  canvas: document.getElementById("webgl"),
  clock: new THREE.Clock(),
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    30000
  ),
  colors: [
    // an array of some of my fave colors for randomly coloring objects
    "deeppink",
    "cyan",
    "yellow",
    "white",
    "tomato",
    "chartreuse",
    "crimson",
    "cornflowerblue",
    "coral",
  ],

  dims: {
    width: window.innerWidth,
    height: window.innerHeight,
  },

  texture: new THREE.TextureLoader(),
  isPlaying: false,
  mixer: new THREE.AnimationMixer(),
  heart: new THREE.Object3D(),
  monster: new THREE.Object3D(),
  playIcon: '<ion-icon name="pause-outline"></ion-icon>',
  pauseIcon: '<ion-icon name="play-outline"></ion-icon>',

  // instantiate, load textures, objects, etc
  boot: function () {
    // create the renderer
    experience.renderer = new THREE.WebGLRenderer({
      canvas: experience.canvas,
      antialias: true,
    });
    experience.renderer.setSize(experience.dims.width, experience.dims.height);
    experience.renderer.shadowMap.enabled = true;
    experience.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    experience.renderer.setClearColor(0x000000, 0);

    // make it foggy, now
    experience.scene.fog = new THREE.Fog(0xcccccc, 1000, 10000);
    // add cam to scene
    experience.scene.add(experience.camera);
  },

  _createPathStrings: function (filename) {
    const basePath = "./skybox/images/";
    const baseFilename = basePath + filename;
    const fileType = ".jpg";
    const sides = ["FRONT", "BACK", "UP", "DOWN", "LEFT", "RIGHT"];
    const pathStrings = sides.map((side) => {
      return baseFilename + "_" + side + fileType;
    });

    return pathStrings;
  },

  _createMaterialArray: function (filename) {
    const skyboxImagePaths = experience._createPathStrings(filename);
    const materialArray = skyboxImagePaths.map((image) => {
      let texture = experience.texture.load(image);
      return new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
    });
    return materialArray;
  },

  // create all lights and objects for your scene
  create: function () {
    // make a skybox for the scene
    // const materialArray = experience._createMaterialArray("ocean"); // load forest skybox
    // add a gigantic skybox cube to the scene
    experience.cube = new THREE.Mesh(
      new THREE.BoxGeometry(10000, 10000, 10000),
      // materialArray
      new THREE.MeshBasicMaterial({
        color:
          experience.colors[
            Math.floor(Math.random() * experience.colors.length)
          ],
        side: THREE.BackSide,
      })
    );
    // add the skybox to the scene
    experience.scene.add(experience.cube);

    // ambient light
    let ambi = new THREE.AmbientLight("white", 0.65);
    ambi.position.set(0, 1000, 0);
    experience.scene.add(ambi);

    // directional light
    let dirLight = new THREE.DirectionalLight(0xffffff, 1);
    //	dirLight.position.set(0,2000,-1000);	// Default position
    dirLight.position.set(0, 2000, 0); // High Noon
    dirLight.castShadow = true;
    experience.scene.add(dirLight);

    // add a point light to the camera
    let point = new THREE.PointLight("aliceblue", 1, 800);
    point.castShadow = true;
    point.lookAt(experience.monster.position);

    experience.camera.add(point);

    // add a spotlight to point at monster
    let spot = new THREE.SpotLight("gold", 0.75);
    spot.castShadow = true;
    spot.position.set(0, 100, 0);
    experience.scene.add(spot);

    // debug only obvs
    let lightHelper = new THREE.SpotLightHelper(spot);
    experience.scene.add(lightHelper);

    // create a floor
    // let txtr = experience.texture.load("./textures/concrete3-albedo.png");
    // txtr.wrapS = THREE.RepeatWrapping;
    // txtr.wrapT = THREE.RepeatWrapping;
    // txtr.repeat.set(4, 4);
    let geo = new THREE.PlaneGeometry(100, 100, 10, 10);
    let mat = new THREE.MeshBasicMaterial({
      // map: txtr,
      wireframe: false,
      color: "silver",
    });
    experience.floor = new THREE.Mesh(geo, mat);
    experience.floor.receiveShadow = true;
    experience.floor.rotation.x = Math.PI / 2;
    experience.floor.rotation.y = Math.PI;
    experience.floor.rotation.z = Math.PI / 2;
    experience.floor.position.y = -5;
    experience.scene.add(experience.floor);

    // load your objects

    // position the camera where you want it
    // experience.camera.position.set(0, -980.636, 1500);
    //experience.camera.lookAt(experience.floor.position);
  },

  _triggerAnimation: function () {},

  controls: function () {
    // init and add OrbitControls
    experience.orbit = new OrbitControls(
      experience.camera,
      experience.renderer.domElement
    );
    experience.orbit.enableDamping = true;
    experience.orbit.autoRotate = false;
    // experience.orbit.target = experience.monster.position;
    experience.orbit.enabled = true;
    experience.orbit.update();

    // DEBUG: enable for debugging camera location
    window.addEventListener("wheel", function (evt) {
      console.log(experience.camera.position);
    });

    window.addEventListener("resize", () => {
      // update dims
      experience.dims.width = window.innerWidth;
      experience.dims.height = window.innerHeight;

      // update cam
      experience.camera.aspect = experience.dims.width / experience.dims.height;
      experience.camera.updateProjectionMatrix();

      // update the renderer
      experience.renderer.setSize(
        experience.dims.width,
        experience.dims.height
      );
      experience.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  },

  render: function () {
    // game loop
    const elapsedTime = experience.clock.getElapsedTime();
    //const audioPlayHead = experience.audio.currentTime / experience.audio.duration;
    //document.querySelector(".play-head").style.width =
    //  audioPlayHead * 100 + "%";

    // update controls because damping
    experience.orbit.update();

    // update objects
    experience.cube.rotation.set(elapsedTime, elapsedTime, elapsedTime);

    // do the render
    experience.renderer.render(experience.scene, experience.camera);
    // call this method again next frame
    window.requestAnimationFrame(experience.render);
  },
};

experience.boot();
experience.create();
experience.controls();
experience.render();
