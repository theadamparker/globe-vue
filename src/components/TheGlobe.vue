<script>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue';
import * as THREE from 'three';
import globeTexture from '@/assets/img/globe-texture.jpg';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    // ScrollTrigger animation reference
    let scrollAnimation = null

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
        const geometry = new THREE.SphereGeometry(1, 64, 64) // Changed radius to 1 for more straightforward scaling
        const material = new THREE.MeshStandardMaterial({ map: texture })
        globe = new THREE.Mesh(geometry, material)
        // Set initial scale to 0.8
        globe.scale.set(0.8, 0.8, 0.8)
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
            rotationY += 0.0025 // Reduced from 0.005 to 0.0025 (half speed)
          }
          globe.rotation.y = rotationY
          renderer.render(scene, camera)
          animationId = requestAnimationFrame(animate)
        }
        animate()

        // Set up ScrollTrigger animation after the globe is loaded
        setupScrollAnimation()
      })

      container.value.addEventListener('mousedown', onPointerDown)
      window.addEventListener('mousemove', onPointerMove)
      window.addEventListener('mouseup', onPointerUp)
      container.value.addEventListener('touchstart', onPointerDown)
      window.addEventListener('touchmove', onPointerMove)
      window.addEventListener('touchend', onPointerUp)
      window.addEventListener('resize', onWindowResize)
    })

    function setupScrollAnimation() {
      // Create a GSAP timeline with ScrollTrigger
      scrollAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: '.section__hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1, // Smooth scrubbing effect
          markers: false, // Set to true for development/debugging
          onEnter: () => {
            // Stop auto rotation when scroll animation starts
            autoRotate.value = false;
          },
          onUpdate: (self) => {
            // If globe exists, update its scale based on scroll progress
            if (globe) {
              // Scale from 0.8 to 1.2 (50% increase) based on scroll progress
              const finalScale = 1.2;
              const initialScale = 0.8;
              const scaleProgress = initialScale + (self.progress * (finalScale - initialScale));
              globe.scale.set(scaleProgress, scaleProgress, scaleProgress);
              
              // Smoothly rotate to Bolivia as we scroll
              if (!isTweening) { // Don't interfere if user is manually rotating to a location
                // Bolivia longitude: -63.5887° W
                // Get the target rotation for Bolivia
                const boliviaLongitude = -63.5887;
                const textureOffset = Math.PI * 1.5;
                const targetRot = -THREE.MathUtils.degToRad(boliviaLongitude) + textureOffset;
                
                // Start from current rotation and interpolate toward Bolivia
                // as scroll progresses, but only if we're more than 10% into the scroll
                if (self.progress > 0.1) {
                  const interpolationFactor = (self.progress - 0.1) / 0.9; // Normalize to 0-1 range
                  // Interpolate rotation
                  const startRotation = rotationY;
                  const endRotation = targetRot;
                  
                  // Handle potential rotation wrapping (if difference > PI)
                  let rotDiff = endRotation - startRotation;
                  if (Math.abs(rotDiff) > Math.PI) {
                    if (rotDiff > 0) {
                      rotDiff = rotDiff - Math.PI * 2;
                    } else {
                      rotDiff = rotDiff + Math.PI * 2;
                    }
                  }
                  
                  // Set rotation directly (not using tweening)
                  rotationY = startRotation + rotDiff * interpolationFactor * interpolationFactor; // Eased interpolation
                }
              }
            }
          },
          onLeaveBack: () => {
            // Resume auto rotation when scrolling back up
            autoRotate.value = true;
            // Reset the globe scale when scrolling back up
            if (globe) {
              globe.scale.set(0.8, 0.8, 0.8);
              // Reset any active tweening
              isTweening = false;
            }
          }
        }
      });

      // Single, smooth animation using right property
      scrollAnimation.to(container.value, {
        right: "20%", // Move to 20% from the right edge
        rotate: -5, // Slight rotation
        ease: "power1.inOut",
        duration: 1,
        onComplete: () => {
          // Ensure we're centered on Bolivia when scroll animation completes
          centerOnBolivia();
        }
      });
    }

    function onWindowResize() {
      if (!container.value) return
      const { width, height } = getContainerSize()
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      
      // Simply refresh ScrollTrigger on window resize
      // The onUpdate callback will handle scaling appropriately
      ScrollTrigger.refresh();
    }

    onBeforeUnmount(() => {
      // Kill the ScrollTrigger animation
      if (scrollAnimation) {
        const st = scrollAnimation.scrollTrigger
        if (st) st.kill()
        scrollAnimation.kill()
      }

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
  <div ref="container" class="globe-container"></div>
</template>
<style scoped lang="scss">
.globe-container {
  width: 80%;
  aspect-ratio: 1/1;
  max-width: 800px;
  min-height: 800px;
  background: transparent;
  position: fixed;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%); /* Removed scale(1) to let GSAP handle it */
  transform-origin: center center;
  z-index: 10;
  will-change: transform, right; /* Added right for smoother animation */
  // pointer-events: none;
  /* Allow scrolling through the globe */
}

/* Make buttons clickable by overriding pointer-events for the controls */
div>div:first-child {
  position: relative;
  z-index: 20;
  pointer-events: auto;
}
</style>
