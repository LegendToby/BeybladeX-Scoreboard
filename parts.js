// Database arrays of components
const BLADES = [
    "Cobalt Drake", "Dran Buster", "Dran Dagger", "Dran Sword", 
    "Hells Chain", "Hells Hammer", "Hells Scythe", "Leon Claw", 
    "Leon Crest", "Phoenix Rudder", "Phoenix Wing", "Rhino Horn", 
    "Shark Edge", "Shinobi Shadow", "Sphinx Cowl", "Tyranno Beat", 
    "Viper Tail", "Weiss Tiger", "Wizard Arrow", "Wizard Rod"
];

const RATCHETS = [
    "1-60", "2-60", "3-60", "3-70", "3-80", "4-60", 
    "4-70", "4-80", "5-60", "5-75", "5-80", "7-60", "9-60"
];

const BITS = [
    "A (Accel)", "B (Ball)", "BB (Bite Ball)", "D (Disc)", "F (Flat)", 
    "GB (Gear Ball)", "GF (Gear Flat)", "GN (Gear Needle)", "HN (High Needle)", 
    "HT (High Taper)", "LF (Low Flat)", "N (Needle)", "O (Orb)", 
    "P (Point)", "R (Rush)", "T (Taper)", "Q (Quake)"
];

// Populate selection items directly inside DOM structure upon initiation
document.addEventListener("DOMContentLoaded", () => {
    const bladeSelect = document.getElementById('select-blade');
    const ratchetSelect = document.getElementById('select-ratchet');
    const bitSelect = document.getElementById('select-bit');

    BLADES.forEach(b => {
        let opt = document.createElement('option');
        opt.value = b; opt.innerText = b;
        bladeSelect.appendChild(opt);
    });

    RATCHETS.forEach(r => {
        let opt = document.createElement('option');
        opt.value = r; opt.innerText = r;
        ratchetSelect.appendChild(opt);
    });

    BITS.forEach(bitString => {
        let shorthand = bitString.split(' ')[0];
        let opt = document.createElement('option');
        opt.value = shorthand; opt.innerText = bitString;
        bitSelect.appendChild(opt);
    });

    // Prevent zoom interactions on mobile screens
    document.querySelectorAll('select, input').forEach(elem => {
        elem.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: true});
        elem.addEventListener('click', (e) => e.stopPropagation());
    });
});

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
    let blade = document.getElementById('select-blade').value;
    let ratchet = document.getElementById('select-ratchet').value;
    let bit = document.getElementById('select-bit').value;
    
    let displayBadge = document.getElementById(`p${activeModalPlayer}-combo`);
    
    if (blade === "Custom") {
        displayBadge.innerText = "+ Select Combo";
    } else {
        displayBadge.innerText = `${blade} ${ratchet}${bit}`.trim();
    }
    closePartsModal();
}