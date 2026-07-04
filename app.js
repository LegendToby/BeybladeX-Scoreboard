let p1Score = 0, p2Score = 0, p1Sets = 0, p2Sets = 0;
let winLimit = 4, setsWinLimit = 2;  
let scoreHistory = [];
let matchIsOver = false;
let midRoundTimeoutToken = null, victoryTimeoutToken = null;
let activeAudioTracks = [];
let activeModalPlayer = null; // Referenced globally by parts engine file seamlessly

function unlockAudioEngine() {
    let contextUnlock = new Audio();
    contextUnlock.play().catch(e => {});
    window.removeEventListener('mousedown', unlockAudioEngine);
    window.removeEventListener('touchstart', unlockAudioEngine);
}
window.addEventListener('mousedown', unlockAudioEngine);
window.addEventListener('touchstart', unlockAudioEngine);

function playCustomSound(fileName) {
    try {
        let cacheBuster = "?v=" + new Date().getTime();
        let track = new Audio(fileName + '.mp3' + cacheBuster);
        activeAudioTracks.push(track);
        track.play().catch(e => console.log("Audio pipeline active tracking context..."));
        track.onended = () => activeAudioTracks = activeAudioTracks.filter(t => t !== track);
    } catch(e) { console.log("Audio module load error:", e); }
}

function stopAllAudio() {
    activeAudioTracks.forEach(track => { try { track.pause(); track.currentTime = 0; } catch(e){} });
    activeAudioTracks = [];
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
    playCustomSound('countdown');
}

function addScore(player, points, finishType) {
    if (matchIsOver || midRoundTimeoutToken) return; 

    let p1Name = document.getElementById('p1-name').value;
    let p2Name = document.getElementById('p2-name').value;
    let displayElement = document.getElementById(player === 1 ? 'p1-display' : 'p2-display');

    let formattedFinish = finishType.charAt(0).toUpperCase() + finishType.slice(1);
    let scorerName = player === 1 ? p1Name : p2Name;
    let logDescription = `${scorerName} scored +${points} [${formattedFinish}]`;

    scoreHistory.push({
        p1Score: p1Score, p2Score: p2Score,
        p1Sets: p1Sets, p2Sets: p2Sets,
        logText: logDescription
    });

    let setAwarded = false, currentWinner = "";

    if (player === 1) {
        p1Score += points;
        triggerPopAnimation(displayElement);
        if (p1Score >= winLimit) {
            p1Sets += 1; setAwarded = true; currentWinner = p1Name;
            logDescription += ` ⭐ Set ${p1Name}`;
            scoreHistory[scoreHistory.length - 1].logText = logDescription;
            if (p1Sets >= setsWinLimit) matchIsOver = true; 
        }
    } else {
        p2Score += points;
        triggerPopAnimation(displayElement);
        if (p2Score >= winLimit) {
            p2Sets += 1; setAwarded = true; currentWinner = p2Name;
            logDescription += ` ⭐ Set ${p2Name}`;
            scoreHistory[scoreHistory.length - 1].logText = logDescription;
            if (p2Sets >= setsWinLimit) matchIsOver = true; 
        }
    }

    if (setAwarded) {
        triggerMiddleAnnouncement(finishType, () => triggerSetCompleteAnnouncement(currentWinner));
    } else {
        triggerMiddleAnnouncement(finishType);
    }

    updateUI();
    updateLogDisplay(logDescription);
}

function updateUI() {
    document.getElementById('p1-display').innerText = p1Score;
    document.getElementById('p2-display').innerText = p2Score;
    document.getElementById('p1-sets').innerText = p1Sets;
    document.getElementById('p2-sets').innerText = p2Sets;
}

function updateLogDisplay(text) {
    const logContainer = document.getElementById('history-log');
    if (!logContainer) return; 
    const emptyMsg = document.getElementById('empty-log-msg');
    if (emptyMsg) emptyMsg.remove();

    let roundNumber = scoreHistory.length;
    let logRow = document.createElement('div');
    logRow.style.padding = '4px 6px';
    logRow.style.borderBottom = '1px solid #2a2a2a';
    logRow.style.fontSize = '0.8rem';
    logRow.style.color = text.includes('⭐') ? '#ff4757' : '#ffffff';
    logRow.innerHTML = `<b style="color: #ffcc00;">R${roundNumber}:</b> ${text} <span style="float: right; color: #a4b0be;">[S:${p1Sets}-${p2Sets} P:${p1Score}-${p2Score}]</span>`;
    
    logContainer.appendChild(logRow);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function undoLast() {
    if(victoryTimeoutToken) { clearTimeout(victoryTimeoutToken); victoryTimeoutToken = null; }
    if(midRoundTimeoutToken) { clearTimeout(midRoundTimeoutToken); midRoundTimeoutToken = null; }

    matchIsOver = false;
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
        
        const logContainer = document.getElementById('history-log');
        if(logContainer) {
            logContainer.innerHTML = ''; 
            if (scoreHistory.length === 0) {
                logContainer.innerHTML = `<div id="empty-log-msg">No rounds recorded yet. Let 'er rip!</div>`;
            } else {
                let workingHistory = [...scoreHistory];
                scoreHistory = [];
                workingHistory.forEach((snapshot) => {
                    scoreHistory.push(snapshot);
                    let roundRow = document.createElement('div');
                    roundRow.style.padding = '4px 6px';
                    roundRow.style.borderBottom = '1px solid #2a2a2a';
                    roundRow.style.fontSize = '0.8rem';
                    roundRow.style.color = snapshot.logText.includes('⭐') ? '#ff4757' : '#ffffff';
                    roundRow.innerHTML = `<b style="color: #ffcc00;">R${scoreHistory.length}:</b> ${snapshot.logText}`;
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
    
    let formattedName = type.charAt(0).toUpperCase() + type.slice(1);
    el.innerText = formattedName + " Finish!";
    el.className = '';
    void el.offsetWidth; 
    el.classList.add('anim-' + type, 'txt-' + type);

    if (type === 'burst' || type === 'xtreme') {
        document.body.classList.remove('shake-active');
        void document.body.offsetWidth;
        document.body.classList.add('shake-active');
    }
    playCustomSound(type);

    midRoundTimeoutToken = setTimeout(() => {
        backdrop.classList.remove('active');
        document.body.classList.remove('shake-active');
        midRoundTimeoutToken = null;
        if (chainCallback) chainCallback();
    }, 2200);
}

function triggerSetCompleteAnnouncement(setWinner) {
    const backdrop = document.getElementById('backdrop-layer');
    const el = document.getElementById('announcement-layer');
    backdrop.classList.add('active');
    el.innerHTML = `SET COMPLETE!<span class="sub-set">${setWinner} wins set!</span>`;
    el.className = '';
    void el.offsetWidth;
    el.classList.add('anim-set-complete', 'txt-set-complete');
    playCustomSound('victory'); 

    midRoundTimeoutToken = setTimeout(() => {
        backdrop.classList.remove('active');
        midRoundTimeoutToken = null;
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
    el.innerHTML = `MATCH OVER!<span class="sub-victory">${winnerName} Wins!</span>`;
    el.className = '';
    void el.offsetWidth;
    el.classList.add('anim-victory', 'txt-victory');
    playCustomSound('victory');
}

function triggerPopAnimation(element) {
    element.classList.remove('pop');
    void element.offsetWidth;        
    element.classList.add('pop');    
}

function resetGame() {
    if(victoryTimeoutToken) { clearTimeout(victoryTimeoutToken); victoryTimeoutToken = null; }
    if(midRoundTimeoutToken) { clearTimeout(midRoundTimeoutToken); midRoundTimeoutToken = null; }

    matchIsOver = false;
    stopAllAudio();
    p1Score = 0; p2Score = 0; p1Sets = 0; p2Sets = 0;
    scoreHistory = [];
    updateUI();
    
    document.body.classList.remove('shake-active');
    document.getElementById('p1-display').classList.remove('pop');
    document.getElementById('p2-display').classList.remove('pop');
    document.getElementById('backdrop-layer').classList.remove('active');
    document.getElementById('announcement-layer').className = '';
    document.getElementById('announcement-layer').innerHTML = '';

    const logContainer = document.getElementById('history-log');
    if(logContainer) logContainer.innerHTML = `<div id="empty-log-msg">No rounds recorded yet. Let 'er rip!</div>`;
}