Nball = 13;
class snake {
    constructor(name, game, score, x, y) {
        this.name = name;
        this.game = game;
        this.score = score;
        this.x = x;
        this.y = y;
        this.init();
    }

    init() {
        this.time = Math.floor(20 + Math.random() * 100);
        this.speed = 1;
        this.size = this.game.getSize() * 1;
        this.angle = 0;
        this.dx = Math.random() * MaxSpeed - Math.random() * MaxSpeed;
        this.dy = Math.random() * MaxSpeed - Math.random() * MaxSpeed;

        this.v = [];
        for (let i = 0; i < 50; i++)
            this.v[i] = { x: this.x, y: this.y };
        this.sn_im = new Image();
        this.sn_im.src = "images/transparent-face.png";
        this.bd_im = new Image();
        var bodyFile = "images/body/" + Math.floor(Math.random() * 999999) % Nball + ".png";
        this.bd_im.src = bodyFile;

        // Pre-render body and head images to offscreen canvases for faster drawing
        this.bodyCached = null;
        this.headCached = null;
        this.bd_im.onload = () => {
            this.bodyCached = document.createElement('canvas');
            this.bodyCached.width = this.bd_im.naturalWidth;
            this.bodyCached.height = this.bd_im.naturalHeight;
            this.bodyCached.getContext('2d').drawImage(this.bd_im, 0, 0);
        };
        this.sn_im.onload = () => {
            this.headCached = document.createElement('canvas');
            this.headCached.width = this.sn_im.naturalWidth;
            this.headCached.height = this.sn_im.naturalHeight;
            this.headCached.getContext('2d').drawImage(this.sn_im, 0, 0);
        };
        if (this.bd_im.complete && this.bd_im.naturalWidth) {
            this.bodyCached = document.createElement('canvas');
            this.bodyCached.width = this.bd_im.naturalWidth;
            this.bodyCached.height = this.bd_im.naturalHeight;
            this.bodyCached.getContext('2d').drawImage(this.bd_im, 0, 0);
        }
        if (this.sn_im.complete && this.sn_im.naturalWidth) {
            this.headCached = document.createElement('canvas');
            this.headCached.width = this.sn_im.naturalWidth;
            this.headCached.height = this.sn_im.naturalHeight;
            this.headCached.getContext('2d').drawImage(this.sn_im, 0, 0);
        }
    }

    update() {
        this.time--;
        this.angle = this.getAngle(this.dx, this.dy);
        if (this.name != "Youhh") {
            if (this.time > 90)
                this.speed = 2;
            else
                this.speed = 1;
            if (this.time <= 0) {
                this.time = Math.floor(10 + Math.random() * 20);
                this.dx = Math.random() * MaxSpeed - Math.random() * MaxSpeed;
                this.dy = Math.random() * MaxSpeed - Math.random() * MaxSpeed;

                let minRange = Math.sqrt(game_W * game_W + game_H * game_H);

                for (let i = 0; i < FOOD.length; i++) {
                    if (FOOD[i].size > this.game.getSize() / 10 && this.range(this.v[0], FOOD[i]) < minRange) {
                        minRange = this.range(this.v[0], FOOD[i]);
                        this.dx = FOOD[i].x - this.v[0].x;
                        this.dy = FOOD[i].y - this.v[0].y;
                    }
                }
                if (minRange < Math.sqrt(game_W * game_W + game_H * game_H))
                    this.time = 0;
                // console.log(minRange);

                while (Math.abs(this.dy) * Math.abs(this.dy) + Math.abs(this.dx) * Math.abs(this.dx) > MaxSpeed * MaxSpeed && this.dx * this.dy != 0) {
                    this.dx /= 1.1;
                    this.dy /= 1.1;
                }
                while (Math.abs(this.dy) * Math.abs(this.dy) + Math.abs(this.dx) * Math.abs(this.dx) < MaxSpeed * MaxSpeed && this.dx * this.dy != 0) {
                    this.dx *= 1.1;
                    this.dy *= 1.1;
                }
            }
            this.score += this.score / 666;
        }

        this.v[0].x += this.dx * this.speed;
        this.v[0].y += this.dy * this.speed;

        let targetDist = this.size / 5;
        if (this.speed == 2) {
            targetDist = this.size / 7.5; // Tighter packing when boosting to make length decrease visually
        }

        for (let i = 1; i < this.v.length; i++) {
            let dist = this.range(this.v[i], this.v[i - 1]);
            if (dist > targetDist) {
                let ratio = targetDist / (dist || 0.001);
                this.v[i].x = this.v[i - 1].x + (this.v[i].x - this.v[i - 1].x) * ratio;
                this.v[i].y = this.v[i - 1].y + (this.v[i].y - this.v[i - 1].y) * ratio;
            }
        }

        if (this.speed == 2 && this.score > 100) {
            let lostVal = Math.max(0.5, this.score / 200);
            this.score -= lostVal;
            
            // Accumulate and drop food every 5 frames
            this.dropCounter = (this.dropCounter || 0) + 1;
            if (this.dropCounter >= 5) {
                this.dropCounter = 0;
                let tail = this.v[this.v.length - 1];
                if (tail && window.FOOD) {
                    window.FOOD[window.index] = new food(this.game, this.game.getSize() / 10, tail.x, tail.y);
                    window.FOOD[window.index].value = lostVal * 5;
                    window.index++;
                    if (window.index >= window.FOOD.length)
                        window.index = 0;
                }
            }
        }

        let displayScore = Math.max(100, this.score);
        let csUp = Math.pow(displayScore / 1000, 1 / 5);
        this.size = this.game.getSize() / 2 * csUp;
        let N = 3 * Math.floor(50 * Math.pow(displayScore / 1000, 1 / 1));
        if (N > this.v.length) {
            this.v[this.v.length] = { x: this.v[this.v.length - 1].x, y: this.v[this.v.length - 1].y };
        } else {
            this.v = this.v.slice(0, N);
        }
    }

    draw() {
        this.update();

        let bodyImg = this.bodyCached || this.bd_im;
        let headImg = this.headCached || this.sn_im;
        let ctx = this.game.context;
        let halfSize = this.size / 2;

        // On Android, skip every other body segment to halve drawImage calls
        let step = isAndroid ? 2 : 1;
        for (let i = this.v.length - 1; i >= 1; i -= step)
            if (this.game.isPoint(this.v[i].x, this.v[i].y))
                ctx.drawImage(bodyImg, this.v[i].x - XX - halfSize, this.v[i].y - YY - halfSize, this.size, this.size);

        ctx.save();
        ctx.translate(this.v[0].x - XX, this.v[0].y - YY);
        ctx.rotate(this.angle - Math.PI / 2);
        ctx.drawImage(headImg, -halfSize, -halfSize, this.size, this.size);
        ctx.restore();
    }

    getAngle(a, b) {
        let c = Math.sqrt(a * a + b * b);
        let al = Math.acos(a / c);
        if (b < 0)
            al += 2 * (Math.PI - al);
        return al;
    }

    range(v1, v2) {
        return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
    }
}