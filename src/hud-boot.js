// AM-OS simulated bare-metal boot sequence and global HUD overlays
(function () {
  const bootOverlay = document.getElementById("boot-overlay");
  const bootLinesContainer = document.getElementById("boot-lines");
  const bootProgressFill = document.getElementById("boot-progress");
  const hudOverlay = document.getElementById("hud-overlay");

  const hudCoords = document.getElementById("hud-coords");
  const hudPower = document.getElementById("hud-power");
  const hudTelemetry = document.getElementById("hud-telemetry");
  const hudAltitude = document.getElementById("hud-altitude");

  const bootLines = [
    "AM-OS Bootloader v2.0 // INITIALIZING Handshake...",
    "CORE :: HSE oscillator (8.00 MHz) selected.",
    "CORE :: Configuring PLL clock tree multipliers...",
    "CORE :: AHB Prescaler = 1, APB1 = 2, APB2 = 1.",
    "CORE :: System Clock locked at 72.00 MHz. Max power mode.",
    "MEM  :: Scanning SRAM bank 1 [0x20000000 - 0x2001FFFF]...",
    "MEM  :: SRAM validation PASSED (128 KB write/verify OK).",
    "MEM  :: Flash storage block [0x08000000 - 0x080FFFFF] mapping...",
    "MEM  :: Boot sector verification checksum 0xA58F4F2E - OK.",
    "PERIPH :: Initializing SPI1 controller for IMU bus...",
    "PERIPH :: SPI1 baudrate set to 9.0 MHz (Clock div 8) - OK.",
    "PERIPH :: Initializing I2C1 (Fast Mode, 400 kHz)...",
    "PERIPH :: Handshake with LSM6DS3 IMU address 0x6A... OK.",
    "PERIPH :: Configuring GPIO Ports A, B, C for PWM actuation...",
    "PERIPH :: Timer 1 CH1/CH2/CH3/CH4 configured for complementary PWM - OK.",
    "TELEM  :: Launching telemetry downlink transmitter...",
    "TELEM  :: Tx frequency = 437.550 MHz (Technician Licensed Amateur Band).",
    "TELEM  :: Forward Error Correction (FEC) rate 1/2 enabled.",
    "TELEM  :: Link budget margin: +12.4 dB (Orbit range 400 km).",
    "NET    :: Connecting Modbus (RTU/TCP) serialization handlers...",
    "NET    :: Omni-patcher Agent listener established on serial RS-485.",
    "SYSTEM :: Bare-metal boot diagnostics COMPLETE.",
    "SYSTEM :: Initializing flight loop...",
    ">> BOOT COMPLETE. WELCOME COMMANDER MAKAREVICH."
  ];

  let currentLineIndex = 0;
  let isBooting = true;

  // Print lines terminal style
  const printNextLine = () => {
    if (!isBooting || !bootLinesContainer) return;

    if (currentLineIndex < bootLines.length) {
      const lineDiv = document.createElement("div");
      lineDiv.className = "boot-line";
      lineDiv.textContent = `> ${bootLines[currentLineIndex]}`;
      bootLinesContainer.appendChild(lineDiv);
      bootLinesContainer.scrollTop = bootLinesContainer.scrollHeight;

      // Progress bar fill proportional to lines printed
      const progressPercent = Math.min(((currentLineIndex + 1) / bootLines.length) * 100, 100);
      if (bootProgressFill) {
        bootProgressFill.style.width = `${progressPercent}%`;
      }

      currentLineIndex++;
      
      // Variable speed for text print output to mimic hardware reads
      const speed = Math.random() * 80 + 30;
      setTimeout(printNextLine, speed);
    } else {
      completeBootSequence();
    }
  };

  const completeBootSequence = () => {
    if (!isBooting) return;
    isBooting = false;
    
    if (bootOverlay) {
      bootOverlay.classList.add("boot-complete");
      setTimeout(() => {
        bootOverlay.style.display = "none";
      }, 500);
    }
    if (hudOverlay) {
      hudOverlay.classList.remove("hud-inactive");
    }

    // Trigger standard scroll reveal elements visual updates once boot ends
    document.querySelectorAll("[data-reveal]").forEach((node) => {
      node.classList.add("is-visible");
    });
  };

  // Skip boot trigger
  const skipBoot = () => {
    if (isBooting) {
      completeBootSequence();
    }
  };

  // HUD mouse coordinate tracking
  const handlePointerMove = (event) => {
    if (!hudCoords) return;
    hudCoords.textContent = `X: ${String(event.clientX).padStart(4, "0")} // Y: ${String(event.clientY).padStart(4, "0")}`;
  };

  // HUD simulated voltage fluctuations (noisy voltage rails)
  const updateVoltageRails = () => {
    if (!hudPower) return;
    const v5 = (5.01 + Math.random() * 0.04).toFixed(2);
    const v33 = (3.30 + Math.random() * 0.02).toFixed(2);
    hudPower.textContent = `${v5}V // ${v33}V`;
    setTimeout(updateVoltageRails, 400 + Math.random() * 400);
  };

  // HUD Altitude tracking based on scroll depth
  const handleScroll = () => {
    if (!hudAltitude) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? window.scrollY / docHeight : 0;
    const altitude = (percent * 400).toFixed(2); // Low Earth Orbit altitude range 0 to 400km
    hudAltitude.textContent = `${altitude} KM`;
  };

  // Initialize
  if (bootOverlay) {
    bootOverlay.addEventListener("click", skipBoot);
    window.addEventListener("keydown", skipBoot);
    setTimeout(printNextLine, 200);
  } else {
    // If element is not found, skip immediately
    if (hudOverlay) {
      hudOverlay.classList.remove("hud-inactive");
    }
  }

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("scroll", handleScroll, { passive: true });
  
  // Start HUD loops
  updateVoltageRails();
  handleScroll();

  // Export helper to allow custom sections to override telemetry message
  window.updateHUDTelemetry = (msg) => {
    if (hudTelemetry) {
      hudTelemetry.textContent = msg;
    }
  };
})();
