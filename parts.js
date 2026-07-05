// TAKARA TOMY OFFICIAL CHRONOLOGICAL REGISTRY DATA INDEX (BX / UX / CX REGISTRIES)
const DB_STANDARD_BLADES = [
    "Dran Sword", "Hells Scythe", "Wizard Arrow", "Knight Shield", "Shark Edge", 
    "Knight Lance", "Leon Claw", "Viper Tail", "Rhino Horn", "Dran Dagger", 
    "Hells Chain", "Phoenix Feather", "Phoenix Wing", "Wyvern Gale", "Unicorn Sting", 
    "Sphinx Cowl", "Dran Buster", "Hells Hammer", "Wizard Rod", "Tyranno Beat", 
    "Aero Pegasus", "Black Shell", "Cobalt Drake", "Cobalt Dragoon", "Clock Mirage", 
    "Crimson Garuda", "Crimson Flayer", "Dran Strike", "Weiss Tiger", "Whale Wave", 
    "Xeno Xcalibur", "Yell Kong", "Mammoth Tusk", "Dragoon Storm", "Driger Slash", 
    "Draciel Shield", "Storm Pegasis", "Victory Valkyrie", "Ghost Circle", "Golem Rock", 
    "Impact Drake", "Knight Mail", "Leon Crest", "Leon Roar", "Lightning Eagle", 
    "Meteor Dragoon", "Mummy Curse", "Orochi Cluster", "Pegasus Jolt", "Phoenix Rudder", 
    "Pegasus Omega", "Ptera Swing", "Rogue Sphinx", "Samurai Saber", "Samurai Steel", 
    "Samurai Calibur", "Shark Scale", "Shark Gill", "Shinobi Shadow", "Shinobi Knife", 
    "Silver Wolf", "Scorpio Spear", "Sonic Tiger", "Tricera Press", "Tyranno Roar", 
    "Viper Bite", "Wyvern Hover"
];

const DB_CX_LOCK_CHIPS = [
    "Bahamut", "Brachio", "Cerberus", "Dran", "Eva", "Fox", "Hells", "Hornet", 
    "Knight", "Kraken", "Leon", "Emperor", "Pegasus", "Perseus", "Phoenix", 
    "Ragna", "Rhino", "Sol", "Bucks", "Unicorn", "Valkyrie", "Whale", "Wolf", "Wizard"
];

const DB_CX_METAL_LAYERS = [
    "Blitz", "Delta", "Fortress", "Hurricane", "Rage", "Tread", "Whip", 
    "Arc", "Brave", "Brush", "Dark", "Eclipse", "Fang", "Flame", "Flare", 
    "Fort", "Hunt", "Might", "Reaper", "Volt", "Wriggle"
];

const DB_CX_OVER_RINGS = [
    "Break (B)", "Flow (F)", "Guard (G)", "I", "Outer (O)", "Peak (P)", "T"
];

const DB_CX_ASSIST_BLADES = [
    "Assault (A)", "Bumper (B)", "Charge (C)", "Dual (D)", "Erase (E)", "Free (F)", 
    "Gravity (G)", "Heavy (H)", "Jaggy (J)", "Knuckle (K)", "Massive (M)", "Odd (O)", 
    "Q", "Round (R)", "Slash (S)", "Turn (T)", "Vertical (V)", "Wheel (W)", "Zillion (Z)"
];

const DB_RATCHETS = [
    "1-50", "1-60", "1-70", "1-80",
    "2-60", "2-70", "2-80",
    "3-60", "3-70", "3-80", "3-85",
    "4-50", "4-55", "4-60", "4-70", "4-80",
    "5-50", "5-60", "5-70", "5-80",
    "6-60", "6-70", "6-80",
    "7-55", "7-60", "7-70", "7-80",
    "8-70",
    "9-55", "9-60", "9-70", "9-80",
    "0-60", "0-70", "0-80",
    "M-85"
];

const DB_BITS = [
    "Accel (A)", "Ball (B)", "Bound Spike (BS)", "Cyclone (C)", "Disc Ball (DB)", "Dot (D)", 
    "Elevate (E)", "Flat (F)", "Free Ball (FB)", "Gear Flat (GF)", "Gear Ball (GB)", 
    "Gear Needle (GN)", "Gear Point (GP)", "Gear Rush (GR)", "Gear Unite (GU)", "Glide (GL)", 
    "Hexa (H)", "High Needle (HN)", "High Taper (HT)", "Ignition (I)", "Kick (K)", 
    "Level (L)", "Low Flat (LF)", "Low Orb (LO)", "Low Rush (LR)", "Metal Needle (MN)", 
    "Needle (N)", "Narrow (Nr)", "Orb (O)", "Point (P)", "Quake (Q)", "Rubber Accel (RA)", 
    "Rush (R)", "Spike (SP)", "Taper (T)", "Trans Point (TP)", "Under Needle (UN)", 
    "Unite (U)", "Vortex (V)", "Wide Ball (WB)", "Wide Needle (WN)", "Wide Extreme (WX)", 
    "Wave (W)", "Wedge (W)", "Yielding (Y)", "Zap (Z)", "Operate (Op)", "Turbo (Tr)"
];

const DB_HYBRID_CORES = [
    "Giga Flat [GF-H]", "Tera Ball [TB-H]", "Apex Needle [AN-H]", "Nova Stamina [NS-H]", 
    "Cosmo Friction [CF-H]", "Quantum Defense [QD-H]"
];

let playerDecks = {
    1: ["+ Select Bey 1", "+ Select Bey 2", "+ Select Bey 3"],
    2: ["+ Select Bey 1", "+ Select Bey 2", "+ Select Bey 3"]
};

let activeModalPlayer = null;
let activeModalSlot = null;

function openPartsModal(playerNum, slotIndex) {
    if (typeof lineupsAreLocked !== 'undefined' && lineupsAreLocked) return;

    activeModalPlayer = playerNum;
    activeModalSlot = slotIndex;
    
    let pName = document.getElementById(`p${playerNum}-name`).value;
    document.getElementById("modal-player-title").innerText = `${pName} - Configuration [Slot ${slotIndex + 1}]`;
    
    document.getElementById("select-system").value = "STANDARD";
    document.getElementById("select-ratchet-type").value = "STANDARD";
    
    handleSystemChange();
    handleRatchetTypeChange();
    
    document.getElementById("backdrop-layer").classList.add("active");
    document.getElementById("parts-modal").classList.add("active");
}

function closePartsModal() {
    document.getElementById("backdrop-layer").classList.remove("active");
    document.getElementById("parts-modal").classList.remove("active");
}

function handleSystemChange() {
    const sys = document.getElementById("select-system").value;
    const container = document.getElementById("dynamic-blade-inputs");
    container.innerHTML = "";

    if (sys === "STANDARD") {
        container.innerHTML = `
            <div class="form-group">
                <label for="select-blade">Standard Blade</label>
                <select id="select-blade">${renderOptions(DB_STANDARD_BLADES)}</select>
            </div>
        `;
    } else if (sys === "CX_MODULAR") {
        container.innerHTML = `
            <div class="nested-row">
                <div class="form-group">
                    <label for="select-chip">Lock Chip</label>
                    <select id="select-chip">${renderOptions(DB_CX_LOCK_CHIPS)}</select>
                </div>
                <div class="form-group">
                    <label for="select-metal">Metal Layer</label>
                    <select id="select-metal">${renderOptions(DB_CX_METAL_LAYERS)}</select>
                </div>
            </div>
        `;
    } else if (sys === "CX_EXPAND") {
        container.innerHTML = `
            <div class="nested-row">
                <div class="form-group">
                    <label for="select-chip">Lock Chip</label>
                    <select id="select-chip">${renderOptions(DB_CX_LOCK_CHIPS)}</select>
                </div>
                <div class="form-group">
                    <label for="select-metal">Metal Layer</label>
                    <select id="select-metal">${renderOptions(DB_CX_METAL_LAYERS)}</select>
                </div>
            </div>
            <div class="nested-row">
                <div class="form-group">
                    <label for="select-overring">Over Ring Shield</label>
                    <select id="select-overring">${renderOptions(DB_CX_OVER_RINGS)}</select>
                </div>
                <div class="form-group">
                    <label for="select-assistblade">Assist Peripheral</label>
                    <select id="select-assistblade">${renderOptions(DB_CX_ASSIST_BLADES)}</select>
                </div>
            </div>
        `;
    }
}

function handleRatchetTypeChange() {
    const rType = document.getElementById("select-ratchet-type").value;
    const container = document.getElementById("dynamic-ratchet-inputs");
    container.innerHTML = "";

    if (rType === "STANDARD") {
        container.innerHTML = `
            <div class="nested-row">
                <div class="form-group">
                    <label for="select-ratchet">Height Ratchet</label>
                    <select id="select-ratchet">${renderOptions(DB_RATCHETS)}</select>
                </div>
                <div class="form-group">
                    <label for="select-bit">Gear Bit Profile</label>
                    <select id="select-bit">${renderOptions(DB_BITS)}</select>
                </div>
            </div>
        `;
    } else if (rType === "HYBRID") {
        container.innerHTML = `
            <div class="form-group">
                <label for="select-hybrid">Hybrid Integrated Core</label>
                <select id="select-hybrid">${renderOptions(DB_HYBRID_CORES)}</select>
            </div>
        `;
    }
}

function renderOptions(array) {
    return array.map(item => `<option value="${item}">${item}</option>`).join("");
}

function clearPartsSelection() {
    savePartsSelection(true);
}

function savePartsSelection(isCleared = false) {
    let bladeString = "";
    const sys = document.getElementById("select-system").value;

    if (!isCleared) {
        if (sys === "STANDARD") {
            bladeString = document.getElementById("select-blade").value;
        } else {
            let chipVal = document.getElementById("select-chip").value;
            let metalRaw = document.getElementById("select-metal").value;
            let metal = metalRaw.split(" ")[0]; 
            
            if (sys === "CX_MODULAR") {
                bladeString = `${chipVal}${metal}`;
            } else if (sys === "CX_EXPAND") {
                let over = document.getElementById("select-overring").value;
                let assist = document.getElementById("select-assistblade").value;
                bladeString = `${chipVal}${metal}${over.charAt(0)}${assist.charAt(0)}`;
            }
        }
    }

    if (isCleared) {
        playerDecks[activeModalPlayer][activeModalSlot] = `+ Select Bey ${activeModalSlot + 1}`;
    } else {
        let coreString = "";
        const ratchetType = document.getElementById("select-ratchet-type").value;
        if (ratchetType === "HYBRID") {
            coreString = document.getElementById("select-hybrid").value;
        } else {
            let ratch = document.getElementById("select-ratchet").value;
            let bit = document.getElementById("select-bit").value;
            coreString = `${ratch}${bit}`;
        }
        playerDecks[activeModalPlayer][activeModalSlot] = `${bladeString} ${coreString}`.trim();
    }
    
    renderDeckDisplay(activeModalPlayer);
    closePartsModal();
}

function renderDeckDisplay(playerNum) {
    for (let i = 0; i < 3; i++) {
        document.getElementById(`p${playerNum}-combo-${i}`).innerText = playerDecks[playerNum][i];
    }
}

function shiftLineup(playerNum, index, direction) {
    if (typeof lineupsAreLocked !== 'undefined' && lineupsAreLocked) return;

    let targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex > 2) return;
    
    let temp = playerDecks[playerNum][index];
    playerDecks[playerNum][index] = playerDecks[playerNum][targetIndex];
    playerDecks[playerNum][targetIndex] = temp;
    
    renderDeckDisplay(playerNum);
    
    if (playerNum === 1 && activeModalPlayer === 1) {
         updateActiveSlotHighlight(1, p1ActiveSlot);
    } else if (playerNum === 2 && activeModalPlayer === 2) {
         updateActiveSlotHighlight(2, p2ActiveSlot);
    }
}