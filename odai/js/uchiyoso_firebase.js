import { db, ref, onValue, set, get } from './firebase-config.js';

window.uchiyosoRoomId = new URLSearchParams(window.location.search).get('room');
window.isHost = false;
window.roomHostId = null;

function getUchiyosoUserId() {
    let uid = localStorage.getItem('weby_user_id');
    if (!uid) {
        uid = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('weby_user_id', uid);
    }
    return uid;
}

window.uchiyosoUserId = getUchiyosoUserId();

window.createSharedRoom = async () => {
    if (!window.targets) window.targets = [];
    if (!window.questions) window.questions = [];

    const newRoomId = 'rm_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const roomRef = ref(db, 'uchiyoso_rooms/' + newRoomId);
    
    // Tag all current characters with this user's ID as owner if they don't have one
    window.targets.forEach(t => {
        if (!t.ownerId) t.ownerId = window.uchiyosoUserId;
    });

    const roomData = {
        hostId: window.uchiyosoUserId,
        targets: window.targets,
        questions: window.questions,
        createdAt: Date.now()
    };

    try {
        await set(roomRef, roomData);
        window.location.href = window.location.pathname + '?room=' + newRoomId;
    } catch (e) {
        console.error(e);
        if(window.showToast) window.showToast("ルームの作成に失敗しました", "error");
    }
};

window.copyRoomUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        if (window.showToast) window.showToast("ルームのURLをコピーしました", "success");
    });
};

window.uchiyosoSyncData = () => {
    if (!window.uchiyosoRoomId) return;
    
    window.targets.forEach(t => {
        if (!t.ownerId) t.ownerId = window.uchiyosoUserId;
    });

    const roomRef = ref(db, 'uchiyoso_rooms/' + window.uchiyosoRoomId);
    set(roomRef, {
        hostId: window.roomHostId || window.uchiyosoUserId,
        targets: window.targets,
        questions: window.questions,
        updatedAt: Date.now()
    }).catch(e => console.error(e));
};

// Initialize room listener
if (window.uchiyosoRoomId) {
    // Show room controls state
    const initRoomUI = () => {
        const urlInput = document.getElementById('room-url');
        const createBtn = document.getElementById('btn-create-room');
        const copyBtn = document.getElementById('btn-copy-room');
        
        if (urlInput && createBtn && copyBtn) {
            urlInput.value = window.location.href;
            urlInput.classList.remove('hidden');
            createBtn.classList.add('hidden');
            copyBtn.classList.remove('hidden');
            document.getElementById('room-controls').classList.remove('hidden');
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRoomUI);
    } else {
        initRoomUI();
    }

    const roomRef = ref(db, 'uchiyoso_rooms/' + window.uchiyosoRoomId);
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            window.roomHostId = data.hostId;
            window.isHost = (window.roomHostId === window.uchiyosoUserId);
            
            window.targets = data.targets || [];
            window.questions = data.questions || [];
            
            // Trigger re-renders if available
            if (window.renderList) window.renderList();
            if (window.renderSummary) window.renderSummary();
            
            // Re-build questions form in case themes changed
            if (window.buildQuestionsForm) {
                // If editing, re-select
                const oldEditingId = window.currentEditingId;
                window.buildQuestionsForm();
                if (oldEditingId && window.selectCharacter) {
                    window.selectCharacter(oldEditingId);
                }
            }
        } else {
            if (window.showToast) window.showToast("ルームが見つかりません。ローカルモードに戻ります。", "error");
            setTimeout(() => { window.location.href = window.location.pathname; }, 2000);
        }
    });
} else {
    // Local mode UI
    const initLocalUI = () => {
        const controls = document.getElementById('room-controls');
        if (controls) controls.classList.remove('hidden');
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLocalUI);
    } else {
        initLocalUI();
    }
}
