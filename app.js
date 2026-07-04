let p1Score = 0, p2Score = 0, p1Sets = 0, p2Sets = 0;
let p1ActiveSlot = 0, p2ActiveSlot = 0;
let p1Fouls = 0, p2Fouls = 0; 
let winLimit = 4, setsWinLimit = 2;  
let scoreHistory = [];
let matchIsOver = false;
let midRoundTimeoutToken = null;
let countdownTimelineTokens = []; 
let activeAudioTracks = [];

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
    if (midRoundTimeoutToken) return;

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
    if(matchIsOver || scoreHistory.length > 0) return; 
    let newLimit = winLimit + amount;
    if (newLimit >= 1 && newLimit <= 10) { 
        winLimit = newLimit;
        document.getElementById('limit-display').innerText = winLimit;
        resetGame();
    }
}

function adjustSetsLimit(amount) {
    if(matchIsOver || scoreHistory.length > 0) return;
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
    
    const el = document.getElementById('announcement-layer');
    const backdrop = document.getElementById('backdrop-layer');
    backdrop.classList.add('active');

    executeSequenceTick("3...", "txt-spin");

    countdownTimelineTokens.push(setTimeout(() => {
        executeSequenceTick("2...", "txt-spin");
    }, 900));

    countdownTimelineTokens.push(setTimeout(() => {
        executeSequenceTick("1...", "txt-spin");
    }, 1750));

    countdownTimelineTokens.push(setTimeout(() => {
        executeSequenceTick("GO!", "txt-burst");
    }, 2550));

    countdownTimelineTokens.push(setTimeout(() => {
        executeSequenceTick("SHOOT! ⚡", "txt-victory");
    }, 3050));

    countdownTimelineTokens.push(setTimeout(() => {
        backdrop.classList.remove('active');
        el.className = '';
        el.innerHTML = '';
    }, 4600));
}

function executeSequenceTick(text, stylingClass) {
    const el = document.getElementById('announcement-layer');
    el.className = '';
    el.innerHTML = '';
    void el.offsetWidth; 
    el.innerText = text;
    el.className = `run-anim ${stylingClass}`;
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
            // 2nd Strike reached: executes a score sequence which automatically handles the reset process
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
            // 2nd Strike reached: executes a score sequence which automatically handles the reset process
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

function executeScoreSequence(player, points, finishType) {
    let p1Name = document.getElementById('p1-name').value;
    let p2Name = document.getElementById('p2-name').value;
    let displayElement = document.getElementById(player === 1 ? 'p1-display' : 'p2-display');
    let logDescription = scoreHistory[scoreHistory.length - 1].logText;

    // RULE ENFORCEMENT: Any point scored instantly clears accumulated foul tracks back to 0
    p1Fouls = 0;
    p2Fouls = 0;
    document.getElementById("p1-foul-badge").innerText = "";
    document.getElementById("p2-foul-badge").innerText = "";

    let setAwarded = false, currentWinner = "";

    if (player === 1) {
        p1Score += points;
        triggerPopAnimation(displayElement);
        if (p1Score >= winLimit) {
            p1Sets += 1; setAwarded = true; currentWinner = p1Name;
            if(!logDescription.includes('⭐')) logDescription += ` ⭐ Set ${p1Name}`;
            scoreHistory[scoreHistory.length - 1].logText = logDescription;
            if (p1Sets >= setsWinLimit) matchIsOver = true; 
        }
    } else {
        p2Score += points;
        triggerPopAnimation(displayElement);
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
        
        triggerMiddleAnnouncement(finishType);
    }

    updateUI();
    if(finishType !== 'Penalty Foul') updateLogDisplay(logDescription);
    
    if (matchIsOver) {
        document.getElementById("backdrop-layer").classList.add("active");
        document.getElementById("arena-reset-btn").classList.add("highlight-end");
    }
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
    logRow.style.color = (text.includes('⭐') || text.includes('🚨') || text.includes('🔄')) ? '#ff4757' : '#ffffff';
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