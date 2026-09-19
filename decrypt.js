document.addEventListener('DOMContentLoaded', () => {
    const inputCipher = document.getElementById('inputCipher');
    const decryptBtn = document.getElementById('decryptBtn');
    const decryptedSection = document.getElementById('decryptedSection');
    const outputDecrypted = document.getElementById('outputDecrypted');
    const newMessageBtn = document.getElementById('newMessageBtn');
    const copyDecryptedBtn = document.getElementById('copyDecryptedBtn');
    const copyPageLinkBtn = document.getElementById('copyPageLinkBtn');
    const toast = document.getElementById('toast');

    const ZWSP = '\u200B'; 
    const ZWNJ = '\u200C'; 
    const ZWJ = '\u200D'; 
    const BOM = '\uFEFF'; 

    // دالة حساب checksum (نفس المستخدمة في التشفير)
    function calculateChecksum(bytes) {
        let checksum = 0;
        for (let i = 0; i < bytes.length; i++) {
            checksum = ((checksum << 5) - checksum + bytes[i]) | 0;
        }
        return checksum & 0xFF;
    }

    function zeroWidthToText(zeroWidth) {
        // إزالة ¦ من البداية والنهاية
        let clean = zeroWidth.replace(/^¦|¦$/g, '');
        
        // إزالة علامات النهاية
        clean = clean.replace(new RegExp(`[${ZWJ}${BOM}]`, 'g'), '');
        
        let binary = '';
        for (let char of clean) {
            if (char === ZWSP) binary += '0';
            else if (char === ZWNJ) binary += '1';
        }

        // يجب أن يكون الطول على الأقل 16 (8 للرسالة + 8 للـ checksum)
        if (binary.length < 16 || binary.length % 8 !== 0) {
            return 'خطأ: النص المشفر غير صالح أو تالف.';
        }

        // استخراج checksum (آخر 8 بتات)
        const checksumBinary = binary.substr(binary.length - 8, 8);
        const receivedChecksum = parseInt(checksumBinary, 2);
        
        // البايتات الفعلية (كل شيء ما عدا آخر 8 بتات)
        const dataBinary = binary.substr(0, binary.length - 8);
        
        // تحويل binary إلى bytes
        const bytes = new Uint8Array(dataBinary.length / 8);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(dataBinary.substr(i * 8, 8), 2);
        }
        
        // حساب checksum الفعلي
        const calculatedChecksum = calculateChecksum(bytes);
        
        // التحقق من صحة الرسالة
        if (calculatedChecksum !== receivedChecksum) {
            return '⚠️ تم تعديل الرسالة أو أنها تالفة';
        }

        // فك التشفير باستخدام TextDecoder
        try {
            const decoder = new TextDecoder();
            return decoder.decode(bytes);
        } catch (e) {
            return 'خطأ: فشل فك التشفير';
        }
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    decryptBtn.addEventListener('click', () => {
        const cipher = inputCipher.value;
        if (!cipher.trim()) {
            showToast('الرجاء لصق الرسالة المشفرة أولاً');
            return;
        }
        
        const decrypted = zeroWidthToText(cipher);
        outputDecrypted.textContent = decrypted;
        decryptedSection.classList.remove('hidden');
        
        if (decrypted === '⚠️ تم تعديل الرسالة أو أنها تالفة') {
            showToast('الرسالة تم تعديلها');
        } else {
            showToast('تم فك التشفير بنجاح');
        }
    });

    newMessageBtn.addEventListener('click', () => {
        inputCipher.value = '';
        outputDecrypted.textContent = '';
        decryptedSection.classList.add('hidden');
        inputCipher.focus();
        showToast('تم المسح');
    });

    copyDecryptedBtn.addEventListener('click', () => {
        const text = outputDecrypted.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast('تم نسخ الرسالة');
        });
    });

    copyPageLinkBtn.addEventListener('click', () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl).then(() => {
            showToast('تم نسخ رابط الصفحة');
        });
    });
});
