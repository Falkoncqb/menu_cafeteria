# ☕ Cafetería de Especialidad - Experiencia Cinematográfica

Demostración interactiva y cinematográfica para cafetería de especialidad con scroll scrubbing de video cuadro a cuadro (60 FPS) y panel de administración en tiempo real.

---

## 🌟 Características Principales

### 1. Sección Hero: Cafés de Origen
- **Video de Fondo Cuadro a Cuadro**: 240 fotogramas de alta resolución sincronizados de forma bidireccional con el scroll del mouse.
- **Aparición Progresiva de Textos**: Cada café aparece secuencialmente conforme se avanza en el video.
- **Líneas de Puntos Guía & Precios**:
  - *Cafe cortado* ............. $ 2.000.-
  - *Cafe con leche* ........... $ 3.500.-
  - *Capuccino* ................ $ 4.000.-
  - *Mocaccino* ................ $ 5.000.-
  - *Espresso Doble* ........... $ 2.800.-
- **Culminación Cinematográfica**: Al llegar al 100% de la sección, el video finaliza exactamente en el cuadro del **perrito con su vaso de café** con animación de entrega.

### 2. Segunda Sección: Pastelería & Dulces (Abajo del Hero)
- **Nuevo Video de Fondo (`democafe1.mp4`)**: Dividido en 240 fotogramas que avanzan fluidamente con el scroll.
- **Menú de Dulces Artesanales**:
  - *Torta tres leches* ........ $ 4.000.-
  - *Panqueques* ............... $ 5.000.-
  - *Paila con huevo y tomate* . $ 5.000.-
  - *Cheesecake de frutos rojos* $ 4.500.-
  - *Medialunas artesanales* ... $ 3.200.-
- **Diseño Editorial Coherente**: Mismo fondo blanco luminoso con tipografías negras (*Cinzel* y *Plus Jakarta Sans*) y tarjetas en vidrio esmerilado (*frosted glass*).

### 3. Panel de Administrador en Tiempo Real (CRUD)
- Botón **"Acceso Administrador"** en la esquina superior derecha.
- Permite **editar nombres, cambiar precios, modificar descripciones, agregar y eliminar productos** al instante.
- **Sincronización en vivo**: Los cambios se reflejan inmediatamente en la carta visible del sitio web sin necesidad de recargar.
- **Persistencia**: Almacenamiento local mediante `localStorage` con botón de restauración a los valores originales.

---

## 🚀 Cómo Ejecutar Localmente

Puedes abrir directamente el archivo `index.html` en tu navegador, o iniciar un servidor web local:

```bash
# Con Python
python -m http.server 8080
```

Luego abre tu navegador en [http://localhost:8080](http://localhost:8080).

---

## 📁 Estructura del Proyecto

```text
├── index.html                     # Estructura principal multi-sección y modal admin
├── style.css                      # Estilos editoriales, transiciones y filtros
├── script.js                      # Motor de interpolación lerp a 60 FPS y CRUD admin
├── frames/                        # 240 fotogramas del video 1 (Hero - Cafés)
├── frames_section2/               # 240 fotogramas del video 2 (Pastelería - democafe1)
├── gemini_generated_video_149953d3.mp4
├── democafe1.mp4
├── 1.jpg ... 5.jpg
└── README.md
```

---

> 💡 *Esto es solo una demostración, el diseño va personalizado a lo que necesites.*
