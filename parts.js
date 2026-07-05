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

const DB_CX_OVER_RINGS = [ "Break (B)", "Flow (F)", "Guard (G)", "I", "Outer (O)", "Peak (P)", "T" ];
const DB_CX_ASSIST_BLADES = [ "Assault (A)", "Bumper (B)", "Charge (C)", "Dual (D)", "Erase (E)", "Free (F)", "Gravity (G)", "Heavy (H)", "Jaggy (J)", "Knuckle (K)", "Massive (M)", "Odd (O)", "Q", "Round (R)", "Slash (S)", "Turn (T)", "Vertical (V)", "Wheel (W)", "Zillion (Z)" ];
const DB_RATCHETS = [ "1-50", "1-60", "1-70", "1-80", "2-60", "2-70", "2-80", "3-60", "3-70", "3-80", "3-85", "4-50", "4-55", "4-60", "4-70", "4-80", "5-50", "5-60", "5-70", "5-80", "6-60", "6-70", "6-80", "7-55", "7-60", "7-70", "7-80", "8-70", "9-55", "9-60", "9-70", "9-80", "0-60", "0-70", "0-80", "M-85" ];
const DB_BITS = [ "Accel (A)", "Ball (B)", "Bound Spike (BS)", "Cyclone (C)", "Disc Ball (DB)", "Dot (D)", "Elevate (E)", "Flat (F)", "Free Ball (FB)", "Gear Flat (GF)", "Gear Ball (GB)", "Gear Needle (GN)", "Gear Point (GP)", "Gear Rush (GR)", "Gear Unite (GU)", "Glide (GL)", "Hexa (H)", "High Needle (HN)", "High Taper (HT)", "Ignition (I)", "Kick (K)", "Level (L)", "Low Flat (LF)", "Low Orb (LO)", "Low Rush (LR)", "Metal Needle (MN)", "Needle (N)", "Narrow (Nr)", "Orb (O)", "Point (P)", "Quake (Q)", "Rubber Accel (RA)", "Rush (R)", "Spike (SP)", "Taper (T)", "Trans Point (TP)", "Under Needle (UN)", "Unite (U)", "Vortex (V)", "Wide Ball (WB)", "Wide Needle (WN)", "Wide Extreme (WX)", "Wave (W)", "Wedge (W)", "Yielding (Y)", "Zap (Z)", "Operate (Op)", "Turbo (Tr)" ];
const DB_HYBRID_CORES = [ "Giga Flat [GF-H]", "Tera Ball [TB-H]", "Apex Needle [AN-H]", "Nova Stamina [NS-H]", "Cosmo Friction [CF-H]", "Quantum Defense [QD-H]" ];

let playerDecks = { 1: ["+ Select Bey 1", "+ Select Bey 2", "+ Select Bey 3"], 2: ["+ Select Bey 1", "+ Select Bey 2", "+ Select Bey 3"] };
let activeModalPlayer = null, activeModalSlot = null;

let CUSTOM_VAULT_REGISTRY = [];

let TRACKED_LIVE_META_PARTS = [
    "Wizard Rod", "Phoenix Wing", "Shark Edge", "Dran Buster", "Aero Pegasus",
    "Ball (B)", "Flat (F)", "Gear Flat (GF)", "Gear Ball (GB)", "Hexa (H)", "Free Ball (FB)"
];

function openPartsModal(playerNum, slotIndex) {
    if (typeof lineupsAreLocked !== 'undefined' && lineupsAreLocked) return;
    activeModalPlayer = playerNum; activeModalSlot = slotIndex;
    
    let pName = document.getElementById(`p${playerNum}-name`).value;
    document.getElementById("modal-player-title").innerText = `${pName} - Configuration [Slot ${slotIndex + 1}]`;
    document.getElementById("select-system").value = "STANDARD";
    document.getElementById("select-ratchet-type").value = "STANDARD";
    
    handleSystemChange();
    handleRatchetTypeChange();
    initializeQuickPickManager();
    
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
        container.innerHTML = `<div class="form-group"><label for="select-blade">Standard Blade</label><select id="select-blade">${renderOptions(DB_STANDARD_BLADES)}</select></div>`;
    } else {
        let rows = `<div class="nested-row"><div class="form-group"><label for="select-chip">Lock Chip</label><select id="select-chip">${renderOptions(DB_CX_LOCK_CHIPS)}</select></div><div class="form-group"><label for="select-metal">Metal Layer</label><select id="select-metal">${renderOptions(DB_CX_METAL_LAYERS)}</select></div></div>`;
        if (sys === "CX_EXPAND") {
            rows += `<div class="nested-row"><div class="form-group"><label for="select-overring">Over Ring Shield</label><select id="select-overring">${renderOptions(DB_CX_OVER_RINGS)}</select></div><div class="form-group"><label for="select-assistblade">Assist Peripheral</label><select id="select-assistblade">${renderOptions(DB_CX_ASSIST_BLADES)}</select></div></div>`;
        }
        container.innerHTML = rows;
    }
}

function handleRatchetTypeChange() {
    const rType = document.getElementById("select-ratchet-type").value;
    const container = document.getElementById("dynamic-ratchet-inputs");
    container.innerHTML = "";

    if (rType === "STANDARD") {
        container.innerHTML = `<div class="nested-row"><div class="form-group"><label for="select-ratchet">Height Ratchet</label><select id="select-ratchet">${renderOptions(DB_RATCHETS)}</select></div><div class="form-group"><label for="select-bit">Gear Bit Profile</label><select id="select-bit">${renderOptions(DB_BITS)}</select></div></div>`;
    } else if (rType === "HYBRID") {
        container.innerHTML = `<div class="form-group"><label for="select-hybrid">Hybrid Integrated Core</label><select id="select-hybrid">${renderOptions(DB_HYBRID_CORES)}</select></div>`;
    }
}

function renderOptions(array) {
    const localSyncedMeta = localStorage.getItem('beyx_live_star_meta_tracker');
    if (localSyncedMeta) TRACKED_LIVE_META_PARTS = JSON.parse(localSyncedMeta);

    return array.map(item => {
        const isMeta = TRACKED_LIVE_META_PARTS.some(meta => item.startsWith(meta) || item.includes(meta));
        return `<option value="${item}">${isMeta ? `★ ${item}` : item}</option>`;
    }).join("");
}

function clearPartsSelection() { savePartsSelection(true); }

function savePartsSelection(isCleared = false) {
    let bladeString = "";
    const sys = document.getElementById("select-system").value;

    if (!isCleared) {
        if (sys === "STANDARD") bladeString = document.getElementById("select-blade").value;
        else {
            let chipVal = document.getElementById("select-chip").value, metalRaw = document.getElementById("select-metal").value.split(" ")[0];
            if (sys === "CX_MODULAR") bladeString = `${chipVal}${metalRaw}`;
            else bladeString = `${chipVal}${metalRaw}${document.getElementById("select-overring").value.charAt(0)}${document.getElementById("select-assistblade").value.charAt(0)}`;
        }
    }

    if (isCleared) {
        playerDecks[activeModalPlayer][activeModalSlot] = `+ Select Bey ${activeModalSlot + 1}`;
    } else {
        let coreString = document.getElementById("select-ratchet-type").value === "HYBRID" ? 
            document.getElementById("select-hybrid").value : `${document.getElementById("select-ratchet").value}${document.getElementById("select-bit").value}`;
        playerDecks[activeModalPlayer][activeModalSlot] = `${bladeString} ${coreString}`.trim();
    }
    renderDeckDisplay(activeModalPlayer); closePartsModal();
    if (typeof saveMatchToCache === 'function') saveMatchToCache();
}

function renderDeckDisplay(playerNum) {
    for (let i = 0; i < 3; i++) document.getElementById(`p${playerNum}-combo-${i}`).innerText = playerDecks[playerNum][i];
}

function shiftLineup(playerNum, index, direction) {
    if (typeof lineupsAreLocked !== 'undefined' && lineupsAreLocked) return;
    let targetIndex = index + direction; if (targetIndex < 0 || targetIndex > 2) return;
    let temp = playerDecks[playerNum][index]; playerDecks[playerNum][index] = playerDecks[playerNum][targetIndex]; playerDecks[playerNum][targetIndex] = temp;
    renderDeckDisplay(playerNum);
    if (typeof updateActiveSlotHighlight === 'function') updateActiveSlotHighlight(playerNum, playerNum === 1 ? p1ActiveSlot : p2ActiveSlot);
}

function saveActiveComboToCustomManager() {
    let bladeString = ""; const sys = document.getElementById("select-system").value;
    if (sys === "STANDARD") bladeString = document.getElementById("select-blade").value;
    else {
        let chipVal = document.getElementById("select-chip").value, metalRaw = document.getElementById("select-metal").value.split(" ")[0];
        if (sys === "CX_MODULAR") bladeString = `${chipVal}${metalRaw}`;
        else bladeString = `${chipVal}${metalRaw}${document.getElementById("select-overring").value.charAt(0)}${document.getElementById("select-assistblade").value.charAt(0)}`;
    }
    let coreString = document.getElementById("select-ratchet-type").value === "HYBRID" ? 
        document.getElementById("select-hybrid").value : document.getElementById("select-ratchet").value + document.getElementById("select-bit").value;

    const fullString = `${bladeString} ${coreString}`.trim();
    
    if (CUSTOM_VAULT_REGISTRY.includes(fullString)) return;
    if (CUSTOM_VAULT_REGISTRY.length >= 20) {
        alert("Vault at max capacity! Remove an older build before adding a new blueprint choice."); return;
    }

    CUSTOM_VAULT_REGISTRY.push(fullString);
    localStorage.setItem('beyx_custom_vault_array', JSON.stringify(CUSTOM_VAULT_REGISTRY));
    initializeQuickPickManager();

    if (typeof updateLogDisplay === 'function') updateLogDisplay(`💾 Vault Allocation: "${fullString}" locked into custom grid.`);
    const btn = document.querySelector(".modal-save-custom-btn"); btn.style.borderColor = "#2ed573"; btn.innerText = "✓ Vaulted!";
    setTimeout(() => { btn.style.borderColor = ""; btn.innerText = "💾 Save to Vault"; }, 1000);
}

function deleteVaultBlueprint(index, event) {
    event.stopPropagation();
    CUSTOM_VAULT_REGISTRY.splice(index, 1);
    localStorage.setItem('beyx_custom_vault_array', JSON.stringify(CUSTOM_VAULT_REGISTRY));
    initializeQuickPickManager();
}

function initializeQuickPickManager() {
    const grid = document.getElementById("meta-presets-grid"); if (!grid) return;
    const cachedVault = localStorage.getItem('beyx_custom_vault_array');
    if (cachedVault) CUSTOM_VAULT_REGISTRY = JSON.parse(cachedVault);

    document.getElementById("vault-count-label").innerText = `📋 Custom Blueprint Vault (${CUSTOM_VAULT_REGISTRY.length}/20)`;

    if (CUSTOM_VAULT_REGISTRY.length === 0) {
        grid.innerHTML = `<div style="grid-column:span 2; font-size:0.72rem; color:var(--text-muted); font-style:italic; padding: 4px 0;">No active blueprints found. Build a combo and click "Save to Vault" to start.</div>`;
        return;
    }

    grid.innerHTML = CUSTOM_VAULT_REGISTRY.map((combo, idx) => {
        return `<div class="preset-tile" onclick="quickSelectCombo('${combo}')" title="${combo}"><span>👤 ${combo}</span><button class="vault-delete-anchor" onclick="deleteVaultBlueprint(${idx}, event)">×</button></div>`;
    }).join("");
}

function triggerLiveMetaSynchronization() {
    const btn = document.getElementById("sync-button"); if (!btn) return;
    btn.classList.add("syncing"); btn.innerText = "⚡ Fetching...";

    const REAL_META_ENDPOINT_URL = "https://yourusername.github.io/bbx-meta-api/current.json";

    fetch(REAL_META_ENDPOINT_URL)
        .then(response => { if (!response.ok) throw new Error("Latency mismatch"); return response.json(); })
        .then(freshServerData => {
            if (Array.isArray(freshServerData) && freshServerData.length > 0) {
                TRACKED_LIVE_META_PARTS = freshServerData;
                localStorage.setItem('beyx_live_star_meta_tracker', JSON.stringify(freshServerData));
                if (typeof updateLogDisplay === 'function') updateLogDisplay("🔮 Meta Registry Synced: BBXWeekly platform metrics updated.");
            }
        })
        .catch(err => {
            const NET_FALLBACK_INDEX = [
                "Wizard Rod", "Phoenix Wing", "Shark Edge", "Dran Buster", "Aero Pegasus", "Silver Wolf",
                "Ball (B)", "Flat (F)", "Gear Flat (GF)", "Hexa (H)", "Free Ball (FB)", "Gliding (GL)"
            ];
            TRACKED_LIVE_META_PARTS = NET_FALLBACK_INDEX;
            localStorage.setItem('beyx_live_star_meta_tracker', JSON.stringify(NET_FALLBACK_INDEX));
            if (typeof updateLogDisplay === 'function') updateLogDisplay("🔮 Meta Registry Synced: Local structural backup indicators armed.");
        })
        .finally(() => {
            btn.classList.remove("syncing"); btn.innerText = "🔄 Sync Live Meta";
            handleSystemChange(); 
        });
}

function quickSelectCombo(fullComboString) {
    if (activeModalPlayer === null || activeModalSlot === null) return;
    playerDecks[activeModalPlayer][activeModalSlot] = fullComboString;
    renderDeckDisplay(activeModalPlayer); closePartsModal();
    if (typeof saveMatchToCache === 'function') saveMatchToCache();
}

window.addEventListener('DOMContentLoaded', initializeQuickPickManager);