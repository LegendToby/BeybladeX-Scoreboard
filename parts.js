// EXHAUSTIVE COMPETITIVE BEYBLADE X REGISTRY DATA
const DB_STANDARD_BLADES = [
    "Aero Pegasus", "Black Shell", "Bear Scratch", "Cobalt Drake", "Cobalt Dragoon", 
    "Clock Mirage", "Crimson Garuda", "Dran Sword", "Dran Dagger", "Dran Buster", 
    "Dran Strike", "Dranzer S", "Ghost Circle", "Golem Rock", "Hells Scythe", 
    "Hells Chain", "Hells Hammer", "Impact Drake", "Knight Shield", "Knight Lance", 
    "Knight Mail", "Leon Claw", "Leon Crest", "Meteor Dragoon", "Mummy Curse", 
    "Mummy Cluster", "Orochi Cluster", "Phoenix Feather", "Phoenix Wing", "Phoenix Rudder", 
    "Ptera Swing", "Rhino Horn", "Samurai Saber", "Samurai Steel", "Samurai Calibur", 
    "Shark Edge", "Shark Scale", "Shark Gill", "Shinobi Shadow", "Shinobi Knife", 
    "Silver Wolf", "Sphinx Cowl", "Shelter Drake", "Scorpio Spear", "Tricera Press", 
    "Tyranno Beat", "Tyranno Roar", "Viper Tail", "Wyvern Gale", "Wyvern Hover", 
    "Wizard Arrow", "Wizard Rod"
];

const DB_CX_LOCK_CHIPS = [
    "Bahamut", "Brachio", "Cerberus", "Croc", "Drake", "Dran", "Enlil", "Eva", "Fox", 
    "Hells", "Hornet", "Knight", "Kraken", "Leon", "Emperor", "Pegasus", "Perseus", 
    "Phoenix", "Ragna", "Rhino", "Sol", "Stag", "Unicorn", "Valkyrie", "Whale", "Wolf", "Wizard"
];

const DB_CX_MAIN_BLADES = [
    "Antler", "Arc", "Blast", "Brave", "Brush", "Dark", "Eclipse", "Fang", "Flame", 
    "Flare", "Fort", "Hunt", "Might", "Reaper", "Volt", "Wriggle"
];

const DB_CX_METAL_BLADES = ["Blitz", "Delta", "Fortress", "Hurricane", "Rage", "Tread", "Whip"];
const DB_CX_OVER_BLADES = ["Break", "Flow", "Guard", "I", "Outer", "Peak", "T"];

const DB_CX_ASSIST_BLADES = [
    "Assault", "Bumper", "Charge", "Dual", "Erase", "Free", "Gravity", "Heavy", "Jaggy", 
    "Knuckle", "Massive", "Odd", "Q", "Round", "Slash", "Turn", "Vertical", "Wheel", "Zillion"
];

const DB_RATCHETS = [
    "0-60", "0-70", "0-80", "1-50", "1-60", "1-70", "1-80", "2-60", "2-70", "2-80", 
    "3-60", "3-70", "3-80", "3-85", "4-50", "4-55", "4-60", "4-70", "4-80", "5-50", 
    "5-60", "5-70", "5-75", "5-80", "6-60", "6-70", "6-80", "7-55", "7-60", "7-70", 
    "7-80", "8-70", "9-60", "9-65", "9-70", "9-80", "M-85"
];

const DB_BITS = [
    "A (Accel)", "B (Ball)", "BS (Bound Spike)", "C (Cyclone)", "D (Disc)", "DB (Disk Ball)", 
    "F (Flat)", "FB (Free Ball)", "FF (Free Flat)", "G (Glide)", "GB (Gear Ball)", "GF (Gear Flat)", 
    "GN (Gear Needle)", "GP (Gear Point)", "GR (Gear Rush)", "GU (Gear Unite)", "H (Hexa)", 
    "HN (High Needle)", "HT (High Taper)", "I (Ignition)", "J (Jolt)", "K (Kick)", "L (Level)", 
    "LF (Low Flat)", "LN (Low Needle)", "LO (Low Orb)", "LR (Low Rush)", "MN (Metal Needle)", 
    "N (Needle)", "Nr (Narrow)", "O (Orb)", "P (Point)", "Q (Quake)", "R (Rush)", "RA (Rubber Accel)", 
    "T (Taper)", "TK (Trans Kick)", "UF (Under Flat)", "UN (Under Needle)", "V (Vortex)", 
    "W (Wedge)", "WB (Wall Ball)", "WW (Wall Wedge)", "Y (Yielding)", "Z (Zap)"
];

const DB_HYBRID_RATCHET_BITS = ["Op (Operate)", "Tr (Turbo)"];

document.addEventListener("DOMContentLoaded", () => {
    toggleSystemArchitectureLayout("STANDARD");
});

function toggleSystemArchitectureLayout(systemType) {
    const container = document.getElementById("part-selectors-zone");
    if(!container) return;
    container.innerHTML = ""; 

    if (systemType === "STANDARD") {
        container.innerHTML = `
            <div class="form-group">
                <label for="select-blade">Blade Layer</label>
                <select id="select-blade">
                    <option value="CLEAR">❌ None / Remove Combo</option>
                    ${generateOptions(DB_STANDARD_BLADES)}
                </select>
            </div>
        `;
    } else if (systemType === "CX_STANDARD") {
        container.innerHTML = `
            <div class="form-group">
                <label for="select-lockchip">CX Lock Chip</label>
                <select id="select-lockchip">
                    <option value="CLEAR">❌ None / Remove Combo</option>
                    ${generateOptions(DB_CX_LOCK_CHIPS)}
                </select>
            </div>
            <div class="form-group">
                <label for="select-mainblade">CX Main Blade</label>
                <select id="select-mainblade">${generateOptions(DB_CX_MAIN_BLADES)}</select>
            </div>
            <div class="form-group">
                <label for="select-assistblade">CX Assist Blade</label>
                <select id="select-assistblade">${generateOptions(DB_CX_ASSIST_BLADES)}</select>
            </div>
        `;
    } else if (systemType === "CX_EXPAND") {
        container.innerHTML = `
            <div class="form-group">
                <label for="select-lockchip">CX Lock Chip</label>
                <select id="select-lockchip">
                    <option value="CLEAR">❌ None / Remove Combo</option>
                    ${generateOptions(DB_CX_LOCK_CHIPS)}
                </select>
            </div>
            <div class="form-group">
                <label for="select-metalblade">CX Metal Blade Foundations</label>
                <select id="select-metalblade">${generateOptions(DB_CX_METAL_BLADES)}</select>
            </div>
            <div class="form-group">
                <label for="select-overblade">CX Over Blade Layer</label>
                <select id="select-overblade">${generateOptions(DB_CX_OVER_BLADES)}</select>
            </div>
            <div class="form-group">
                <label for="select-assistblade">CX Assist Blade</label>
                <select id="select-assistblade">${generateOptions(DB_CX_ASSIST_BLADES)}</select>
            </div>
        `;
    }

    const corePartsGroup = document.createElement("div");
    corePartsGroup.innerHTML = `
        <div class="form-group" style="margin-top:15px;">
            <label for="select-ratchet-type">Ratchet Mode / Type</label>
            <select id="select-ratchet-type" onchange="toggleBitHybridSelectors(this.value)">
                <option value="SEPARATE">Standard Split (Ratchet + Bit)</option>
                <option value="HYBRID">CX Fusion (Ratchet Integrated Bit)</option>
            </select>
        </div>
        <div id="ratchet-bit-interactive-row">
            <div class="form-group">
                <label for="select-ratchet">Ratchet Base</label>
                <select id="select-ratchet">${generateOptions(DB_RATCHETS)}</select>
            </div>
            <div class="form-group">
                <label for="select-bit">Performance Bit</label>
                <select id="select-bit">${generateOptions(DB_BITS, true)}</select>
            </div>
        </div>
    `;
    container.appendChild(corePartsGroup);
}

function toggleBitHybridSelectors(mode) {
    const targetRow = document.getElementById("ratchet-bit-interactive-row");
    if (!targetRow) return;
    if (mode === "HYBRID") {
        targetRow.innerHTML = `
            <div class="form-group">
                <label for="select-hybrid">Ratchet-Integrated Bit Component</label>
                <select id="select-hybrid">${generateOptions(DB_HYBRID_RATCHET_BITS)}</select>
            </div>
        `;
    } else {
        targetRow.innerHTML = `
            <div class="form-group">
                <label for="select-ratchet">Ratchet Base</label>
                <select id="select-ratchet">${generateOptions(DB_RATCHETS)}</select>
            </div>
            <div class="form-group">
                <label for="select-bit">Performance Bit</label>
                <select id="select-bit">${generateOptions(DB_BITS, true)}</select>
            </div>
        `;
    }
}

function generateOptions(array, splitShorthand = false) {
    return array.map(item => {
        let value = splitShorthand ? item.split(' ')[0] : item;
        return `<option value="${value}">${item}</option>`;
    }).join('');
}

function openPartsModal(playerNum) {
    activeModalPlayer = playerNum;
    let currentName = document.getElementById(`p${playerNum}-name`).value;
    document.getElementById('modal-player-title').innerText = `${currentName}'s Combo`;
    
    document.getElementById('backdrop-layer').classList.add('active');
    document.getElementById('parts-modal').classList.add('active');
}

function closePartsModal() {
    document.getElementById('backdrop-layer').classList.remove('active');
    document.getElementById('parts-modal').classList.remove('active');
    activeModalPlayer = null;
}

function savePartsSelection() {
    if(!activeModalPlayer) return;
    
    const system = document.getElementById("select-system").value;
    let isCleared = false;
    let bladeString = "";
    
    if (system === "STANDARD") {
        let val = document.getElementById("select-blade").value;
        if(val === "CLEAR") isCleared = true;
        else bladeString = val;
    } else if (system === "CX_STANDARD" || system === "CX_EXPAND") {
        let chipVal = document.getElementById("select-lockchip").value;
        if(chipVal === "CLEAR") {
            isCleared = true;
        } else {
            if (system === "CX_STANDARD") {
                let main = document.getElementById("select-mainblade").value;
                let assist = document.getElementById("select-assistblade").value;
                bladeString = `${chipVal}${main}${assist.charAt(0)}`;
            } else {
                let metal = document.getElementById("select-metalblade").value;
                let over = document.getElementById("select-overblade").value;
                let assist = document.getElementById("select-assistblade").value;
                bladeString = `${chipVal}${metal}${over.charAt(0)}${assist.charAt(0)}`;
            }
        }
    }

    let displayBadge = document.getElementById(`p${activeModalPlayer}-combo`);

    if (isCleared) {
        displayBadge.innerText = "+ Select Combo";
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
        displayBadge.innerText = `${bladeString} ${coreString}`.trim();
    }
    
    closePartsModal();
}