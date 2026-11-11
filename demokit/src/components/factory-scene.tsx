"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Zone } from "../lib/lab-data";
import FactoryFallback from "./factory-fallback";
export default function FactoryScene({
  zones,
  selected,
  onSelect,
  layer,
  links,
  focus,
  reset,
  blockedZone = "",
}: {
  zones: Zone[];
  selected: string;
  onSelect: (id: string) => void;
  layer: string;
  links: string[][];
  focus: string;
  reset: number;
  blockedZone?: string;
}) {
  const host = useRef<HTMLDivElement>(null),
    cb = useRef(onSelect),
    [fallback, setFallback] = useState(false);
  const pose = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
    zoom: number;
    selected: string;
    focus: string;
    reset: number;
  } | null>(null);
  cb.current = onSelect;
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFallback(true);
      return;
    }
    setFallback(false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x10131f, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "Factory model. Drag to orbit; scroll to zoom.",
    );
    const scene = new THREE.Scene(),
      cam = new THREE.OrthographicCamera(-40, 40, 29, -29, 0.1, 350);
    cam.position.set(62, 65, 72);
    const ctrl = new OrbitControls(cam, renderer.domElement);
    ctrl.enableDamping = true;
    ctrl.maxPolarAngle = Math.PI * 0.46;
    ctrl.minZoom = 0.5;
    ctrl.maxZoom = 5;
    ctrl.target.set(5, 0, 4);
    scene.add(new THREE.HemisphereLight(0xc6d6ff, 0x303148, 2.4));
    const sun = new THREE.DirectionalLight(0xffe7ce, 3.6);
    sun.position.set(-25, 55, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -60,
      right: 60,
      top: 60,
      bottom: -60,
      far: 150,
    });
    sun.shadow.bias = -0.001;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x9a7bff, 2);
    rim.position.set(35, 25, -40);
    scene.add(rim);
    const picks: THREE.Object3D[] = [],
      colors = { material: 0xb5a1df, production: 0x9db4c6, support: 0x90afa8 };
    const materials = new Map<number, THREE.MeshStandardMaterial>();
    function mat(c: number) {
      if (!materials.has(c))
        materials.set(
          c,
          new THREE.MeshStandardMaterial({
            color: c,
            roughness: 0.7,
            metalness: 0.15,
          }),
        );
      return materials.get(c)!;
    }
    function box(
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      c: number,
    ) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
      m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true;
      parent.add(m);
      return m;
    }
    function cylinder(
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      r: number,
      h: number,
      c: number,
    ) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat(c));
      m.position.set(x, y, z);
      m.castShadow = true;
      parent.add(m);
    }
    box(scene, 5, -0.55, 5, 66, 0.7, 49, 0x252938);
    const grid = new THREE.GridHelper(72, 48, 0x45495f, 0x2e3346);
    grid.position.set(5, -0.16, 5);
    scene.add(grid);
    box(scene, 4, -0.12, 24, 60, 0.06, 3, 0x151a25);
    for (let x = -24; x < 34; x += 4)
      box(scene, x, -0.075, 24, 1.8, 0.03, 0.08, 0x9f995e);
    for (const z of zones) {
      const g = new THREE.Group();
      g.position.set(z.x, 0, z.z);
      scene.add(g);
      const active = selected === z.id,
        c = active ? 0xb39ade : colors[z.group];
      box(g, 0, 0.02, 0, z.w, 0.22, z.d, active ? 0x625080 : 0x343b4d);
      box(g, 0, 0.55, -z.d / 2, z.w, 1.1, 0.16, c);
      box(g, -z.w / 2, 0.55, 0, 0.16, 1.1, z.d, c);
      if (z.kind === "racks") {
        for (let i = -1; i <= 1; i++)
          for (let j = -1; j <= 1; j++) {
            box(g, i * 2.2, 1.25, j * 1.7, 1.6, 2.4, 1.1, 0x4f5d72);
            for (let h = 0; h < 3; h++) {
              box(g, i * 2.2, 0.4 + h * 0.8, j * 1.7, 1.8, 0.1, 1.3, c);
              box(g, i * 2.2, 0.7 + h * 0.8, j * 1.7, 1.25, 0.5, 0.9, 0xb2a284);
            }
          }
      } else if (["process", "utilities", "weigh"].includes(z.kind)) {
        for (let i = -1; i <= 1; i++) {
          const h = z.kind === "utilities" ? 3.2 : 2.4;
          cylinder(g, i * 2.8, h / 2 + 0.35, -0.8, 0.95, h, c);
          cylinder(g, i * 2.8, h + 0.4, -0.8, 0.55, 0.25, 0xd4dce2);
          box(g, i * 2.8, 0.65, 1.2, 0.65, 0.9, 0.7, 0x6f7f8e);
        }
        box(g, 0, 0.55, 1.9, z.w - 2, 0.3, 0.7, 0x75828c);
      } else if (z.kind === "pack") {
        box(g, 0, 0.7, 0, z.w - 2, 0.35, 1.1, 0x727d8f);
        for (let i = -3; i < 4; i++)
          box(g, i, 0.95, 0, 0.15, 0.12, 1.15, 0xc2cad1);
        box(g, -2.2, 1.45, 0, 1.5, 1.4, 1.7, c);
        box(g, 1.7, 1.6, 0, 0.6, 2, 1.8, c);
        for (let i = 0; i < 3; i++)
          box(g, -2 + i * 2, 1, 2.6, 1.3, 1.4, 1.1, 0xb6a482);
      } else if (z.kind === "dock") {
        for (let i = -1; i <= 1; i++) {
          box(g, i * 2.4, 1, -0.7, 1.9, 1.6, 2.5, c);
          box(g, i * 2.4, 0.7, 1.2, 1.7, 1.2, 1.4, 0x5d718a);
        }
      } else {
        box(g, 0, 0.65, -1, z.w - 2, 1.2, 2, c);
        for (let i = -1; i <= 1; i++) {
          box(
            g,
            i * 2.2,
            1.55,
            -1,
            1.25,
            0.7,
            0.15,
            z.kind === "lab" ? 0x9ecbbf : 0x6d8eaa,
          );
          box(g, i * 2.2, 0.65, 1.2, 1.4, 0.15, 1, 0xc3c5ce);
        }
        if (z.kind === "control")
          box(g, 0, 2, -z.d / 2 + 0.3, z.w - 2, 1.7, 0.2, 0x537a83);
      }
      if (active) {
        const outline = new THREE.LineSegments(
          new THREE.EdgesGeometry(
            new THREE.BoxGeometry(z.w + 0.3, 0.35, z.d + 0.3),
          ),
          new THREE.LineBasicMaterial({ color: 0xd1b5ff }),
        );
        outline.position.y = 0.22;
        g.add(outline);
      }
      g.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.userData.zone = z.id;
          picks.push(o);
        }
      });
      const cv = document.createElement("canvas");
      cv.width = 512;
      cv.height = 80;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = active ? "#c8afff" : "#d4d8e8";
      ctx.font = "500 30px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(z.code + "  " + z.short, 256, 48);
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(cv),
          depthTest: false,
          transparent: true,
        }),
      );
      sp.position.set(z.x, 4.5, z.z);
      sp.scale.set(9, 1.4, 1);
      scene.add(sp);
    }
    const particles: {
      mesh: THREE.Mesh;
      curve: THREE.CatmullRomCurve3;
      offset: number;
    }[] = [];
    if (layer !== "None")
      links.forEach(([a, b], i) => {
        const f = zones.find((z) => z.id === a),
          t = zones.find((z) => z.id === b);
        if (!f || !t) return;
        const blocked = layer === "Material" && b === blockedZone;
        const h = layer === "Authority" ? 8 : layer === "Events" ? 5 : 0.5,
          color = blocked
            ? 0xfb887c
            : layer === "Authority"
              ? 0xc4afff
              : layer === "Events"
                ? 0x75d8e7
                : 0xe8b269,
          curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(f.x, h, f.z),
            new THREE.Vector3(
              (f.x + t.x) / 2,
              h + (layer === "Events" ? 3 : 0),
              (f.z + t.z) / 2,
            ),
            new THREE.Vector3(t.x, h, t.z),
          ]);
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),
          layer === "Material" && !blocked
            ? new THREE.LineBasicMaterial({ color })
            : new THREE.LineDashedMaterial({
                color,
                dashSize: layer === "Authority" ? 0.16 : 0.65,
                gapSize: 0.4,
              }),
        );
        line.computeLineDistances();
        scene.add(line);
        scene.add(
          new THREE.ArrowHelper(
            curve.getTangent(0.9).normalize(),
            curve.getPoint(0.9),
            1.2,
            color,
            0.9,
            0.6,
          ),
        );
        if (blocked) return;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 8, 8),
          new THREE.MeshBasicMaterial({ color }),
        );
        scene.add(mesh);
        particles.push({ mesh, curve, offset: i * 0.17 });
      });
    const chosen = zones.find((z) => z.id === selected);
    let reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previous = pose.current;
    const needsFocus =
      !previous ||
      previous.focus !== focus ||
      previous.reset !== reset ||
      (focus !== "Site" && previous.selected !== selected);
    const target =
      chosen && focus !== "Site"
        ? new THREE.Vector3(chosen.x, 0, chosen.z)
        : new THREE.Vector3(5, 0, 4);
    const position =
      chosen && focus !== "Site"
        ? new THREE.Vector3(chosen.x + 35, 42, chosen.z + 40)
        : new THREE.Vector3(62, 65, 72);
    const zoom =
      chosen && focus !== "Site" ? (focus === "Area" ? 1.65 : 2.8) : 1;
    if (previous) {
      cam.position.copy(previous.position);
      ctrl.target.copy(previous.target);
      cam.zoom = previous.zoom;
    }
    let moving = needsFocus && !reduced && !!previous;
    if (needsFocus && !moving) {
      cam.position.copy(position);
      ctrl.target.copy(target);
      cam.zoom = zoom;
    }
    const stopMoving = () => {
      moving = false;
    };
    ctrl.addEventListener("start", stopMoving);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motionChange = () => {
      reduced = media.matches;
      if (reduced && moving) {
        cam.position.copy(position);
        ctrl.target.copy(target);
        cam.zoom = zoom;
        cam.updateProjectionMatrix();
        moving = false;
      }
    };
    media.addEventListener("change", motionChange);
    const contextLost = (e: Event) => {
      e.preventDefault();
      setFallback(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    const resize = () => {
      const w = Math.max(1, el.clientWidth),
        h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h);
      cam.left = (-28.5 * w) / h;
      cam.right = (28.5 * w) / h;
      cam.top = 28.5;
      cam.bottom = -28.5;
      cam.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let down = [0, 0];
    const onDown = (e: PointerEvent) => {
        down = [e.clientX, e.clientY];
      },
      onUp = (e: PointerEvent) => {
        if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
        const r = renderer.domElement.getBoundingClientRect();
        pointer.set(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          (-(e.clientY - r.top) / r.height) * 2 + 1,
        );
        ray.setFromCamera(pointer, cam);
        const hit = ray.intersectObjects(picks)[0];
        if (hit?.object.userData.zone) cb.current(hit.object.userData.zone);
      };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    let frame = 0;

    function render(t: number) {
      frame = requestAnimationFrame(render);
      if (moving) {
        cam.position.lerp(position, 0.12);
        ctrl.target.lerp(target, 0.12);
        cam.zoom += (zoom - cam.zoom) * 0.12;
        cam.updateProjectionMatrix();
        if (cam.position.distanceTo(position) < 0.01) {
          cam.position.copy(position);
          ctrl.target.copy(target);
          cam.zoom = zoom;
          cam.updateProjectionMatrix();
          moving = false;
        }
      }
      ctrl.update();
      particles.forEach((p) =>
        p.mesh.position.copy(
          p.curve.getPoint((reduced ? 0.35 : t * 0.00009 + p.offset) % 1),
        ),
      );
      renderer.render(scene, cam);
    }
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      pose.current = {
        position: cam.position.clone(),
        target: ctrl.target.clone(),
        zoom: cam.zoom,
        selected,
        focus,
        reset,
      };
      media.removeEventListener("change", motionChange);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      ctrl.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m.dispose());
        }
        if (o instanceof THREE.Sprite) {
          o.material.map?.dispose();
          o.material.dispose();
        }
      });
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [zones, selected, layer, links, focus, reset, blockedZone]);
  return (
    <div className="scene" ref={host}>
      {fallback && (
        <>
          <FactoryFallback
            zones={zones}
            selected={selected}
            onSelect={onSelect}
            layer={layer}
            links={links}
            focus={focus}
            blockedZone={blockedZone}
          />
          <span className="fallback-label">
            ISOMETRIC VIEW · WEBGL UNAVAILABLE
          </span>
        </>
      )}
    </div>
  );
}
