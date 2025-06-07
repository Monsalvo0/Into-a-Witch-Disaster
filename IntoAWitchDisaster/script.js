import './style.css'
import { gsap } from 'gsap'   
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

console.log(waterVertexShader);
console.log(waterFragmentShader);

console.log(gsap);
/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#221c69')

const gltfLoader = new GLTFLoader()


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

const waterGeometry = new THREE.CircleGeometry( 5, 32 );
const waterMaterial = new THREE.ShaderMaterial()

const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)


/**
 * Objetos para testear ubicacion


const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
const tester = new THREE.Mesh(boxGeometry, boxMaterial)
tester.position.set(0, 4, 5.5)
scene.add(tester) 

const testerGeometry = new THREE.BoxGeometry(1, 1, 1)
const testerMaterial = new THREE.MeshStandardMaterial({ color:0x0000ff })
const prueba = new THREE.Mesh(testerGeometry, testerMaterial)
prueba.position.set(0,2.5,0)
scene.add(prueba) */

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true



// Centra la escena ajustando el target y la posición de la cámara
const mediumShotPosition = new THREE.Vector3(1, 4, 10); // Puedes ajustar la altura y distancia
const mediumShotTarget = new THREE.Vector3(0, 1, 0);   // Centra el target en Y=1 (ajusta según tu modelo)

const originalCameraPosition = mediumShotPosition.clone();
const originalTarget = mediumShotTarget.clone();

camera.position.copy(mediumShotPosition);
controls.target.copy(mediumShotTarget);
controls.update();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Modelo GLTF
 */
gltfLoader.load(
    '/models/escenariopartesv01.gltf',
    (gltf) => {
        // Muestra toda la estructura del modelo en la consola
        console.log('GLTF:', gltf);

        // Busca el mesh llamado "Cauldron" (con mayúscula)
        let cauldronMesh = gltf.scene.getObjectByName('Cauldron');
        if (!cauldronMesh) {
            cauldronMesh = gltf.scene.children[0];
        }
        window.cauldron = cauldronMesh;

        // Busca el mesh llamado "Book" (con mayúscula)
        let bookMesh = gltf.scene.getObjectByName('Book');
        if (!bookMesh) {
            bookMesh = gltf.scene.children[1];
        }
        window.book = bookMesh;

        // Busca el mesh llamado "Bookshelf"
        let bookshelfMesh = gltf.scene.getObjectByName('BookShelf');
        if (!bookshelfMesh) {
            bookshelfMesh = gltf.scene.children[2]; // Ajusta el índice si es necesario
        }
        window.bookshelf = bookshelfMesh;

        scene.add(gltf.scene);
    }
)

// Raycaster y vector para el mouse
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()


canvas.addEventListener('click', (event) => {
    if (!window.cauldron || !window.book) return

    // Normaliza coordenadas del mouse
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersectsCauldron = raycaster.intersectObject(window.cauldron, true)
    const intersectsBook = raycaster.intersectObject(window.book, true)
    const intersectsBookshelf = raycaster.intersectObject(window.bookshelf, true);

    if (intersectsCauldron.length > 0) {
        animateCamera(1);
    } else if (intersectsBook.length > 0) {
        focusOnBook();
        console.log('focusonbook')
    } else if (intersectsBookshelf && intersectsBookshelf.length > 0) {
        focusOnBookshelf();
        console.log('focusonbookshelf')
    } else {
        animateCamera(0);
    }
});


function focusOnBook() {
    animateCamera(2);
}

function focusOnBookshelf() {
    animateCamera(3);
}






function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();


var cameraPositions = [
    new THREE.Vector3(0, 3, 9), // inicial = 0
    new THREE.Vector3(1, 3, 5.5), // caldero = 1
    new THREE.Vector3(-0.4, 3, 3.1), // books = 2
    new THREE.Vector3(-1, 3, 1.5)  // librero = 3
];

var cameraTarget = [
    new THREE.Vector3(0, 2, 0), // inicial = 0
    new THREE.Vector3(1.5, 1.5, 3.8), // caldero = 1
    new THREE.Vector3(-1.8, 2, 3.1), // books = 2
    new THREE.Vector3(-1.15, 2, -2)  // librero = 3
    
]
var positionCounter = 0;

function animateCamera(indice) {
    console.log('Animando cámara a la posición:', indice);

    let newTarget = cameraTarget[indice];
    gsap.to(controls.target, {
        x: newTarget.x,
        y: newTarget.y,
        z: newTarget.z,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => controls.update()
    });

    let newPosition = cameraPositions[indice];
    gsap.to(camera.position, {
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        duration: 1,
        ease: 'power2.inOut'
    });
}



window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const instructions = document.getElementById('instructions');
        if (instructions) {
            instructions.style.opacity = '0';
            setTimeout(() => instructions.style.display = 'none', 500);
        }
    }
});

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
