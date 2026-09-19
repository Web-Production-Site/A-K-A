document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const encryptBtn = document.getElementById('encryptBtn');
    const resultSection = document.getElementById('resultSection');
    const outputText = document.getElementById('outputText');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const openDecodeBtn = document.getElementById('openDecodeBtn');
    const newEncryptBtn = document.getElementById('newEncryptBtn');
    const toast = document.getElementById('toast');

    const ZWSP = '\u200B';
    const ZWNJ = '\u200C';
    const ZWJ = '\u200D';
    const BOM = '\uFEFF';

    let currentEncrypted = '';

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // دالة حساب checksum أقوى
    function calculateChecksum(bytes) {
        let checksum = 0;
        for (let i = 0; i < bytes.length; i++) {
            checksum = ((checksum << 5) - checksum + bytes[i]) | 0;
        }
        return checksum & 0xFF; // أخذ آخر 8 بتات فقط
    }

    encryptBtn.addEventListener('click', () => {
        const text = inputText.value;
        if (!text.trim()) {
            showToast('الرجاء كتابة رسالة أولاً');
            return;
        }
        
        const encoder = new TextEncoder();
        const bytes = encoder.encode(text);
        
        // حساب checksum
        const checksum = calculateChecksum(bytes);
        
        // تحويل البايتات إلى binary
        let binary = '';
        for (let byte of bytes) {
            binary += byte.toString(2).padStart(8, '0');
        }
        // إضافة checksum في النهاية
        binary += checksum.toString(2).padStart(8, '0');
        
        // تحويل إلى zero-width
        let zeroWidth = '';
        for (let bit of binary) {
            zeroWidth += (bit === '0') ? ZWSP : ZWNJ;
        }
        zeroWidth += ZWJ + BOM;
        
        // استخدام ¦ بدلاً من []
        currentEncrypted = '¦' + zeroWidth + '¦';
        outputText.textContent = currentEncrypted;
        resultSection.classList.remove('hidden');
        showToast('تم التشفير بنجاح');
    });

    copyTextBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentEncrypted).then(() => {
            showToast('تم نسخ الرسالة المشفرة');
        });
    });

    openDecodeBtn.addEventListener('click', () => {
        const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const link = baseUrl + 'decode.html';
        window.open(link, '_blank');
        showToast('تم فتح نافذة فك التشفير');
    });

    newEncryptBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.textContent = '';
        resultSection.classList.add('hidden');
        currentEncrypted = '';
        inputText.focus();
        showToast('تم المسح');
    });
});
