let p1Score = 0, p2Score = 0, p1Sets = 0, p2Sets = 0;
let p1ActiveSlot = 0, p2ActiveSlot = 0;
let p1Fouls = 0, p2Fouls = 0; 
let winLimit = 4, setsWinLimit = 2;  
let scoreHistory = [];
let matchIsOver = false;
let midRoundTimeoutToken = null;
let countdownTimelineTokens = []; 
let activeAudioTracks = [];
let lineupsAreLocked = false;

function unlockAudioEngine() { new Audio().play().catch(e => {}); window.removeEventListener('mousedown', unlockAudioEngine); window.removeEventListener('touchstart', unlockAudioEngine); }
window.addEventListener('mousedown', unlockAudioEngine); window.addEventListener('touchstart', unlockAudioEngine);

function playCustomSound(fileName) {
    if (fileName === 'foul') return; 
    try {
        let track = new Audio(fileName + '.mp3?v=' + new Date().getTime()); activeAudioTracks.push(track);
        track.play().catch(e => {});
        track.onended = () => activeAudioTracks = activeAudioTracks.filter(t => t !== track);
    } catch(e) {}
}
function stopAllAudio() { activeAudioTracks.forEach(t => { try { t.pause(); t.currentTime = 0; } catch(e){} }); activeAudioTracks = []; }
function openInstructionDialog(title, message) { document.getElementById("dialog-title").innerText = title; document.getElementById("dialog-message").innerHTML = message; document.getElementById("instruction-dialog").classList.add("active"); }
function closeInstructionDialog() { document.getElementById("instruction-dialog").classList.remove("active"); }

function swapSides() {
    if (midRoundTimeoutToken || lineupsAreLocked) return;
    let tName = document.getElementById("p1-name").value, tScore = p1Score, tSets = p1Sets, tSlot = p1ActiveSlot, tFouls = p1Fouls, tDeck = [...playerDecks[1]];
    document.getElementById("p1-name").value = document.getElementById("p2-name").value;
    p1Score = p2Score; p1Sets = p2Sets; p1ActiveSlot = p2ActiveSlot; p1Fouls = p2Fouls; playerDecks[1] = [...playerDecks[2]];
    document.getElementById("p2-name").value = tName;
    p2Score = tScore; p2Sets = tSets; p2ActiveSlot = tSlot; p2Fouls = tFouls; playerDecks[2] = tDeck;
    updateUI(); renderDeckDisplay(1); renderDeckDisplay(2); updateActiveSlotHighlight(1, p1ActiveSlot); updateActiveSlotHighlight(2, p2ActiveSlot);
    document.getElementById("p1-foul-badge").innerText = p1Fouls > 0 ? `⚠️ (Fouls: 1/2)` : ""; document.getElementById("p2-foul-badge").innerText = p2Fouls > 0 ? `⚠️ (Fouls: 1/2)` : "";
    updateLogDisplay("🔄 Bladers manually swapped arena sides."); saveMatchToCache();
}

function adjustLimit(v, amt, min, max, disp) {
    if(matchIsOver || scoreHistory.length > 0 || lineupsAreLocked) return;
    let n = window[v] + amt; if (n >= min && n <= max) { window[v] = n; document.getElementById(disp).innerText = n; resetGame(); }
}
function startCountdown() { if(matchIsOver) return; countdownTimelineTokens.forEach(clearTimeout); countdownTimelineTokens = []; playCustomSound('countdown'); const backdrop = document.getElementById('backdrop-layer'); backdrop.classList.add('active'); countdownTimelineTokens.push(setTimeout(() => backdrop.classList.remove('active'), 4600)); }

function recordFoul(playerNum) {
    if (matchIsOver || midRoundTimeoutToken) return;
    let p1Name = document.getElementById('p1-name').value, p2Name = document.getElementById('p2-name').value, offenderName = playerNum === 1 ? p1Name : p2Name;
    scoreHistory.push({ p1Score, p2Score, p1Sets, p2Sets, p1ActiveSlot, p2ActiveSlot, p1Fouls, p2Fouls, logText: `${offenderName} - Foul Alert!` });
    if (playerNum === 1) {
        p1Fouls++;
        if (p1Fouls === 1) { document.getElementById("p1-foul-badge").innerText = `⚠️ (Fouls: 1/2)`; triggerMiddleAnnouncement('foul'); updateLogDisplay(`⚠️ Caution: ${p1Name} issued a Launch Foul warning.`); }
        else { updateLogDisplay(`🚨 Penalty: ${p1Name} consecutive Launch Fault. Point awarded to ${p2Name}.`); executeScoreSequence(2, 1, 'Penalty Foul'); }
    } else {
        p2Fouls++;
        if (p2Fouls === 1) { document.getElementById("p2-foul-badge").innerText = `⚠️ (Fouls: 1/2)`; triggerMiddleAnnouncement('foul'); updateLogDisplay(`⚠️ Caution: ${p2Name} issued a Launch Foul warning.`); }
        else { updateLogDisplay(`🚨 Penalty: ${p2Name} consecutive Launch Fault. Point awarded to ${p1Name}.`); executeScoreSequence(1, 1, 'Penalty Foul'); }
    }
}

function addScore(player, points, finishType) {
    if (matchIsOver || midRoundTimeoutToken) return;
    let scorerName = player === 1 ? document.getElementById('p1-name').value : document.getElementById('p2-name').value;
    let logDescription = `${scorerName} scored +${points} [${finishType.charAt(0).toUpperCase() + finishType.slice(1)}]`;
    scoreHistory.push({ p1Score, p2Score, p1Sets, p2Sets, p1ActiveSlot, p2ActiveSlot, p1Fouls, p2Fouls, logText: logDescription });
    executeScoreSequence(player, points, finishType);
}

function triggerNeonCardFlash(playerNum) { const cardElement = document.getElementById(`player-card-${playerNum}`), pulseClass = playerNum === 1 ? 'pulse-p1' : 'pulse-p2'; if (cardElement) { cardElement.classList.remove(pulseClass); void cardElement.offsetWidth; cardElement.classList.add(pulseClass); } }

function executeScoreSequence(player, points, finishType) {
    let p1Name = document.getElementById('p1-name').value, p2Name = document.getElementById('p2-name').value; p1Fouls = p2Fouls = 0; document.getElementById("p1-foul-badge").innerText = document.getElementById("p2-foul-badge").innerText = "";
    if (player === 1) { p1Score += points; triggerPopAnimation(document.getElementById('p1-display')); triggerNeonCardFlash(1); if (p1Score >= winLimit) { p1Sets += 1; scoreHistory[scoreHistory.length - 1].logText += ` ⭐ Set ${p1Name}`; if (p1Sets >= setsWinLimit) matchIsOver = true; } }
    else { p2Score += points; triggerPopAnimation(document.getElementById('p2-display')); triggerNeonCardFlash(2); if (p2Score >= winLimit) { p2Sets += 1; scoreHistory[scoreHistory.length - 1].logText += ` ⭐ Set ${p2Name}`; if (p2Sets >= setsWinLimit) matchIsOver = true; } }
    
    if (p1Score >= winLimit || p2Score >= winLimit) {
        let currentWinner = p1Score >= winLimit ? p1Name : p2Name; p1ActiveSlot = p2ActiveSlot = 0; updateActiveSlotHighlight(1, 0); updateActiveSlotHighlight(2, 0); if (lineupsAreLocked) toggleLineupLock();
        
        triggerMiddleAnnouncement(finishType, () => {
            triggerSetCompleteAnnouncement(currentWinner);
        });
        if (!matchIsOver) setTimeout(() => openInstructionDialog("Set Complete", "Set finished! Current scores reset back to 0-0 and deck line slots returned to <b>Slot 1</b>."), 5600);
    } else { p1ActiveSlot = (p1ActiveSlot + 1) % 3; p2ActiveSlot = (p2ActiveSlot + 1) % 3; updateActiveSlotHighlight(1, p1ActiveSlot); updateActiveSlotHighlight(2, p2ActiveSlot); if (lineupsAreLocked) calculateMatchupProbabilityMatrix(); triggerMiddleAnnouncement(finishType); }
    updateUI(); if(finishType !== 'Penalty Foul') updateLogDisplay(scoreHistory[scoreHistory.length - 1].logText);
    if (matchIsOver) { document.getElementById("backdrop-layer").classList.add("active"); document.getElementById("arena-reset-btn").classList.add("highlight-end"); }
}

function toggleLineupLock() {
    if (matchIsOver) return; lineupsAreLocked = !lineupsAreLocked;
    const lockBtn = document.getElementById("lock-lineup-btn"), matrixPanel = document.getElementById("predictive-overlay-panel");
    lockBtn.innerText = lineupsAreLocked ? "🔓 UNLOCK LINEUPS" : "🔒 LOCK LINEUPS"; lockBtn.classList.toggle("active-locked", lineupsAreLocked);
    document.getElementById("player-card-1").classList.toggle("lineup-locked", lineupsAreLocked); document.getElementById("player-card-2").classList.toggle("lineup-locked", lineupsAreLocked);
    matrixPanel.classList.toggle("hidden", !lineupsAreLocked); if (lineupsAreLocked) calculateMatchupProbabilityMatrix(); else updateLogDisplay("🔓 Lineups unlocked.");
}

function calculateMatchupProbabilityMatrix() {
    let types = [1, 2].map(p => {
        let c = playerDecks[p][p === 1 ? p1ActiveSlot : p2ActiveSlot].toLowerCase();
        if (c.includes("flat") || c.includes("accel") || c.includes("rush") || c.includes("taper") || c.includes("quake") || c.includes("attack") || c.includes("buster") || c.includes("sword") || c.includes("edge") || c.includes("dagger") || c.includes("strike") || c.includes("pegasus")) return "attack";
        if (c.includes("shield") || c.includes("defense") || c.includes("crest") || c.includes("cowl") || c.includes("curse") || c.includes("shadow") || c.includes("hexa") || c.includes("elevate") || c.includes("lance") || c.includes("shell")) return "defense";
        if (c.includes("ball") || c.includes("needle") || c.includes("orb") || c.includes("stamina") || c.includes("rod") || c.includes("arrow") || c.includes("gale") || c.includes("wolf") || c.includes("glide")) return "stamina";
        return "balance";
    });
    let p1Prob = 50, p2Prob = 50, analysisText = "Even matchup matrix. Pure launch velocity vector determines edge.";
    let matrix = { attack: { stamina: 65, defense: 40 }, stamina: { defense: 62, attack: 35 }, defense: { attack: 60, stamina: 38 } };
    if (types[0] !== types[1] && matrix[types[0]] && matrix[types[0]][types[1]]) { p1Prob = matrix[types[0]][types[1]]; p2Prob = 100 - p1Prob; analysisText = `${types[0].toUpperCase()} vector holds systemic edge over ${types[1].toUpperCase()}.`; }
    if (p1Sets !== p2Sets) { p1Prob += (p1Sets > p2Sets ? 3 : -3); p2Prob += (p2Sets > p1Sets ? 3 : -3); }
    p1Prob = Math.max(15, Math.min(85, p1Prob)); p2Prob = Math.max(15, Math.min(85, p2Prob));
    document.getElementById("p1-prob-display").innerText = p1Prob + "%"; document.getElementById("p2-prob-display").innerText = p2Prob + "%";
    document.getElementById("matrix-tactical-tip").innerText = `🎯 Analysis: ${analysisText}`;
    updateLogDisplay(`🔮 Predictive Matrix Evaluated: P1 (${types[0].toUpperCase()}: ${p1Prob}%) vs P2 (${types[1].toUpperCase()}: ${p2Prob}%)`);
}

function updateUI() { document.getElementById('p1-display').innerText = p1Score; document.getElementById('p2-display').innerText = p2Score; document.getElementById('p1-sets').innerText = p1Sets; document.getElementById('p2-sets').innerText = p2Sets; saveMatchToCache(); }
function updateActiveSlotHighlight(playerNum, slotIndex) { for (let i = 0; i < 3; i++) { let slot = document.getElementById(`p${playerNum}-slot-${i}`); if (slot) slot.removeAttribute('data-active'); } let activeSlot = document.getElementById(`p${playerNum}-slot-${slotIndex}`); if (activeSlot) activeSlot.setAttribute('data-active', 'true'); }

function updateLogDisplay(text) {
    const logContainer = document.getElementById('history-log'); if (!logContainer) return;
    const emptyMsg = document.getElementById('empty-log-msg'); if (emptyMsg) emptyMsg.remove();
    let logRow = document.createElement('div'); logRow.style.padding = '3px 0'; logRow.style.color = (/[⭐🚨🔄🔮]/.test(text)) ? (text.includes('🔮') ? 'var(--accent-gold)' : '#ff4757') : '#ffffff';
    logRow.innerHTML = `<span style="color:#ffcc00;">[R${scoreHistory.length}]</span> ${text} <span style="float:right; color:#848e9c;">(P:${p1Score}-${p2Score})</span>`; logContainer.appendChild(logRow); logContainer.scrollTop = logContainer.scrollHeight;
}

function undoLast() {
    if(midRoundTimeoutToken) { clearTimeout(midRoundTimeoutToken); midRoundTimeoutToken = null; }
    countdownTimelineTokens.forEach(clearTimeout); matchIsOver = false; stopAllAudio(); document.getElementById("arena-reset-btn").classList.remove("highlight-end"); document.getElementById('backdrop-layer').classList.remove('active'); document.getElementById('announcement-layer').className = ''; document.getElementById('announcement-layer').innerHTML = ''; document.body.classList.remove('shake-active');
    if (scoreHistory.length > 0) {
        let lastState = scoreHistory.pop(); p1Score = lastState.p1Score; p2Score = lastState.p2Score; p1Sets = lastState.p1Sets; p2Sets = lastState.p2Sets; p1ActiveSlot = lastState.p1ActiveSlot; p2ActiveSlot = lastState.p2ActiveSlot; p1Fouls = lastState.p1Fouls || 0; p2Fouls = lastState.p2Fouls || 0;
        updateActiveSlotHighlight(1, p1ActiveSlot); updateActiveSlotHighlight(2, p2ActiveSlot); document.getElementById("p1-foul-badge").innerText = p1Fouls > 0 ? `⚠️ (Fouls: 1/2)` : ""; document.getElementById("p2-foul-badge").innerText = p2Fouls > 0 ? `⚠️ (Fouls: 1/2)` : "";
        const logContainer = document.getElementById('history-log'); logContainer.innerHTML = '';
        if (scoreHistory.length === 0) logContainer.innerHTML = `<div id="empty-log-msg">Waiting for match launch sequence. Let 'er rip!</div>`;
        else scoreHistory.forEach(s => { let r = document.createElement('div'); r.style.padding = '3px 0'; r.innerHTML = s.logText; logContainer.appendChild(r); });
        updateUI(); if (lineupsAreLocked) calculateMatchupProbabilityMatrix(); saveMatchToCache();
    }
}

function triggerMiddleAnnouncement(type, chainCallback) {
    if (midRoundTimeoutToken) clearTimeout(midRoundTimeoutToken);
    const backdrop = document.getElementById('backdrop-layer'), el = document.getElementById('announcement-layer'); backdrop.classList.add('active');
    let isFoul = type === 'foul' || type === 'Penalty Foul'; el.innerText = isFoul ? "LAUNCH FOUL!" : (type.toUpperCase() + " FINISH!"); el.className = 'run-anim-long txt-' + (isFoul ? 'foul' : type);
    if (type === 'burst' || type === 'xtreme' || isFoul) { document.body.classList.remove('shake-active'); void document.body.offsetWidth; document.body.classList.add('shake-active'); }
    playCustomSound(isFoul ? 'foul' : type);
    
    midRoundTimeoutToken = setTimeout(() => { 
        document.body.classList.remove('shake-active'); 
        el.className = ''; el.innerHTML = ''; 
        if (chainCallback) {
            midRoundTimeoutToken = null;
            setTimeout(chainCallback, 50); 
        } else {
            backdrop.classList.remove('active');
            midRoundTimeoutToken = null;
        }
    }, 2200);
}

function triggerSetCompleteAnnouncement(setWinner) {
    if (midRoundTimeoutToken) clearTimeout(midRoundTimeoutToken);
    const backdrop = document.getElementById('backdrop-layer'), el = document.getElementById('announcement-layer'); 
    backdrop.classList.add('active');
    el.innerHTML = `SET COMPLETE!<span class="sub-set">${setWinner} wins set!</span>`; el.className = 'run-anim-long txt-set-complete'; playCustomSound('victory');
    
    midRoundTimeoutToken = setTimeout(() => {
        el.className = ''; el.innerHTML = '';
        if (matchIsOver) {
            midRoundTimeoutToken = null;
            setTimeout(() => triggerWinnerDisplay(setWinner), 50); 
        } else { 
            backdrop.classList.remove('active');
            p1Score = p2Score = 0; 
            midRoundTimeoutToken = null;
            updateUI(); 
        }
    }, 3200);
}

function triggerWinnerDisplay(winnerName) { 
    if (midRoundTimeoutToken) clearTimeout(midRoundTimeoutToken);
    const backdrop = document.getElementById('backdrop-layer'), el = document.getElementById('announcement-layer'); 
    
    backdrop.classList.add('active'); 
    el.innerHTML = `MATCH OVER!<span class="sub-victory">${winnerName} Wins Match!</span>`; el.className = 'txt-victory'; playCustomSound('victory'); 
    
    midRoundTimeoutToken = setTimeout(() => {
        backdrop.classList.remove('active');
        el.className = '';
        el.innerHTML = '';
        midRoundTimeoutToken = null;
    }, 2000);
}

function triggerPopAnimation(element) { element.classList.remove('pop'); void element.offsetWidth; element.classList.add('pop'); }

function resetGame() {
    matchIsOver = false; document.getElementById("arena-reset-btn").classList.remove("highlight-end"); stopAllAudio(); p1Score = p2Score = p1Sets = p2Sets = p1ActiveSlot = p2ActiveSlot = p1Fouls = p2Fouls = 0; scoreHistory = []; if (lineupsAreLocked) toggleLineupLock();
    countdownTimelineTokens.forEach(clearTimeout); countdownTimelineTokens = []; updateUI(); updateActiveSlotHighlight(1, 0); updateActiveSlotHighlight(2, 0); document.getElementById("p1-foul-badge").innerText = ""; document.getElementById("p2-foul-badge").innerText = ""; document.body.classList.remove('shake-active'); document.getElementById('backdrop-layer').classList.remove('active'); document.getElementById('announcement-layer').className = ''; document.getElementById('announcement-layer').innerHTML = ''; document.getElementById('history-log').innerHTML = `<div id="empty-log-msg">Waiting for match launch sequence. Let 'er rip!</div>`;
    if (typeof playerDecks !== 'undefined') { playerDecks[1] = ["+ Select Bey 1", "+ Select Bey 2", "+ Select Bey 3"]; playerDecks[2] = ["+ Select Bey 1", "+ Select Bey 2", "+ Select Bey 3"]; renderDeckDisplay(1); renderDeckDisplay(2); }
    localStorage.removeItem('beyx_scoreboard_cache');
}

function toggleFullscreen() { const btn = document.getElementById('fullscreen-btn'); if (!btn) return; if (!document.fullscreenElement) document.documentElement.requestFullscreen().then(() => { btn.innerHTML = "🗗"; btn.style.background = "#ff4757"; }).catch(e => {}); else { document.exitFullscreen(); btn.innerHTML = "⛶"; btn.style.background = "#2f3542"; } }
document.addEventListener('fullscreenchange', () => { const btn = document.getElementById('fullscreen-btn'); if (btn && !document.fullscreenElement) { btn.innerHTML = "⛶"; btn.style.background = "#2f3542"; } });

function runTacticalMatchReview() {
    const mode = document.getElementById("review-strategy-mode").value; if (mode === "NONE") return;
    const p1Combo = playerDecks[1][p1ActiveSlot].toLowerCase(), p2Combo = playerDecks[2][p2ActiveSlot].toLowerCase(), p1Name = document.getElementById("p1-name").value, p2Name = document.getElementById("p2-name").value; let reviewOutput = "";
    const isAttack = c => c.includes("flat") || c.includes("accel") || c.includes("rush") || c.includes("sword") || c.includes("buster");
    const isStamina = c => c.includes("ball") || c.includes("needle") || c.includes("orb") || c.includes("rod") || c.includes("arrow");
    const isDefense = c => c.includes("shield") || c.includes("crest") || c.includes("cowl") || c.includes("shadow") || c.includes("hexa");

    if (mode === "COUNTER") {
        reviewOutput = "🤔 <b>Counter-Pick Analysis:</b> ";
        if (isStamina(p1Combo) && isStamina(p2Combo)) reviewOutput += "Mirror Stamina match. High risk of tie-outs. Consider swapping to a smash-attack option to break the shield threshold next rotation.";
        else if (isAttack(p1Combo) && isStamina(p2Combo)) reviewOutput += `RPS Advantage to ${p1Name}. Attack angles can bypass ${p2Name}'s stamina curve.`;
        else if (isStamina(p1Combo) && isAttack(p2Combo)) reviewOutput += `RPS Advantage to ${p2Name}. Attack speeds endanger ${p1Name}'s stamina reserves.`;
        else reviewOutput += "Balanced layers active. Target the next slot selection to match height differences.";
    } else if (mode === "LAUNCH") {
        reviewOutput = "🚀 <b>Launch Dynamics:</b> ";
        if (isAttack(p1Combo) || isAttack(p2Combo)) reviewOutput += "High velocity lines active. Use an extreme tilt launch to trace the outer rail lines early.";
        else reviewOutput += "Endurance lines active. Launch flat into the tier center pocket to protect your spinning base.";
    } else if (mode === "HARDWARE") {
        reviewOutput = "📐 <b>Hardware & Height Calibration:</b> ";
        let h1 = p1Combo.includes("80") || p1Combo.includes("70") ? "High" : "Low", h2 = p2Combo.includes("80") || p2Combo.includes("70") ? "High" : "Low";
        if (h1 !== h2) reviewOutput += "Height disparity active. The lower profile combo can snipe underneath the taller ratchet lines.";
        else reviewOutput += "Equal height settings. Total center friction boundaries will completely depend on bit recoil resistance.";
    }
    if (reviewOutput) { updateLogDisplay(reviewOutput); saveMatchToCache(); } document.getElementById("review-strategy-mode").value = "NONE";
}

function saveMatchToCache() { localStorage.setItem('beyx_scoreboard_cache', JSON.stringify({ p1Score, p2Score, p1Sets, p2Sets, p1ActiveSlot, p2ActiveSlot, p1Fouls, p2Fouls, winLimit, setsWinLimit, matchIsOver, lineupsAreLocked, scoreHistory, playerDecks: typeof playerDecks !== 'undefined' ? playerDecks : null, p1Name: document.getElementById('p1-name').value, p2Name: document.getElementById('p2-name').value, logHTML: document.getElementById('history-log').innerHTML })); }
function loadMatchFromCache() { const cachedData = localStorage.getItem('beyx_scoreboard_cache'); if (!cachedData) return; try { const state = JSON.parse(cachedData); p1Score = state.p1Score; p2Score = state.p2Score; p1Sets = state.p1Sets; p2Sets = state.p2Sets; p1ActiveSlot = state.p1ActiveSlot; p2ActiveSlot = state.p2ActiveSlot; p1Fouls = state.p1Fouls; p2Fouls = state.p2Fouls; winLimit = state.winLimit; setsWinLimit = state.setsWinLimit; matchIsOver = state.matchIsOver; scoreHistory = state.scoreHistory || []; if (state.playerDecks) playerDecks = state.playerDecks; document.getElementById('p1-name').value = state.p1Name || "Player 1"; document.getElementById('p2-name').value = state.p2Name || "Player 2"; document.getElementById('limit-display').innerText = winLimit; document.getElementById('sets-limit-display').innerText = setsWinLimit; document.getElementById("p1-foul-badge").innerText = p1Fouls > 0 ? `⚠️ (Fouls: 1/2)` : ""; document.getElementById("p2-foul-badge").innerText = p2Fouls > 0 ? `⚠️ (Fouls: 1/2)` : ""; updateUI(); if (typeof renderDeckDisplay === 'function') { renderDeckDisplay(1); renderDeckDisplay(2); } updateActiveSlotHighlight(1, p1ActiveSlot); updateActiveSlotHighlight(2, p2ActiveSlot); if (state.logHTML) document.getElementById('history-log').innerHTML = state.logHTML; if (state.lineupsAreLocked) { lineupsAreLocked = false; toggleLineupLock(); } if (matchIsOver) { document.getElementById("backdrop-layer").classList.add("active"); document.getElementById("arena-reset-btn").classList.add("highlight-end"); } } catch (e) {} }

document.getElementById('p1-name').addEventListener('input', saveMatchToCache); document.getElementById('p2-name').addEventListener('input', saveMatchToCache); window.addEventListener('DOMContentLoaded', loadMatchFromCache);
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js'); }); }
updateActiveSlotHighlight(1, 0); updateActiveSlotHighlight(2, 0);