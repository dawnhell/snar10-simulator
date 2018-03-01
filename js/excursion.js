;$(function () {
    function planesFromMesh(vertices, indices) {
        var n = indices.length / 3,
            result = new Array(n);
        for (var i = 0, j = 0; i < n; ++i, j += 3) {
            var a = vertices[indices[j]],
                b = vertices[indices[j + 1]],
                c = vertices[indices[j + 2]];
            result[i] = new THREE.Plane().setFromCoplanarPoints(a, b, c);
        }
        return result;
    }

    function createPlanes(n) {
        var result = new Array(n);
        for (var i = 0; i !== n; ++i)
            result[i] = new THREE.Plane();
        return result;
    }

    function cylindricalPlanes(n, innerRadius) {
        var result = createPlanes(n);
        for (var i = 0; i !== n; ++i) {
            var plane = result[i],
                angle = i * Math.PI * 2 / n;
            plane.normal.set(
                Math.cos(angle), 0, Math.sin(angle));
            plane.constant = innerRadius;
        }
        return result;
    }

    var Vertices = [
            new THREE.Vector3(+1, 0, +Math.SQRT1_2),
            new THREE.Vector3(-1, 0, +Math.SQRT1_2),
            new THREE.Vector3(0, +1, -Math.SQRT1_2),
            new THREE.Vector3(0, -1, -Math.SQRT1_2)
        ],
        Indices = [
            0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2
        ],
        Planes = planesFromMesh(Vertices, Indices),
        GlobalClippingPlanes = cylindricalPlanes(5, 3.5),
        Empty = Object.freeze([]);

    var camera, scene, renderer, startTime, clipMaterial, globalClippingPlanes, ground;

    function init() {
        camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(30, 20, 30);

        scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0x505050));

        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.2;
        spotLight.position.set(20, 30, 30);
        spotLight.castShadow = true;
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 20;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        var dirLight = new THREE.DirectionalLight(0x55505a, 1);
        dirLight.position.set(10, 10, 10);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 10;
        dirLight.shadow.camera.right = 1;
        dirLight.shadow.camera.left = -1;
        dirLight.shadow.camera.top = 1;
        dirLight.shadow.camera.bottom = -1;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;

        scene.add(dirLight);
        scene.add(spotLight);

        clipMaterial = new THREE.MeshPhongMaterial({
            color: 0xee0a10,
            shininess: 100,
            side: THREE.DoubleSide,
            clippingPlanes: createPlanes(Planes.length),
            clipShadows: true
        });

        var normal = new THREE.TextureLoader().load('models/normal.jpg');
        var loader = new THREE.TDSLoader();
        loader.setPath('models/');
        loader.load('models/model.3DS', function (object) {
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.normalMap = normal;
                }
            });
            object.rotateX(4.71);
            object.position.set(0, 0.5, 0);
            scene.add(object);
        });

        var planeGeometry = new THREE.PlaneBufferGeometry(10, 10, 1, 1);

        ground = new THREE.Mesh(planeGeometry,
            new THREE.MeshPhongMaterial({
                color: 0xa0adaf, shininess: 150
            }));
        ground.rotation.x = -Math.PI / 2;
        ground.scale.multiplyScalar(3);
        ground.receiveShadow = true;

        scene.add(ground);

        var container = document.body;

        renderer = new THREE.WebGLRenderer();
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', onWindowResize, false);
        container.appendChild(renderer.domElement);

        globalClippingPlanes = createPlanes(GlobalClippingPlanes.length);
        renderer.clippingPlanes = Empty;
        renderer.localClippingEnabled = true;

        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1, 0);
        controls.update();

        startTime = Date.now();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    init();
    animate();
});
