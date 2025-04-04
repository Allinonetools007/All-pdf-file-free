const imageUpload = document.getElementById('imageUpload');
const beforeCanvas = document.getElementById('beforeCanvas');
const afterCanvas = document.getElementById('afterCanvas');

let originalImage = null;
const beforeCtx = beforeCanvas.getContext('2d');
const afterCtx = afterCanvas.getContext('2d');

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            // इमेज का साइज़ 800px से ज़्यादा न हो ताकि तेज़ी से काम करे
            const maxSize = 800;
            let width = img.width;
            let height = img.height;
            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = width * ratio;
                height = height * ratio;
            }
            beforeCanvas.width = width;
            beforeCanvas.height = height;
            afterCanvas.width = width;
            afterCanvas.height = height;
            drawImages();
        };
        img.src = URL.createObjectURL(file);
    }
});

function drawImages() {
    if (!originalImage) return;

    // "पहले" कैनवास पर मूल फोटो
    beforeCtx.clearRect(0, 0, beforeCanvas.width, beforeCanvas.height);
    beforeCtx.drawImage(originalImage, 0, 0, beforeCanvas.width, beforeCanvas.height);

    // "बाद में" कैनवास पर शुरू में मूल फोटो
    afterCtx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
    afterCtx.drawImage(originalImage, 0, 0, afterCanvas.width, afterCanvas.height);
}

function autoEnhance() {
    if (!originalImage) {
        alert("पहले फोटो अपलोड करें!");
        return;
    }

    // "बाद में" कैनवास पर एन्हांस्ड फोटो
    afterCtx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
    
    // पहले CSS फिल्टर्स लागू करें
    afterCtx.filter = `
        brightness(150%)    // चमक बढ़ाएं
        contrast(140%)      // कंट्रास्ट बढ़ाएं
        saturate(200%)      // रंगों को चटक करें
    `;
    afterCtx.drawImage(originalImage, 0, 0, afterCanvas.width, afterCanvas.height);

    // फिर शार्पनिंग लागू करें
    applySharpen(afterCtx);
}

function applySharpen(ctx) {
    const imageData = ctx.getImageData(0, 0, afterCanvas.width, afterCanvas.height);
    const data = imageData.data;
    const width = afterCanvas.width;
    const height = afterCanvas.height;

    // मज़बूत शार्पनिंग के लिए कर्नल
    const sharpenKernel = [0, -2, 0, -2, 9, -2, 0, -2, 0];
    const tempData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let r = 0, g = 0, b = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                    const weight = sharpenKernel[(ky + 1) * 3 + (kx + 1)];
                    r += tempData[pixelIndex] * weight;
                    g += tempData[pixelIndex + 1] * weight;
                    b += tempData[pixelIndex + 2] * weight;
                }
            }
            const index = (y * width + x) * 4;
            data[index] = Math.min(255, Math.max(0, r));
            data[index + 1] = Math.min(255, Math.max(0, g));
            data[index + 2] = Math.min(255, Math.max(0, b));
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function resetEnhancements() {
    if (!originalImage) return;
    afterCtx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
    afterCtx.filter = 'none';
    afterCtx.drawImage(originalImage, 0, 0, afterCanvas.width, afterCanvas.height);
}

function downloadEnhancedImage() {
    if (!originalImage) {
        alert("पहले फोटो एन्हांस करें!");
        return;
    }
    const link = document.createElement('a');
    link.download = 'enhanced-photo.png';
    link.href = afterCanvas.toDataURL('image/png');
    link.click();
}
