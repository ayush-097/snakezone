game_W = 0, game_H = 0;

var bg_im = new Image();
bg_im.src = "images/Map2.png";
SPEED = 1;
MaxSpeed = 0;
chX = chY = 1;
mySnake = [];
FOOD = [];
NFood = 2000;
Nsnake = 20;
sizeMap = 2000;
index = 0;
minScore = 200;
die = false;

Xfocus = Yfocus = 0;
XX = 0, YY = 0;

const names = [
    "Ethan Carter",
    "Olivia Brooks",
    "Liam Foster",
    "Sophia Bennett",
    "Noah Hayes",
    "Ava Collins",
    "Mason Reed",
    "Isabella Turner",
    "Lucas Parker",
    "Mia Sanders",
    "Benjamin Price",
    "Charlotte Morgan",
    "Elijah Cooper",
    "Amelia Ward",
    "James Richardson",
    "Harper Ellis",
    "Alexander Hughes",
    "Evelyn Ross",
    "Michael Perry",
    "Abigail Jenkins",
    "Daniel Powell",
    "Emily Simmons",
    "Matthew Bryant",
    "Ella Griffin",
    "Joseph Russell",
    "Scarlett Diaz",
    "David Hayes",
    "Victoria Cole",
    "Samuel West",
    "Grace Foster",
    "Andrew Fisher",
    "Chloe Barnes",
    "Christopher Long",
    "Lily Murphy",
    "Joshua Knight",
    "Aria Gibson",
    "Nathan Wells",
    "Zoey Freeman",
    "Ryan Hunter",
    "Nora Chapman",
    "Jonathan Burke",
    "Hannah Lawson",
    "Gabriel Spencer",
    "Avery Holland",
    "Christian Walters",
    "Layla Porter",
    "Aaron Dean",
    "Riley Tucker",
    "Tyler Shaw",
    "Madison Stevens",
    "Logan Matthews",
    "Camila Hudson",
    "Brandon Arnold",
    "Penelope Pierce",
    "Justin Carr",
    "Stella Reynolds",
    "Kevin Black",
    "Aurora Harper",
    "Zachary Woods",
    "Natalie Greene",
    "Nathaniel Blake"
];

class game {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.init();
    }

    init() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);

        // Create Leaderboard panel
        const lbPanel = document.createElement("div");
        lbPanel.id = "leaderboard-hud";
        lbPanel.className = "hud-panel leaderboard-panel";
        lbPanel.innerHTML = `
            <h3>Leaderboard</h3>
            <div id="leaderboard-list"></div>
        `;
        document.body.appendChild(lbPanel);

        // Create Mobile Controls
        const mobileControls = document.createElement("div");
        mobileControls.className = "mobile-controls";
        mobileControls.innerHTML = `
            <div class="joystick-zone" id="joystick-zone">
                <div class="joystick-base">
                    <div class="joystick-knob" id="joystick-knob"></div>
                </div>
            </div>
            <div class="boost-zone" id="boost-zone">
                <div class="boost-btn" id="boost-btn">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L4.5 13H12L11 22L19.5 11H12L13 2Z" fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        `;
        document.body.appendChild(mobileControls);

        this.render();

        for (let i = 0; i < Nsnake; i++)
            mySnake[i] = new snake(names[Math.floor(Math.random() * 99999) % names.length], this, Math.floor(2 * minScore + Math.random() * 2 * minScore), (Math.random() - Math.random()) * sizeMap, (Math.random() - Math.random()) * sizeMap);
        mySnake[0] = new snake("Youhh", this, minScore, game_W / 2, game_H / 2);
        for (let i = 0; i < NFood; i++) {
            FOOD[i] = new food(this, this.getSize() / (7 + Math.random() * 10), (Math.random() - Math.random()) * sizeMap, (Math.random() - Math.random()) * sizeMap);
        }

        this.loop();

        this.listenMouse();
        this.listenTouch();
        this.initMobileControls();
    }

    listenTouch() {
        // On devices with mobile controls (coarse pointer), skip the old full-screen touch handlers
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        if (isTouchDevice) return;

        document.addEventListener("touchmove", evt => {
            var y = evt.touches[0].pageY;
            var x = evt.touches[0].pageX;
            chX = (x - game_W / 2) / 15;
            chY = (y - game_H / 2) / 15;
        })

        document.addEventListener("touchstart", evt => {
            var y = evt.touches[0].pageY;
            var x = evt.touches[0].pageX;
            chX = (x - game_W / 2) / 15;
            chY = (y - game_H / 2) / 15;
            mySnake[0].speed = 2;
        })

        document.addEventListener("touchend", evt => {
            mySnake[0].speed = 1;
        })
    }

    listenMouse() {
        document.addEventListener("mousedown", evt => {
            var x = evt.offsetX == undefined ? evt.layerX : evt.offsetX;
            var y = evt.offsetY == undefined ? evt.layerY : evt.offsetY;
            mySnake[0].speed = 2;
        })

        document.addEventListener("mousemove", evt => {
            var x = evt.offsetX == undefined ? evt.layerX : evt.offsetX;
            var y = evt.offsetY == undefined ? evt.layerY : evt.offsetY;
            chX = (x - game_W / 2) / 15;
            chY = (y - game_H / 2) / 15;
        })

        document.addEventListener("mouseup", evt => {
            var x = evt.offsetX == undefined ? evt.layerX : evt.offsetX;
            var y = evt.offsetY == undefined ? evt.layerY : evt.offsetY;
            mySnake[0].speed = 1;
        })
    }

    initMobileControls() {
        const joystickZone = document.getElementById('joystick-zone');
        const joystickKnob = document.getElementById('joystick-knob');
        const boostBtn = document.getElementById('boost-btn');
        if (!joystickZone || !joystickKnob || !boostBtn) return;

        let joystickTouchId = null;
        let boostTouchId = null;
        const joystickMaxDist = 40;

        // --- Joystick ---
        joystickZone.addEventListener('touchstart', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (joystickTouchId !== null) return;
            const touch = evt.changedTouches[0];
            joystickTouchId = touch.identifier;
            joystickKnob.classList.add('active');
            this.handleJoystickMove(touch, joystickZone, joystickKnob, joystickMaxDist);
        }, { passive: false });

        joystickZone.addEventListener('touchmove', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            for (let i = 0; i < evt.changedTouches.length; i++) {
                if (evt.changedTouches[i].identifier === joystickTouchId) {
                    this.handleJoystickMove(evt.changedTouches[i], joystickZone, joystickKnob, joystickMaxDist);
                    break;
                }
            }
        }, { passive: false });

        const resetJoystick = (evt) => {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                if (evt.changedTouches[i].identifier === joystickTouchId) {
                    joystickTouchId = null;
                    joystickKnob.classList.remove('active');
                    joystickKnob.style.transform = 'translate(-50%, -50%)';
                    // Don't reset chX/chY so snake keeps moving in last direction
                    break;
                }
            }
        };
        joystickZone.addEventListener('touchend', resetJoystick, { passive: false });
        joystickZone.addEventListener('touchcancel', resetJoystick, { passive: false });

        // --- Boost Button ---
        boostBtn.addEventListener('touchstart', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (boostTouchId !== null) return;
            boostTouchId = evt.changedTouches[0].identifier;
            boostBtn.classList.add('active');
            if (mySnake[0]) mySnake[0].speed = 2;
        }, { passive: false });

        const resetBoost = (evt) => {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                if (evt.changedTouches[i].identifier === boostTouchId) {
                    boostTouchId = null;
                    boostBtn.classList.remove('active');
                    if (mySnake[0]) mySnake[0].speed = 1;
                    break;
                }
            }
        };
        boostBtn.addEventListener('touchend', resetBoost, { passive: false });
        boostBtn.addEventListener('touchcancel', resetBoost, { passive: false });
    }

    handleJoystickMove(touch, zone, knob, maxDist) {
        const rect = zone.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;

        // Clamp to max distance
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        // Move the knob visually
        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        // Normalize and set direction (scale to match MaxSpeed range)
        const normDist = Math.min(dist, maxDist) / maxDist;
        if (normDist > 0.1) {
            const angle = Math.atan2(dy, dx);
            chX = Math.cos(angle) * MaxSpeed * normDist;
            chY = Math.sin(angle) * MaxSpeed * normDist;
        }
    }

    loop() {
        if (die)
            return;
        this.update();
        this.draw();
        setTimeout(() => this.loop(), 30);
    }

    update() {
        this.render();
        this.unFood();
        this.changeFood();
        this.changeSnake();
        this.updateChXY();
        this.checkDie();

        mySnake[0].dx = chX;
        mySnake[0].dy = chY;
        XX += chX * mySnake[0].speed;
        YY += chY * mySnake[0].speed;
        mySnake[0].v[0].x = XX + game_W / 2;
        mySnake[0].v[0].y = YY + game_H / 2;
    }

    updateChXY() {
        while (Math.abs(chY) * Math.abs(chY) + Math.abs(chX) * Math.abs(chX) > MaxSpeed * MaxSpeed && chY * chX != 0) {
            chX /= 1.1;
            chY /= 1.1;
        }
        while (Math.abs(chY) * Math.abs(chY) + Math.abs(chX) * Math.abs(chX) < MaxSpeed * MaxSpeed && chY * chX != 0) {
            chX *= 1.1;
            chY *= 1.1;
        }

        Xfocus += 1.5 * chX * mySnake[0].speed;
        Yfocus += 1.5 * chY * mySnake[0].speed;
        if (Xfocus < 0)
            Xfocus = bg_im.width / 2 + 22;
        if (Xfocus > bg_im.width / 2 + 22)
            Xfocus = 0;
        if (Yfocus < 0)
            Yfocus = bg_im.height / 2 + 60;
        if (Yfocus > bg_im.height / 2 + 60)
            Yfocus = 0;
    }

    changeFood() {
        for (let i = 0; i < FOOD.length; i++)
            if (Math.sqrt((mySnake[0].v[0].x - FOOD[i].x) * (mySnake[0].v[0].x - FOOD[i].x) + (mySnake[0].v[0].y - FOOD[i].y) * (mySnake[0].v[0].y - FOOD[i].y)) > sizeMap) {
                FOOD[i] = new food(this, this.getSize() / (10 + Math.random() * 10), (Math.random() - Math.random()) * sizeMap + mySnake[0].v[0].x, (Math.random() - Math.random()) * sizeMap + mySnake[0].v[0].y);
                // console.log(FOOD[i]);
            }
    }

    changeSnake() {
        for (let i = 0; i < mySnake.length; i++)
            if (Math.sqrt((mySnake[0].v[0].x - mySnake[i].v[0].x) * (mySnake[0].v[0].x - mySnake[i].v[0].x) + (mySnake[0].v[0].y - mySnake[i].v[0].y) * (mySnake[0].v[0].y - mySnake[i].v[0].y)) > sizeMap) {
                mySnake[i].v[0].x = (mySnake[0].v[0].x + mySnake[i].v[0].x) / 2;
                mySnake[i].v[0].y = (mySnake[0].v[0].y + mySnake[i].v[0].y) / 2;
            }
    }

    unFood() {
        if (mySnake.length <= 0)
            return;
        for (let i = 0; i < mySnake.length; i++)
            for (let j = 0; j < FOOD.length; j++) {
                if ((mySnake[i].v[0].x - FOOD[j].x) * (mySnake[i].v[0].x - FOOD[j].x) + (mySnake[i].v[0].y - FOOD[j].y) * (mySnake[i].v[0].y - FOOD[j].y) < 1.5 * mySnake[i].size * mySnake[i].size) {
                    mySnake[i].score += Math.floor(FOOD[j].value);
                    FOOD[j] = new food(this, this.getSize() / (5 + Math.random() * 10), (Math.random() - Math.random()) * 5000 + XX, (Math.random() - Math.random()) * 5000 + YY);
                }
            }
    }

    checkDie() {
        for (let i = 0; i < mySnake.length; i++)
            for (let j = 0; j < mySnake.length; j++)
                if (i != j) {
                    let kt = true;
                    for (let k = 0; k < mySnake[j].v.length; k++)
                        if (this.range(mySnake[i].v[0].x, mySnake[i].v[0].y, mySnake[j].v[k].x, mySnake[j].v[k].y) < mySnake[i].size)
                            kt = false;
                    if (!kt) {
                        for (let k = 0; k < mySnake[i].v.length; k += 5) {
                            FOOD[index] = new food(this, this.getSize() / (2 + Math.random() * 2), mySnake[i].v[k].x + Math.random() * mySnake[i].size / 2, mySnake[i].v[k].y + Math.random() * mySnake[i].size / 2);
                            FOOD[index++].value = 0.4 * mySnake[i].score / (mySnake[i].v.length / 5);
                            if (index >= FOOD.length)
                                index = 0;
                        }
                        if (i != 0)
                            mySnake[i] = new snake(names[Math.floor(Math.random() * 99999) % names.length], this, Math.max(Math.floor((mySnake[0].score > 10 * minScore) ? mySnake[0].score / 10 : minScore), mySnake[i].score / 10), this.randomXY(XX), this.randomXY(YY));
                        else {
                            die = true;
                            const finalScore = Math.floor(mySnake[i].score);

                            let rank = 1;
                            for (let r = 0; r < mySnake.length; r++) {
                                if (r !== i && mySnake[r].score > mySnake[i].score) rank++;
                            }

                            const overlay = document.createElement("div");
                            overlay.className = "popup-overlay";
                            overlay.innerHTML = `
                                <div class="popup-container">
                                    <div class="result-header">
                                        <h2 class="result-title">Result</h2>
                                    </div>
                                    
                                    <div class="result-trophy">
                                        <svg class="trophy-svg" viewBox="0 0 100 100">
                                            <defs>
                                                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stop-color="#FFDF00"/>
                                                    <stop offset="50%" stop-color="#DAA520"/>
                                                    <stop offset="100%" stop-color="#B8860B"/>
                                                </linearGradient>
                                                <linearGradient id="gold-grad-light" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stop-color="#FFF8DC"/>
                                                    <stop offset="50%" stop-color="#FFDF00"/>
                                                    <stop offset="100%" stop-color="#DAA520"/>
                                                </linearGradient>
                                            </defs>
                                            <path d="M22,35 C0,35 0,65 35,60 M78,35 C100,35 100,65 65,60" fill="none" stroke="url(#gold-grad)" stroke-width="8" stroke-linecap="round"/>
                                            <path d="M40,75 L60,75 L65,90 L35,90 Z" fill="#DAA520"/>
                                            <rect x="25" y="90" width="50" height="8" rx="4" fill="#B8860B"/>
                                            <path d="M15,20 L85,20 C85,50 70,75 50,75 C30,75 15,50 15,20 Z" fill="url(#gold-grad)"/>
                                            <ellipse cx="50" cy="20" rx="35" ry="6" fill="url(#gold-grad-light)"/>
                                        </svg>
                                        <div class="trophy-badge">
                                            <div class="crown">👑</div>
                                            <div class="rank">${rank}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="result-score">
                                        <div class="score-value">${finalScore.toLocaleString()}</div>
                                    </div>

                                    <button class="popup-btn restart-btn">
                                        <span class="restart-icon">↻</span> Restart
                                    </button>
                                </div>
                            `;
                            document.body.appendChild(overlay);
                            // Reflow to trigger CSS transition
                            overlay.offsetHeight;
                            overlay.classList.add("show");

                            overlay.querySelector(".restart-btn").addEventListener("click", () => {
                                window.location.href = ".";
                            });
                        }
                    }
                }
    }

    render() {
        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        if (this.canvas.width != clientWidth * dpr || this.canvas.height != clientHeight * dpr) {
            this.canvas.width = clientWidth * dpr;
            this.canvas.height = clientHeight * dpr;
            this.canvas.style.width = clientWidth + "px";
            this.canvas.style.height = clientHeight + "px";

            this.context.setTransform(1, 0, 0, 1, 0, 0); // Reset scale transform
            this.context.scale(dpr, dpr); // Scale context for high-DPI sharpness

            game_W = clientWidth;
            game_H = clientHeight;
            SPEED = this.getSize() / 7;
            SPEED = 1;
            MaxSpeed = this.getSize() / 7;
            if (mySnake.length == 0)
                return;
            if (mySnake[0].v != null) {
                mySnake[0].v[0].x = XX + game_W / 2;
                mySnake[0].v[0].y = YY + game_H / 2;
            }
        }
    }

    draw() {
        this.clearScreen();
        for (let i = 0; i < FOOD.length; i++)
            FOOD[i].draw();
        for (let i = 0; i < mySnake.length; i++)
            mySnake[i].draw();
        this.drawScore();
    }

    drawScore() {
        let data = [];
        for (let i = 0; i < mySnake.length; i++)
            data[i] = mySnake[i];
        for (let i = 0; i < data.length - 1; i++)
            for (let j = i + 1; j < data.length; j++)
                if (data[i].score < data[j].score) {
                    let t = data[i];
                    data[i] = data[j];
                    data[j] = t;
                }
        let index = 0;
        for (let i = 0; i < mySnake.length; i++) {
            if (data[i].name == "Youhh") {
                index = i;
                break;
            }
        }

        // Update Score Panel
        const scoreEl = document.getElementById("score-value");
        const rankEl = document.getElementById("rank-value");
        if (scoreEl && mySnake[0]) {
            scoreEl.textContent = Math.floor(mySnake[0].score);
        }
        if (rankEl) {
            rankEl.textContent = `Rank: #${index + 1} / ${mySnake.length}`;
        }

        // Update Leaderboard List HTML
        const listEl = document.getElementById("leaderboard-list");
        if (listEl) {
            let html = "";
            const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 850;
            const limit = isMobile ? 5 : 10;
            for (let i = 0; i < Math.min(limit, data.length); i++) {
                const isPlayer = data[i].name === "Youhh";
                html += `
                    <div class="leaderboard-row ${isPlayer ? 'player-highlight' : ''}">
                        <span class="leaderboard-rank">#${i + 1}</span>
                        <span class="leaderboard-name">${data[i].name}</span>
                        <span class="leaderboard-score">${Math.floor(data[i].score)}</span>
                    </div>
                `;
            }
            listEl.innerHTML = html;
        }
    }

    clearScreen() {
        this.context.clearRect(0, 0, game_W, game_H);
        let scale = 80 / this.getSize();
        this.context.drawImage(bg_im, Xfocus, Yfocus, 1.5 * game_W * scale, 1.5 * game_H * scale, 0, 0, game_W, game_H);
    }

    getSize() {
        var area = game_W * game_H;
        var baseSize = Math.sqrt(area / 300);
        return Math.max(65, baseSize);
    }

    range(a, b, c, d) {
        return Math.sqrt((a - c) * (a - c) + (b - d) * (b - d));
    }

    randomXY(n) {
        let ans = 0;
        while (Math.abs(ans) < 1) {
            ans = 3 * Math.random() - 3 * Math.random();
        }
        return ans * sizeMap + n;
    }

    isPoint(x, y) {
        if (x - XX < -3 * this.getSize())
            return false;
        if (y - YY < -3 * this.getSize())
            return false;
        if (x - XX > game_W + 3 * this.getSize())
            return false;
        if (y - YY > game_H + 3 * this.getSize())
            return false;
        return true;
    }
}

var g = new game();