<script>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import * as THREE from 'three'
import globeTexture from '@/assets/img/globe-texture.jpg'

export default {
  setup() {
    const container = ref(null)
    let renderer, scene, camera, globe, animationId
    let isDragging = false
    let previousX = 0
    let rotationY = 0
    let targetRotationY = 0
    let isTweening = false
    const autoRotate = ref(true)

    function getContainerSize() {
      return {
        width: container.value ? container.value.offsetWidth : 400,
        height: container.value ? container.value.offsetHeight : 400,
      }
    }

    function onPointerDown(event) {
      isDragging = true
      previousX = event.type.startsWith('touch')
        ? event.touches[0].clientX
        : event.clientX
    }

    function onPointerMove(event) {
      if (!isDragging) return
      const clientX = event.type.startsWith('touch')
        ? event.touches[0].clientX
        : event.clientX
      const deltaX = clientX - previousX
      previousX = clientX
      rotationY += deltaX * 0.01
    }

    function onPointerUp() {
      isDragging = false
    }

    // Converts longitude to globe rotation (in radians)
    function centerGlobeOn(longitude) {
      autoRotate.value = false
      // Calculate texture offset based on testing
      // Adding 270° offset (90° + 180°) to align correctly
      const textureOffset = Math.PI * 1.5; // 270° offset in radians (90° + 180°)

      // To center a longitude on the front of the sphere:
      // 1. Convert to radians
      // 2. Apply texture offset
      // 3. Negate because Three.js rotates counterclockwise
      targetRotationY = -THREE.MathUtils.degToRad(longitude) + textureOffset
      isTweening = true
    }

    function centerOnKenya() {
      // Kenya: approx longitude 37.9062° E (center of Kenya)
      centerGlobeOn(37.9062)
    }

    function centerOnBolivia() {
      // Bolivia: approx longitude -63.5887° W (center of Bolivia)
      centerGlobeOn(-63.5887)
    }

    function toggleRotation() {
      autoRotate.value = !autoRotate.value
      console.log('Rotation toggled:', autoRotate.value ? 'ON' : 'OFF')
    }

    onMounted(async () => {
      await nextTick()
      if (!container.value) return

      const { width, height } = getContainerSize()
      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      camera.position.z = 2
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      container.value.appendChild(renderer.domElement)

      new THREE.TextureLoader().load(globeTexture, (texture) => {
        const geometry = new THREE.SphereGeometry(0.8, 64, 64)
        const material = new THREE.MeshStandardMaterial({ map: texture })
        globe = new THREE.Mesh(geometry, material)
        scene.add(globe)

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
        scene.add(ambientLight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
        directionalLight.position.set(5, 3, 5)
        scene.add(directionalLight)

        const animate = () => {
          if (isTweening) {
            // Smoothly interpolate rotationY toward targetRotationY
            const delta = targetRotationY - rotationY
            if (Math.abs(delta) < 0.001) {
              rotationY = targetRotationY
              isTweening = false
            } else {
              rotationY += delta * 0.1 // Adjust 0.1 for speed (0.1 = fast, 0.05 = slower)
            }
          } else if (autoRotate.value && !isDragging) {
            rotationY += 0.005
          }
          globe.rotation.y = rotationY
          renderer.render(scene, camera)
          animationId = requestAnimationFrame(animate)
        }
        animate()
      })

      container.value.addEventListener('mousedown', onPointerDown)
      window.addEventListener('mousemove', onPointerMove)
      window.addEventListener('mouseup', onPointerUp)
      container.value.addEventListener('touchstart', onPointerDown)
      window.addEventListener('touchmove', onPointerMove)
      window.addEventListener('touchend', onPointerUp)
      window.addEventListener('resize', onWindowResize)
    })

    function onWindowResize() {
      if (!container.value) return
      const { width, height } = getContainerSize()
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onWindowResize)
      if (renderer) renderer.dispose()
      scene = null
      camera = null
      globe = null
      if (container.value) {
        container.value.removeEventListener('mousedown', onPointerDown)
        container.value.removeEventListener('touchstart', onPointerDown)
      }
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseup', onPointerUp)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend', onPointerUp)
    })

    return {
      container,
      centerOnKenya,
      centerOnBolivia,
      toggleRotation,
      autoRotate
    }
  }
}
</script>
<template>
  <div>
    <div style="text-align:center; margin-bottom: 1em;">
      <button @click="centerOnKenya">Kenya</button>
      <button @click="centerOnBolivia">Bolivia</button>
      <button @click="toggleRotation">{{ autoRotate ? 'Pause rotation' : 'Start rotation' }}</button>
    </div>
    <div ref="container" class="globe-container"></div>
  </div>
</template>
<style scoped>
.globe-container {
  width: 80%;
  aspect-ratio: 1/1;
  /* max-width: 600px; */
  min-height: 600px;
  margin: 0 auto;
  background: transparent;
  position: relative;
}
</style>
