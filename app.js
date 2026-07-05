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

function unlockAudioEngine() {
    let contextUnlock = new Audio();
    contextUnlock.play().catch(e => {});
    window.removeEventListener('mousedown', unlockAudioEngine);
    window.removeEventListener('touchstart', unlockAudioEngine);
}
window.addEventListener('mousedown', unlockAudioEngine);
window.addEventListener('touchstart', unlockAudioEngine);

function playCustomSound(fileName) {
    if (fileName === 'foul') return; 
    
    try {
        let cacheBuster = "?v=" + new Date().getTime();
        let track = new Audio(fileName + '.mp3' + cacheBuster);
        activeAudioTracks.push(track);
        track.play().catch(e => console.log("Audio contextual tracking active..."));
        track.onended = () => activeAudioTracks = activeAudioTracks.filter(t => t !== track);
    } catch(e) { console.log("Audio dropped track handling:", e); }
}

function stopAllAudio() {
    activeAudioTracks.forEach(track => { try { track.pause(); track.currentTime = 0; } catch(e){} });
    activeAudioTracks = [];
}

function openInstructionDialog(title, message) {
    document.getElementById("dialog-title").innerText = title;
    document.getElementById("dialog-message").innerHTML = message;
    document.getElementById("instruction-dialog").classList.add("active");
}

function closeInstructionDialog() {
    document.getElementById("instruction-dialog").classList.remove("active");
}

function swapSides() {
    if (midRoundTimeoutToken || lineupsAreLocked) return;

    let tName = document.getElementById("p1-name").value;
    let tScore = p1Score;
    let tSets = p1Sets;
    let tSlot = p1ActiveSlot;
    let tFouls = p1Fouls;
    let tDeck = [...playerDecks[1]];

    document.getElementById("p1-name").value = document.getElementById("p2-name").value;
    p1Score = p2Score;
    p1Sets = p2Sets;
    p1ActiveSlot = p2ActiveSlot;
    p1Fouls = p2Fouls;
    playerDecks[1] = [...playerDecks[2]];

    document.getElementById("p2-name").value = tName;
    p2Score = tScore;
    p2Sets = tSets;
    p2ActiveSlot = tSlot;
    p2Fouls = tFouls;
    playerDecks[2] = tDeck;

    updateUI();
    renderDeckDisplay(1);
    renderDeckDisplay(2);
    updateActiveSlotHighlight(1, p1ActiveSlot);
    updateActiveSlotHighlight(2, p2ActiveSlot);

    document.getElementById("p1-foul-badge").innerText = p1Fouls > 0 ? `⚠️ (Fouls: 1/2)` : "";
    document.getElementById("p2-foul-badge").innerText = p2Fouls > 0 ? `⚠️ (Fouls: 1/2)` : "";

    updateLogDisplay("🔄 Bladers manually swapped arena sides.");
}

function adjustPointsLimit(amount) {
    if(matchIsOver || scoreHistory.length > 0 || lineupsAreLocked) return; 
    let newLimit = winLimit + amount;
    if (newLimit >= 1 && newLimit <= 10) { 
        winLimit = newLimit;
        document.getElementById('limit-display').innerText = winLimit;
        resetGame();
    }
}

function adjustSetsLimit(amount) {
    if(matchIsOver || scoreHistory.length > 0 || lineupsAreLocked) return;
    let newLimit = setsWinLimit + amount;
    if (newLimit >= 1 && newLimit <= 5) {
        setsWinLimit = newLimit;
        document.getElementById('sets-limit-display').innerText = setsWinLimit;
        resetGame();
    }
}

function startCountdown() {
    if(matchIsOver) return;
    
    countdownTimelineTokens.forEach(token => clearTimeout(token));
    countdownTimelineTokens = [];
    
    playCustomSound('countdown');
    
    const backdrop = document.getElementById('backdrop-layer');
    backdrop.classList.add('active');

    countdownTimelineTokens.push(setTimeout(() => {
        backdrop.classList.remove('active');
    }, 4600));
}

function recordFoul(playerNum) {
    if (matchIsOver || midRoundTimeoutToken) return;

    let p1Name = document.getElementById('p1-name').value;
    let p2Name = document.getElementById('p2-name').value;
    let offenderName = playerNum === 1 ? p1Name : p2Name;
    
    scoreHistory.push({
        p1Score: p1Score, p2Score: p2Score,
        p1Sets: p1Sets, p2Sets: p2Sets,
        p1ActiveSlot: p1ActiveSlot, p2ActiveSlot: p2ActiveSlot,
        p1Fouls: p1Fouls, p2Fouls: p2Fouls,
        logText: `${offenderName} - Foul Alert!`
    });

    if (playerNum === 1) {
        p1Fouls++;
        if (p1Fouls === 1) {
            document.getElementById("p1-foul-badge").innerText = `⚠️ (Fouls: 1/2)`;
            triggerMiddleAnnouncement('foul');
            updateLogDisplay(`⚠️ Caution: ${p1Name} issued a Launch Foul warning.`);
        } else {
            updateLogDisplay(`🚨 Penalty: ${p1Name} consecutive Launch Fault. Point awarded to ${p2Name}.`);
            executeScoreSequence(2, 1, 'Penalty Foul');
        }
    } else {
        p2Fouls++;
        if (p2Fouls === 1) {
            document.getElementById("p2-foul-badge").innerText = `⚠️ (Fouls: 1/2)`;
            triggerMiddleAnnouncement('foul');
            updateLogDisplay(`⚠️ Caution: ${p2Name} issued a Launch Foul warning.`);
        } else {
            updateLogDisplay(`🚨 Penalty: ${p2Name} consecutive Launch Fault. Point awarded to ${p1Name}.`);
            executeScoreSequence(1, 1, 'Penalty Foul');
        }
    }
}

function addScore(player, points, finishType) {
    if (matchIsOver || midRoundTimeoutToken) return; 

    let p1Name = document.getElementById('p1-name').value;
    let p2Name = document.getElementById('p2-name').value;
    let formattedFinish = finishType.charAt(0).toUpperCase() + finishType.slice(1);
    let scorerName = player === 1 ? p1Name : p2Name;
    let logDescription = `${scorerName} scored +${points} [${formattedFinish}]`;

    scoreHistory.push({
        p1Score: p1Score, p2Score: p2Score,
        p1Sets: p1Sets, p2Sets: p2Sets,
        p1ActiveSlot: p1ActiveSlot, p2ActiveSlot: p2ActiveSlot,
        p1Fouls: p1Fouls, p2Fouls: p2Fouls,
        logText: logDescription
    });

    executeScoreSequence(player, points, finishType);
}

function triggerNeonCardFlash(playerNum) {
    const cardElement = document.getElementById(`player-card-${playerNum}`);
    const pulseClass = playerNum === 1 ? 'pulse-p1' : 'pulse-p2';
    
    if (cardElement) {
        cardElement.classList.remove(pulseClass);
        void cardElement.offsetWidth; 
        cardElement.classList.add(pulseClass);
    }
}

function executeScoreSequence(player, points, finishType) {
    let p1Name = document.getElementById('p1-name').value;
    let p2Name = document.getElementById('p2-name').value;
    let displayElement = document.getElementById(player === 1 ? 'p1-display' : 'p2-display');
    let logDescription = scoreHistory[scoreHistory.length - 1].logText;

    p1Fouls = 0;
    p2Fouls = 0;
    document.getElementById("p1-foul-badge").innerText = "";
    document.getElementById("p2-foul-badge").innerText = "";

    let setAwarded = false, currentWinner = "";

    if (player === 1) {
        p1Score += points;
        triggerPopAnimation(displayElement);
        triggerNeonCardFlash(1);
        if (p1Score >= winLimit) {
            p1Sets += 1; setAwarded = true; currentWinner = p1Name;
            if(!logDescription.includes('⭐')) logDescription += ` ⭐ Set ${p1Name}`;
            scoreHistory[scoreHistory.length - 1].logText = logDescription;
            if (p1Sets >= setsWinLimit) matchIsOver = true; 
        }
    } else {
        p2Score += points;
        triggerPopAnimation(displayElement);
        triggerNeonCardFlash(2);
        if (p2Score >= winLimit) {
            p2Sets += 1; setAwarded = true; currentWinner = p2Name;
            if(!logDescription.includes('⭐')) logDescription += ` ⭐ Set ${p2Name}`;
            scoreHistory[scoreHistory.length - 1].logText = logDescription;
            if (p2Sets >= setsWinLimit) matchIsOver = true; 
        }
    }

    if (setAwarded) {
        p1ActiveSlot = 0;
        p2ActiveSlot = 0;
        updateActiveSlotHighlight(1, 0);
        updateActiveSlotHighlight(2, 0);
        
        if (lineupsAreLocked) toggleLineupLock();

        triggerMiddleAnnouncement(finishType, () => triggerSetCompleteAnnouncement(currentWinner));
        
        if (!matchIsOver) {
            setTimeout(() => {
                openInstructionDialog(
                    "Set Complete", 
                    "Set finished! Current scores have been reset back to 0-0 and deck line slots returned to <b>Slot 1</b>.<br><br>Bladers are now cleared to reorganize deck configurations. If players wish to change stadium layout positions before starting the next set, click the <b>⇄ Swap Sides</b> button."
                );
            }, 5600);
        }
    } else {
        p1ActiveSlot = (p1ActiveSlot + 1) % 3;
        p2ActiveSlot = (p2ActiveSlot + 1) % 3;
        updateActiveSlotHighlight(1, p1ActiveSlot);
        updateActiveSlotHighlight(2, p2ActiveSlot);
        
        if (lineupsAreLocked) calculateMatchupProbabilityMatrix();
        
        triggerMiddleAnnouncement(finishType);
    }

    updateUI();
    if(finishType !== 'Penalty Foul') updateLogDisplay(logDescription);
    
    if (matchIsOver) {
        document.getElementById("backdrop-layer").classList.add("active");
        document.getElementById("arena-reset-btn").classList.add("highlight-end");
    }
}

function toggleLineupLock() {
    if (matchIsOver) return;

    const lockBtn = document.getElementById("lock-lineup-btn");
    const p1Card = document.getElementById("player-card-1");
    const p2Card = document.getElementById("player-card-2");
    const matrixPanel = document.getElementById("predictive-overlay-panel");

    if (!lineupsAreLocked) {
        lineupsAreLocked = true;
        lockBtn.innerText = "🔓 UNLOCK LINEUPS";
        lockBtn.classList.add("active-locked");
        p1Card.classList.add("lineup-locked");
        p2Card.classList.add("lineup-locked");
        matrixPanel.classList.remove("hidden");
        
        calculateMatchupProbabilityMatrix();
    } else {
        lineupsAreLocked = false;
        lockBtn.innerText = "🔒 LOCK LINEUPS";
        lockBtn.classList.remove("active-locked");
        p1Card.classList.remove("lineup-locked");
        p2Card.classList.remove("lineup-locked");
        matrixPanel.classList.add("hidden");
        updateLogDisplay("🔓 Lineups unlocked. Team configurations editable.");
    }
}

function calculateMatchupProbabilityMatrix() {
    const p1Combo = playerDecks[1][p1ActiveSlot].toLowerCase();
    const p2Combo = playerDecks[2][p2ActiveSlot].toLowerCase();

    let p1Type = "balance", p2Type = "balance";

    if (p1Combo.includes("ball") || p1Combo.includes("needle") || p1Combo.includes("orb") || p1Combo.includes("stamina") || p1Combo.includes("rod") || p1Combo.includes("arrow") || p1Combo.includes("gale") || p1Combo.includes("wolf") || p1Combo.includes("glide") || p1Combo.includes("wide needle") || p1Combo.includes("wide ball") || p1Combo.includes("rudder") || p1Combo.includes("scythe") || p1Combo.includes("spear") || p1Combo.includes("mirage")) p1Type = "stamina";
    if (p1Combo.includes("flat") || p1Combo.includes("accel") || p1Combo.includes("rush") || p1Combo.includes("attack") || p1Combo.includes("sword") || p1Combo.includes("buster") || p1Combo.includes("edge") || p1Combo.includes("quake") || p1Combo.includes("taper") || p1Combo.includes("dagger") || p1Combo.includes("strike") || p1Combo.includes("pegasus") || p1Combo.includes("drake")) p1Type = "attack";
    if (p1Combo.includes("shield") || p1Combo.includes("defense") || p1Combo.includes("crest") || p1Combo.includes("cowl") || p1Combo.includes("curse") || p1Combo.includes("shadow") || p1Combo.includes("hexa") || p1Combo.includes("elevate") || p1Combo.includes("lance") || p1Combo.includes("mail") || p1Combo.includes("shell") || p1Combo.includes("press")) p1Type = "defense";

    if (p2Combo.includes("ball") || p2Combo.includes("needle") || p2Combo.includes("orb") || p2Combo.includes("stamina") || p2Combo.includes("rod") || p2Combo.includes("arrow") || p2Combo.includes("gale") || p2Combo.includes("wolf") || p2Combo.includes("glide") || p2Combo.includes("wide needle") || p2Combo.includes("wide ball") || p2Combo.includes("rudder") || p2Combo.includes("scythe") || p2Combo.includes("spear") || p2Combo.includes("mirage")) p2Type = "stamina";
    if (p2Combo.includes("flat") || p2Combo.includes("accel") || p2Combo.includes("rush") || p2Combo.includes("attack") || p2Combo.includes("sword") || p2Combo.includes("buster") || p2Combo.includes("edge") || p2Combo.includes("quake") || p2Combo.includes("taper") || p2Combo.includes("dagger") || p2Combo.includes("strike") || p2Combo.includes("pegasus") || p2Combo.includes("drake")) p2Type = "attack";
    if (p2Combo.includes("shield") || p2Combo.includes("defense") || p2Combo.includes("crest") || p2Combo.includes("cowl") || p2Combo.includes("curse") || p2Combo.includes("shadow") || p2Combo.includes("hexa") || p2Combo.includes("elevate") || p2Combo.includes("lance") || p2Combo.includes("mail") || p2Combo.includes("shell") || p2Combo.includes("press")) p2Type = "defense";

    let p1Prob = 50, p2Prob = 50;
    let analysisText = "Even matchup matrix. Pure launch velocity vector determines edge.";

    if (p1Type !== p2Type) {
        if (p1Type === "attack" && p2Type === "stamina") { p1Prob = 65; p2Prob = 35; analysisText = "Attack vector holds upper hand. High burst threshold expected against stamina curve."; }
        if (p1Type === "stamina" && p2Type === "defense") { p1Prob = 62; p2Prob = 38; analysisText = "Stamina profile out-spins solid defense shell. Out-lasting match predicted."; }
        if (p1Type === "defense" && p2Type === "attack") { p1Prob = 60; p2Prob = 40; analysisText = "Defense core absorbs high speed recoil impacts. Attack velocity deflection likely."; }
        
        if (p2Type === "attack" && p1Type === "stamina") { p2Prob = 65; p1Prob = 35; analysisText = "P2 Attack configuration poses fatal threat to P1 Stamina reserves."; }
        if (p2Type === "stamina" && p1Type === "defense") { p2Prob = 62; p1Prob = 38; analysisText = "P2 Out-spin probability highly elevated against P1 Defense foundations."; }
        if (p2Type === "defense" && p1Type === "attack") { p2Prob = 60; p1Prob = 40; analysisText = "P2 Heavy mass distribution deflects incoming P1 structural attacks."; }
    }

    if (p1Sets > p2Sets) { p1Prob += 3; p2Prob -= 3; }
    if (p2Sets > p1Sets) { p2Prob += 3; p1Prob -= 3; }

    p1Prob = Math.max(15, Math.min(85, p1Prob));
    p2Prob = Math.max(15, Math.min(85, p2Prob));

    document.getElementById("p1-prob-display").innerText = p1Prob + "%";
    document.getElementById("p2-prob-display").innerText = p2Prob + "%";
    document.getElementById("matrix-tactical-tip").innerText = `🎯 Analysis: ${analysisText}`;

    updateLogDisplay(`🔮 Predictive Matrix Evaluated: P1 (${p1Type.toUpperCase()}: ${p1Prob}%) vs P2 (${p2Type.toUpperCase()}: ${p2Prob}%)`);
}

function updateUI() {
    document.getElementById('p1-display').innerText = p1Score;
    document.getElementById('p2-display').innerText = p2Score;
    document.getElementById('p1-sets').innerText = p1Sets;
    document.getElementById('p2-sets').innerText = p2Sets;
}

function updateActiveSlotHighlight(playerNum, slotIndex) {
    for (let i = 0; i < 3; i++) {
        let slot = document.getElementById(`p${playerNum}-slot-${i}`);
        if (slot) slot.removeAttribute('data-active');
    }
    let activeSlot = document.getElementById(`p${playerNum}-slot-${slotIndex}`);
    if (activeSlot) activeSlot.setAttribute('data-active', 'true');
}

function updateLogDisplay(text) {
    const logContainer = document.getElementById('history-log');
    if (!logContainer) return; 
    const emptyMsg = document.getElementById('empty-log-msg');
    if (emptyMsg) emptyMsg.remove();

    let roundNumber = scoreHistory.length;
    let logRow = document.createElement('div');
    logRow.style.padding = '3px 0';
    logRow.style.color = (text.includes('⭐') || text.includes('🚨') || text.includes('🔄') || text.includes('🔮')) ? '#ff4757' : '#ffffff';
    if (text.includes('🔮')) logRow.style.color = 'var(--accent-gold)';
    
    logRow.innerHTML = `<span style="color:#ffcc00;">[R${roundNumber}]</span> ${text} <span style="float:right; color:#848e9c;">(P:${p1Score}-${p2Score})</span>`;
    
    logContainer.appendChild(logRow);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function undoLast() {
    if(midRoundTimeoutToken) { clearTimeout(midRoundTimeoutToken); midRoundTimeoutToken = null; }
    countdownTimelineTokens.forEach(token => clearTimeout(token));

    matchIsOver = false;
    document.getElementById("arena-reset-btn").classList.remove("highlight-end");
    stopAllAudio();
    document.getElementById('backdrop-layer').classList.remove('active');
    document.getElementById('announcement-layer').className = '';
    document.getElementById('announcement-layer').innerHTML = '';
    document.body.classList.remove('shake-active');

    if (scoreHistory.length > 0) {
        let lastState = scoreHistory.pop();
        p1Score = lastState.p1Score;
        p2Score = lastState.p2Score;
        p1Sets = lastState.p1Sets;
        p2Sets = lastState.p2Sets;
        p1ActiveSlot = lastState.p1ActiveSlot;
        p2ActiveSlot = lastState.p2ActiveSlot;
        p1Fouls = lastState.p1Fouls || 0;
        p2Fouls = lastState.p2Fouls || 0;
        
        updateActiveSlotHighlight(1, p1ActiveSlot);
        updateActiveSlotHighlight(2, p2ActiveSlot);

        document.getElementById("p1-foul-badge").innerText = p1Fouls > 0 ? `⚠️ (Fouls: 1/2)` : "";
        document.getElementById("p2-foul-badge").innerText = p2Fouls > 0 ? `⚠️ (Fouls: 1/2)` : "";
        
        const logContainer = document.getElementById('history-log');
        if(logContainer) {
            logContainer.innerHTML = ''; 
            if (scoreHistory.length === 0) {
                logContainer.innerHTML = `<div id="empty-log-msg">Waiting for match launch sequence. Let 'er rip!</div>`;
            } else {
                let workingHistory = [...scoreHistory];
                scoreHistory = [];
                workingHistory.forEach((snapshot) => {
                    scoreHistory.push(snapshot);
                    let roundRow = document.createElement('div');
                    roundRow.style.padding = '3px 0';
                    roundRow.innerHTML = snapshot.logText;
                    logContainer.appendChild(roundRow);
                });
            }
        }
        updateUI();
        if (lineupsAreLocked) calculateMatchupProbabilityMatrix();
    }
}

function triggerMiddleAnnouncement(type, chainCallback) {
    const backdrop = document.getElementById('backdrop-layer');
    const el = document.getElementById('announcement-layer');
    backdrop.classList.add('active');
    
    let isFoul = type === 'foul' || type === 'Penalty Foul';
    el.innerText = isFoul ? "LAUNCH FOUL!" : (type.toUpperCase() + " FINISH!");
    
    el.className = '';
    void el.offsetWidth;
    el.className = 'run-anim-long txt-' + (isFoul ? 'foul' : type);

    if (type === 'burst' || type === 'xtreme' || isFoul) {
        document.body.classList.remove('shake-active');
        void document.body.offsetWidth;
        document.body.classList.add('shake-active');
    }

    playCustomSound(isFoul ? 'foul' : type);

    midRoundTimeoutToken = setTimeout(() => {
        if (!matchIsOver) backdrop.classList.remove('active');
        document.body.classList.remove('shake-active');
        midRoundTimeoutToken = null;
        el.className = '';
        el.innerHTML = '';
    }, 2200);
    
    if (chainCallback) {
        setTimeout(() => {
            chainCallback();
        }, 2250);
    }
}

function triggerSetCompleteAnnouncement(setWinner) {
    const backdrop = document.getElementById('backdrop-layer');
    const el = document.getElementById('announcement-layer');
    backdrop.classList.add('active');
    
    el.innerHTML = `SET COMPLETE!<span class="sub-set">${setWinner} wins set!</span>`;
    el.className = '';
    void el.offsetWidth;
    el.className = 'run-anim-long txt-set-complete';
    playCustomSound('victory');

    midRoundTimeoutToken = setTimeout(() => {
        if (!matchIsOver) backdrop.classList.remove('active');
        midRoundTimeoutToken = null;
        el.className = '';
        el.innerHTML = '';
        if (matchIsOver) {
            triggerWinnerDisplay(setWinner);
        } else {
            p1Score = 0; p2Score = 0;
            updateUI();
        }
    }, 3200);
}

function triggerWinnerDisplay(winnerName) {
    const backdrop = document.getElementById('backdrop-layer');
    const el = document.getElementById('announcement-layer');
    backdrop.classList.add('active');
    
    el.innerHTML = `MATCH OVER!<span class="sub-victory">${winnerName} Wins Match!</span>`;
    el.className = '';
    void el.offsetWidth;
    el.className = 'run-anim-long txt-victory';
    playCustomSound('victory');

    // AUTO REMOVE TRANSLUCENT MASK AFTER SEQUENCE EXPIRES TO EXPOSE RESET BTN
    setTimeout(() => {
        backdrop.classList.remove('active');
        el.className = '';
        el.innerHTML = '';
    }, 4000);
}

function triggerPopAnimation(element) {
    element.classList.remove('pop');
    void element.offsetWidth;        
    element.classList.add('pop');    
}

function resetGame() {
    matchIsOver = false;
    document.getElementById("arena-reset-btn").classList.remove("highlight-end");
    stopAllAudio();
    
    p1Score = 0; p2Score = 0; p1Sets = 0; p2Sets = 0;
    p1ActiveSlot = 0; p2ActiveSlot = 0;
    p1Fouls = 0; p2Fouls = 0;
    scoreHistory = [];
    
    if (lineupsAreLocked) toggleLineupLock();

    countdownTimelineTokens.forEach(token => clearTimeout(token));
    countdownTimelineTokens = [];
    
    updateUI();
    updateActiveSlotHighlight(1, 0);
    updateActiveSlotHighlight(2, 0);

    document.getElementById("p1-foul-badge").innerText = "";
    document.getElementById("p2-foul-badge").innerText = "";
    
    document.body.classList.remove('shake-active');
    document.getElementById('p1-display').classList.remove('pop');
    document.getElementById('p2-display').classList.remove('pop');
    document.getElementById('backdrop-layer').classList.remove('active');
    document.getElementById('announcement-layer').className = '';
    document.getElementById('announcement-layer').innerHTML = '';

    const logContainer = document.getElementById('history-log');
    if(logContainer) logContainer.innerHTML = `<div id="empty-log-msg">Waiting for match launch sequence. Let 'er rip!</div>`;

    if (typeof playerDecks !== 'undefined') {
        playerDecks[1] = ["+ Select Bey 1", "+ Select Bey 2", "+ Select Bey 3"];
        playerDecks[2] = ["+ Select Bey 1", "+ Select Bey 2", "+ Select Bey 3"];
        renderDeckDisplay(1);
        renderDeckDisplay(2);
    }
}

function toggleFullscreen() {
    const btn = document.getElementById('fullscreen-btn');
    if (!btn) return;

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
            .then(() => { btn.innerHTML = "🗗"; btn.style.background = "#ff4757"; })
            .catch(err => console.log(`Fullscreen interaction error: ${err.message}`));
    } else {
        document.exitFullscreen();
        btn.innerHTML = "⛶"; 
        btn.style.background = "#2f3542";
    }
}

document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreen-btn');
    if (!btn) return;
    if (!document.fullscreenElement) {
        btn.innerHTML = "⛶";
        btn.style.background = "#2f3542";
    }
});

updateActiveSlotHighlight(1, 0);
updateActiveSlotHighlight(2, 0);