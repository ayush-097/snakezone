const ArrEmoji = ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍆", "🥑", "🥦", "🥬", "🥒", "🌽", "🥕", "🍞", "🧀", "🍳", "🥓", "🥩", "🍗", "🌭", "🍔", "🍟", "🍕", "🥪", "🌮", "🌯", "🍩", "🍪", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯"];
const EmojiCache = {};

// Use smaller emoji textures on Android to reduce GPU memory and drawImage cost
const EMOJI_CACHE_SIZE = /android/i.test(navigator.userAgent) ? 64 : 128;

function getCachedEmojiCanvas(emoji) {
    if (!EmojiCache[emoji]) {
        const size = EMOJI_CACHE_SIZE;
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
            const visualSize = this.size * 2.0; // Make food emoji 2x bigger
            const cx = this.x - XX;
            const cy = this.y - YY;
            const r = visualSize / 2;
            this.game.context.drawImage(this.cachedCanvas, cx - r, cy - r, visualSize, visualSize);
        }
    }
}