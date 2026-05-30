const ArrEmoji = ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍆", "🥑", "🥦", "🥬", "🥒", "🌽", "🥕", "🍞", "🧀", "🍳", "🥓", "🥩", "🍗", "🌭", "🍔", "🍟", "🍕", "🥪", "🌮", "🌯", "🍩", "🍪", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯"];
const EmojiCache = {};

function getCachedEmojiCanvas(emoji) {
    if (!EmojiCache[emoji]) {
        const size = 128; // High resolution size for the offscreen buffer
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.font = `${size * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, size / 2, size / 2);
        EmojiCache[emoji] = canvas;
    }
    return EmojiCache[emoji];
}

class food {
    constructor(game, size, x, y) {
        this.game = game;
        this.size = size;
        this.value = this.size;
        this.x = x;
        this.y = y;
        this.init();
    }

    init() {
        this.emoji = ArrEmoji[Math.floor(Math.random() * 99999) % ArrEmoji.length];
        this.cachedCanvas = getCachedEmojiCanvas(this.emoji);
    }

    draw() {
        if (this.game.isPoint(this.x, this.y)) {
            const cx = this.x - this.size / 4 - XX;
            const cy = this.y - this.size / 4 - YY;
            const r = this.size / 2;
            this.game.context.drawImage(this.cachedCanvas, cx - r, cy - r, this.size, this.size);
        }
    }
}