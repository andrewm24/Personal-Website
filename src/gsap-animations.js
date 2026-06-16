import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

(function () {
  // --- SECTION 1: TRAJECTORY ORBIT & GRID TWIST ---
  
  // Twist background grid lines on scroll
  gsap.to(".signal-grid", {
    scrollTrigger: {
      trigger: "#trajectory",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
    rotation: 60,
    scale: 1.6,
    skewX: 15,
    opacity: 0.85,
    ease: "none"
  });

  // Rotate CubeSat around Earth in SVG
  const cubesatGroup = document.getElementById("cubesat-group");
  const packetEmitter = document.getElementById("packet-emitter");
  const logScreen = document.getElementById("telemetry-log-screen");
  
  const telemetryDataPackets = [
    "[0x3A 0xFF]", "[ALT: 395.2KM]", "[RSSI: -84dBm]", "[FEC: 1/2]", "[MODBUS: RTU_OK]", 
    "[OMNI_V2: RUNNING]", "[SYS_V: 5.03V]", "[CS1_IMU: ACTIVE]", "[PWM_FRQ: 20KHz]", "[PID_ERR: 0.02]"
  ];

  const emitDataPacket = (x, y) => {
    if (!packetEmitter) return;
    const pkt = document.createElement("div");
    pkt.className = "packet-data";
    pkt.textContent = telemetryDataPackets[Math.floor(Math.random() * telemetryDataPackets.length)];
    
    // Map SVG 400x400 space to the packet emitter bounding box
    const bounds = packetEmitter.getBoundingClientRect();
    const px = (x / 400) * bounds.width;
    const py = (y / 400) * bounds.height;
    
    pkt.style.left = `${px}px`;
    pkt.style.top = `${py}px`;
    packetEmitter.appendChild(pkt);

    // Float away animation
    gsap.to(pkt, {
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 160 - 50,
      opacity: 0,
      scale: 0.7,
      duration: 2,
      ease: "power1.out",
      onComplete: () => pkt.remove()
    });
  };

  // Timeline System logs for Booz Allen Hamilton card
  const systemLogs = [
    { progress: 0.05, text: "> Modbus RTU/TCP telemetry client: ACTIVE.", type: "info" },
    { progress: 0.15, text: "> Scanning serial RS-485 bus... Found 8 nodes.", type: "info" },
    { progress: 0.28, text: "> WARNING: ICS device #4 firmware mismatch detected.", type: "warning" },
    { progress: 0.42, text: "> Launching Omni-patcher Agent across firewall boundary...", type: "info" },
    { progress: 0.58, text: "> Handshake complete. Safe routing table verification... OK.", type: "success" },
    { progress: 0.72, text: "> Executing bare-metal firmware update on node #4...", type: "info" },
    { progress: 0.85, text: "> SUCCESS: Node #4 patched. Verification checksum validated.", type: "success" },
    { progress: 0.95, text: "> System scan completed. Loops nominal. No failure detected.", type: "success" }
  ];

  const loggedIndices = new Set();

  ScrollTrigger.create({
    trigger: "#trajectory",
    start: "top 15%",
    end: "bottom 85%",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      
      // Calculate CubeSat circular orbit coordinates
      // Orbit ellipse: cx=200, cy=200, r=130
      const theta = -Math.PI / 2 + p * Math.PI * 2;
      const x = 200 + 130 * Math.cos(theta);
      const y = 200 + 130 * Math.sin(theta);
      
      if (cubesatGroup) {
        // Compute tangent angle for orientation rotation
        const angleDegrees = (theta * 180) / Math.PI + 90;
        cubesatGroup.setAttribute("transform", `translate(${x}, ${y}) rotate(${angleDegrees})`);
      }

      // Emit data packet floating dots periodically on movement
      if (Math.random() < 0.12) {
        emitDataPacket(x, y);
      }

      // System Log notifications
      if (logScreen) {
        systemLogs.forEach((log, index) => {
          if (p >= log.progress && !loggedIndices.has(index)) {
            loggedIndices.add(index);
            const line = document.createElement("div");
            line.className = `log-line log-line--${log.type}`;
            line.textContent = log.text;
            logScreen.appendChild(line);
            logScreen.scrollTop = logScreen.scrollHeight;
          }
        });
        
        // Reset logs if scrolled all the way back up
        if (p < 0.02 && loggedIndices.size > 0) {
          loggedIndices.clear();
          logScreen.innerHTML = `<div class="log-line log-line--info">> Core diagnostics active. Waiting for signal.</div>`;
        }
      }
    }
  });

  // --- SECTION 2: SILICON WORKBENCH & 3D LAYER EXPLOSION ---

  // Cross-fade background class triggers
  ScrollTrigger.create({
    trigger: "#systems",
    start: "top 60%",
    end: "bottom 30%",
    onEnter: () => {
      document.body.classList.add("theme-workbench");
      window.updateHUDTelemetry && window.updateHUDTelemetry("WORKBENCH ACTIVE // CLOCK: 72MHz");
    },
    onLeave: () => {
      document.body.classList.remove("theme-workbench");
      window.updateHUDTelemetry && window.updateHUDTelemetry("SYS_ACTIVE // CLOCK: 72MHz");
    },
    onEnterBack: () => {
      document.body.classList.add("theme-workbench");
      window.updateHUDTelemetry && window.updateHUDTelemetry("WORKBENCH ACTIVE // CLOCK: 72MHz");
    },
    onLeaveBack: () => {
      document.body.classList.remove("theme-workbench");
      window.updateHUDTelemetry && window.updateHUDTelemetry("SYS_ACTIVE // CLOCK: 72MHz");
    }
  });

  // Exploding Layer Workbench Pin & separation
  ScrollTrigger.create({
    trigger: "#workbench-pin",
    start: "top 12%",
    end: "+=900",
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Card separation transforms
      const l3 = document.getElementById("layer-item-3");
      const l1 = document.getElementById("layer-item-1");
      
      const zSeparation = p * 110; // separate in z-depth
      const ySeparation = p * 45;  // separate in vertical y-axis
      
      if (l3) {
        l3.style.transform = `translate3d(0, ${-ySeparation}px, ${80 + zSeparation}px)`;
      }
      if (l1) {
        l1.style.transform = `translate3d(0, ${ySeparation}px, ${-80 - zSeparation}px)`;
      }

      // Highlight corresponding layer descriptions based on scroll position
      const info1 = document.getElementById("layer-info-1");
      const info2 = document.getElementById("layer-info-2");
      const info3 = document.getElementById("layer-info-3");

      if (p < 0.33) {
        info1?.classList.add("active");
        info2?.classList.remove("active");
        info3?.classList.remove("active");
      } else if (p >= 0.33 && p < 0.66) {
        info1?.classList.remove("active");
        info2?.classList.add("active");
        info3?.classList.remove("active");
      } else {
        info1?.classList.remove("active");
        info2?.classList.remove("active");
        info3?.classList.add("active");
      }
    }
  });

  // Hardware Validation Panel Live Waveforms
  const validationCanvas = document.getElementById("validation-canvas");
  const vCtx = validationCanvas ? validationCanvas.getContext("2d") : null;
  let validationTab = "oscilloscope";
  let vTime = 0;
  let validationFrameId = null;

  const drawValidationScreen = () => {
    if (!vCtx || !validationCanvas) return;
    
    const w = validationCanvas.width;
    const h = validationCanvas.height;
    
    // Clear screen
    vCtx.fillStyle = "#010603";
    vCtx.fillRect(0, 0, w, h);

    // Draw coordinate grids
    vCtx.strokeStyle = "rgba(0, 255, 102, 0.08)";
    vCtx.lineWidth = 1;
    const gridSpacing = 20;
    
    for (let x = 0; x < w; x += gridSpacing) {
      vCtx.beginPath();
      vCtx.moveTo(x, 0);
      vCtx.lineTo(x, h);
      vCtx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      vCtx.beginPath();
      vCtx.moveTo(0, y);
      vCtx.lineTo(w, y);
      vCtx.stroke();
    }

    // Draw signals
    vCtx.lineWidth = 2;
    if (validationTab === "oscilloscope") {
      vCtx.strokeStyle = "#00ff66";
      vCtx.beginPath();
      for (let x = 0; x < w; x++) {
        // High frequency ripple/switching noise overlay on sine wave
        const ripple = Math.sin(x * 0.25 + vTime * 6) * 3 * Math.sin(x * 0.02);
        const y = h / 2 + Math.sin(x * 0.035 - vTime * 8) * 45 + ripple;
        if (x === 0) vCtx.moveTo(x, y);
        else vCtx.lineTo(x, y);
      }
      vCtx.stroke();
    } else if (validationTab === "logic") {
      vCtx.strokeStyle = "#00e5ff";
      const channels = [
        { name: "TIM1_CH1", offset: 50, rate: 0.08 },
        { name: "SPI_MISO", offset: 110, rate: 0.03 },
        { name: "SPI_CS", offset: 170, rate: 0.008 }
      ];

      channels.forEach((ch) => {
        vCtx.beginPath();
        for (let x = 0; x < w; x++) {
          const phase = x * ch.rate - vTime * 5;
          let val = Math.sin(phase) > 0 ? 1 : 0;
          
          if (ch.name === "SPI_CS" && Math.sin(x * 0.005 - vTime * 0.5) > 0.7) {
            val = 1;
          }
          
          const y = ch.offset - val * 24;
          
          if (x === 0) vCtx.moveTo(x, y);
          else {
            // Draw clean vertical pulse transitions
            const prevPhase = (x - 1) * ch.rate - vTime * 5;
            const prevVal = Math.sin(prevPhase) > 0 ? 1 : 0;
            if (prevVal !== val) {
              vCtx.lineTo(x, ch.offset - prevVal * 24);
            }
            vCtx.lineTo(x, y);
          }
        }
        vCtx.stroke();
      });
    } else if (validationTab === "ltspice") {
      vCtx.strokeStyle = "#ffb07c";
      vCtx.beginPath();
      // MOSFET transient gate switching ringing curve
      for (let x = 0; x < w; x++) {
        const cycle = Math.floor(x / 140);
        const localX = x % 140;
        let y = h - 40;
        
        if (cycle % 2 === 0) {
          // Switch to high state (Vgs charging)
          const target = 50;
          const diff = (h - 40) - target;
          const decay = Math.exp(-localX * 0.07);
          const ring = Math.cos(localX * 0.35 - vTime * 4) * diff * decay;
          y = target - ring;
        } else {
          // Switch to low state (Vgs discharging)
          const target = h - 40;
          const diff = target - 50;
          const decay = Math.exp(-localX * 0.07);
          const ring = Math.cos(localX * 0.35 - vTime * 4) * diff * decay;
          y = target + ring;
        }
        
        if (x === 0) vCtx.moveTo(x, y);
        else vCtx.lineTo(x, y);
      }
      vCtx.stroke();
    }

    vTime += 0.035;
    validationFrameId = requestAnimationFrame(drawValidationScreen);
  };

  // Event handler for tab buttons
  document.querySelectorAll(".v-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".v-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      validationTab = tab.dataset.tab;

      const metricsDiv = document.getElementById("validation-metrics");
      if (metricsDiv) {
        if (validationTab === "oscilloscope") {
          metricsDiv.innerHTML = `
            <span class="metric-readout">V_P2P: 3.32V</span>
            <span class="metric-readout">FREQ: 72.01MHz</span>
            <span class="metric-readout">STATUS: ACTIVE</span>
          `;
        } else if (validationTab === "logic") {
          metricsDiv.innerHTML = `
            <span class="metric-readout">BUS: SPI_1</span>
            <span class="metric-readout">SAMPLES: 1024</span>
            <span class="metric-readout">STATE: SAMPLING</span>
          `;
        } else if (validationTab === "ltspice") {
          metricsDiv.innerHTML = `
            <span class="metric-readout">RISE_T: 42ns</span>
            <span class="metric-readout">RING_V: 0.28V</span>
            <span class="metric-readout">SIM: TRANSIENT</span>
          `;
        }
      }
    });
  });

  // Start validation canvas rendering loop
  if (validationCanvas) {
    drawValidationScreen();
  }

  // --- SECTION 3: POLYGLOT MATRIX CODE WATERFALL ---

  ScrollTrigger.create({
    trigger: "#communication",
    start: "top 60%",
    end: "bottom 30%",
    onEnter: () => {
      document.body.classList.add("theme-matrix");
      window.updateHUDTelemetry && window.updateHUDTelemetry("LOCALIZATION PIPELINES // CODES");
    },
    onLeave: () => {
      document.body.classList.remove("theme-matrix");
      window.updateHUDTelemetry && window.updateHUDTelemetry("SYS_ACTIVE // CLOCK: 72MHz");
    },
    onEnterBack: () => {
      document.body.classList.add("theme-matrix");
      window.updateHUDTelemetry && window.updateHUDTelemetry("LOCALIZATION PIPELINES // CODES");
    },
    onLeaveBack: () => {
      document.body.classList.remove("theme-matrix");
      window.updateHUDTelemetry && window.updateHUDTelemetry("SYS_ACTIVE // CLOCK: 72MHz");
    }
  });

  // Floating vertical matrix waterfall of C code snippets
  const matrixCanvas = document.getElementById("matrix-canvas");
  const mCtx = matrixCanvas ? matrixCanvas.getContext("2d") : null;

  const codeLanguages = {
    english: [
      "void init_clock() {", "  RCC->CR |= 0x01;", "  while(!(RCC->CR & 0x02));", "}",
      "void spi_tx(uint8_t d) {", "  while(!(SPI1->SR & 0x02));", "  SPI1->DR = d;", "}",
      "// PID attitude control", "float err = set - cur;", "pwm = Kp*err + Kd*diff;",
      "// Tx telemetry stream", "send_radio(pkt);"
    ],
    russian: [
      "void инит_частоты() {", "  РСС->КР |= 0x01; // Сброс", "  пока(!(РСС->КР & 0x02));", "}",
      "// ПИД регулятор контура", "float ошибка = цель - тек;", "шим = Кп*ошибка + Кд*разн;",
      "// Передача пакета телеметрии", "отправить_пакет(данные);"
    ],
    french: [
      "void init_horloge() {", "  RCC->CR |= 0x01; // Horloge", "  tant_que(!(RCC->CR & 0x02));", "}",
      "// Boucle de contrôle PID", "float erreur = cible - act;", "pwm = Kp*erreur + Kd*diff;",
      "// Transmission télémétrique", "envoyer_radio(paquet);"
    ],
    spanish: [
      "void init_reloj() {", "  RCC->CR |= 0x01; // Reloj", "  mientras(!(RCC->CR & 0x02));", "}",
      "// Bucle PID estabilización", "float error = consigna - act;", "pwm = Kp*error + Kd*diff;",
      "// Canal de telemetría", "enviar_paquete(datos);"
    ],
    mandarin: [
      "void 核心时钟初始化() {", "  系统寄存器 |= 0x01;", "  while(!(时钟就绪标志));", "}",
      "// PID 飞行姿态控制回路", "float 误差 = 目标值 - 当前值;", "脉冲控制 = 比例*误差 + 微分*差值;",
      "// 下行链路遥测流", "无线电发送数据包(信息);"
    ]
  };

  let activeCodeSet = codeLanguages.english;

  const resizeMatrixCanvas = () => {
    if (!matrixCanvas) return;
    matrixCanvas.width = matrixCanvas.offsetWidth;
    matrixCanvas.height = matrixCanvas.offsetHeight;
  };

  window.addEventListener("resize", resizeMatrixCanvas);
  resizeMatrixCanvas();

  // Create waterfall code columns
  let columns = [];
  const fontSize = 12;
  
  const initColumns = () => {
    if (!matrixCanvas) return;
    const colCount = Math.floor(matrixCanvas.width / 140) + 1;
    columns = [];
    for (let i = 0; i < colCount; i++) {
      columns.push({
        x: i * 140 + Math.random() * 20,
        y: Math.random() * -300,
        speed: 1.5 + Math.random() * 2,
        lineIndex: Math.floor(Math.random() * activeCodeSet.length)
      });
    }
  };

  initColumns();
  window.addEventListener("resize", initColumns);

  const drawMatrixWaterfall = () => {
    if (!mCtx || !matrixCanvas) return;

    // Faint overlay transparent rect to preserve trail
    mCtx.fillStyle = "rgba(2, 8, 4, 0.08)";
    mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    mCtx.font = `${fontSize}px var(--font-mono)`;
    mCtx.fillStyle = "#39ff14";

    columns.forEach((col) => {
      // Draw snippet string
      const snippet = activeCodeSet[col.lineIndex];
      mCtx.fillText(snippet, col.x, col.y);

      col.y += col.speed;

      // Wrap if off bottom
      if (col.y > matrixCanvas.height) {
        col.y = -20;
        col.lineIndex = Math.floor(Math.random() * activeCodeSet.length);
        col.speed = 1.5 + Math.random() * 2;
      }
    });

    requestAnimationFrame(drawMatrixWaterfall);
  };

  if (matrixCanvas) {
    drawMatrixWaterfall();
  }

  // Bind hover triggers to language cards to trigger matrix text-morphing
  // We check periodically for language cards rendered dynamically by script.js
  const setupLanguageHovers = () => {
    const cards = document.querySelectorAll(".language-card");
    if (cards.length > 0) {
      cards.forEach((card) => {
        const titleText = card.querySelector("h3")?.textContent?.toLowerCase() || "";
        
        card.addEventListener("mouseenter", () => {
          if (titleText.includes("english")) {
            activeCodeSet = codeLanguages.english;
          } else if (titleText.includes("russian")) {
            activeCodeSet = codeLanguages.russian;
          } else if (titleText.includes("french")) {
            activeCodeSet = codeLanguages.french;
          } else if (titleText.includes("spanish")) {
            activeCodeSet = codeLanguages.spanish;
          } else if (titleText.includes("mandarin") || titleText.includes("chinese")) {
            activeCodeSet = codeLanguages.mandarin;
          }
        });
      });
    } else {
      // Retry in case dynamic render takes time
      setTimeout(setupLanguageHovers, 300);
    }
  };

  setupLanguageHovers();

  // Cleanup loop when motion is toggled off
  const handleMotionChange = () => {
    const isMotionOff = document.documentElement.dataset.motion === "off";
    if (isMotionOff) {
      if (validationFrameId) cancelAnimationFrame(validationFrameId);
    } else {
      if (validationCanvas && !validationFrameId) drawValidationScreen();
    }
  };

  const motionBtn = document.querySelector("[data-motion-toggle]");
  if (motionBtn) {
    motionBtn.addEventListener("click", handleMotionChange);
  }
})();
