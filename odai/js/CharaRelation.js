        // --- データ管理 ---
        let characters = [];
        let relationNetwork = null;
        let relationNodes = new vis.DataSet();
        let relationEdges = new vis.DataSet();
        
        // ローカルストレージキー
        const SELECTED_CHARS_KEY = 'weby_trpg_relation_selected_ids';
        const GUEST_CHARS_KEY = 'weby_trpg_relation_guests';
        const GROUPS_KEY = 'weby_trpg_relation_groups';
        let selectedIds = new Set();
        let guestCharacters = [];

        // 起動処理
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            loadCharacters();
            loadSelections();
            loadGroups();
            initRelationNetwork();
            renderCharacterList();
        });

        // ==========================
        // UI操作・データ読み込み
        // ==========================
        function loadCharacters() {
            const data = localStorage.getItem('weby_trpg_characters');
            if (data) {
                try {
                    characters = JSON.parse(data);
                } catch (e) {
                    console.error("データのパースに失敗しました", e);
                }
            }
            const guests = localStorage.getItem(GUEST_CHARS_KEY);
            if (guests) {
                try {
                    guestCharacters = JSON.parse(guests);
                } catch (e) {}
            }
        }

        function loadSelections() {
            const saved = localStorage.getItem(SELECTED_CHARS_KEY);
            if (saved) {
                try {
                    const ids = JSON.parse(saved);
                    selectedIds = new Set(ids);
                } catch(e) {}
            }
        }

        function saveSelections() {
            localStorage.setItem(SELECTED_CHARS_KEY, JSON.stringify(Array.from(selectedIds)));
            syncRelationNodes();
        }

        function toggleCharacter(id) {
            if (selectedIds.has(id)) {
                selectedIds.delete(id);
            } else {
                selectedIds.add(id);
            }
            saveSelections();
            renderCharacterList();
        }

        function clearAllSelections() {
            selectedIds.clear();
            saveSelections();
            renderCharacterList();
        }

        function getAllAvailableCharacters() {
            // IDの重複を防ぐため、Mapを使って一意にする（ゲストを優先）
            const map = new Map();
            if(characters) characters.forEach(c => map.set(c.id, c));
            if(guestCharacters) guestCharacters.forEach(c => map.set(c.id, c));
            return Array.from(map.values());
        }

        function renderCharacterList() {
            const container = document.getElementById('characterList');
            const searchKeyword = document.getElementById('charSearchInput').value.toLowerCase();
            
            container.innerHTML = '';

            const allChars = getAllAvailableCharacters();
            let filteredChars = allChars.filter(c => {
                const nameStr = c.name || '名無し';
                return nameStr.toLowerCase().includes(searchKeyword);
            });

            // ソート：チェック済みを上に、未チェックを下に
            filteredChars.sort((a, b) => {
                const aSelected = selectedIds.has(String(a.id)) || selectedIds.has(a.id);
                const bSelected = selectedIds.has(String(b.id)) || selectedIds.has(b.id);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                // どちらも同じ状態の場合はゲストを少し下に
                if (a.isGuest && !b.isGuest) return 1;
                if (!a.isGuest && b.isGuest) return -1;
                return 0;
            });

            if(filteredChars.length === 0) {
                container.innerHTML = '<div class="text-xs text-stone-600 text-center py-4">該当なし</div>';
                return;
            }

            filteredChars.forEach(c => {
                const isSelected = selectedIds.has(String(c.id)) || selectedIds.has(c.id);
                const isGuest = c.isGuest;
                
                const item = document.createElement('div');
                item.className = `flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors mb-1 border relative ${isSelected ? 'bg-amber-900/20 border-amber-700/50' : 'hover:bg-stone-900 border-transparent'}`;
                
                const iconHtml = c.iconUrl 
                    ? `<img src="${c.iconUrl}" class="w-8 h-8 rounded-full object-cover object-top border border-amber-900/50 shrink-0">` 
                    : `<div class="w-8 h-8 rounded-full bg-stone-800 border border-amber-900/50 flex items-center justify-center shrink-0"><i data-lucide="user" class="w-4 h-4 text-stone-500"></i></div>`;
                
                const checkboxHtml = `
                    <div class="w-4 h-4 rounded border ${isSelected ? 'bg-amber-600 border-amber-500 text-white' : 'border-stone-600 bg-stone-900'} flex items-center justify-center shrink-0 transition-colors" onclick="toggleCharacter('${c.id}'); event.stopPropagation();">
                        ${isSelected ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
                    </div>
                `;
                
                // 名前の全表示
                const nameStr = c.name || '名無し';

                const guestBadge = isGuest ? `<span class="text-[9px] bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 px-1 py-0.5 rounded ml-1 font-mono shrink-0">GUEST</span>` : '';
                const deleteBtn = isGuest ? `<button onclick="deleteGuest('${c.id}'); event.stopPropagation();" class="absolute right-2 text-stone-600 hover:text-red-400 shrink-0 bg-[#0e0b08]/80 p-0.5 rounded" title="ゲスト削除"><i data-lucide="x" class="w-4 h-4"></i></button>` : '';

                item.innerHTML = `
                    ${checkboxHtml}
                    ${iconHtml}
                    <div class="text-xs font-bold ${isSelected ? 'text-amber-200' : 'text-stone-400'} break-words whitespace-normal pr-6 leading-tight" title="${c.name}">${nameStr}${guestBadge}</div>
                    ${deleteBtn}
                `;
                
                // 行全体をクリックでチェック切り替え
                item.onclick = (e) => {
                    if (e.target.closest('button')) return;
                    toggleCharacter(c.id);
                };
                
                container.appendChild(item);
            });
            lucide.createIcons({root: container});
        }

        // ==========================
        // ゲスト機能
        // ==========================
        function toggleGuestIconInput() {
            const iconType = document.querySelector('input[name="guestIconType"]:checked').value;
            const urlWrapper = document.getElementById('guestIconUrlWrapper');
            const emojiWrapper = document.getElementById('guestIconEmojiWrapper');
            if (iconType === 'emoji') {
                urlWrapper.classList.add('hidden');
                emojiWrapper.classList.remove('hidden');
            } else {
                urlWrapper.classList.remove('hidden');
                emojiWrapper.classList.add('hidden');
            }
        }

        function openGuestModal() {
            document.getElementById('guestModal').classList.remove('hidden');
            document.querySelector('input[name="guestIconType"][value="url"]').checked = true;
            toggleGuestIconInput();
        }

        function closeGuestModal() {
            document.getElementById('guestModal').classList.add('hidden');
            document.getElementById('guestName').value = '';
            document.getElementById('guestIcon').value = '';
            document.getElementById('guestEmoji').value = '';
        }

        function emojiToDataURL(emoji) {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            // 背景を描画（円形）
            ctx.fillStyle = '#292524';
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2);
            ctx.fill();
            
            // 絵文字を描画
            ctx.font = '60px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, 50, 55);
            
            return canvas.toDataURL('image/png');
        }

        function addGuestCharacter() {
            const name = document.getElementById('guestName').value.trim();
            if (!name) {
                showToast("名前を入力してください", "error");
                return;
            }

            const iconType = document.querySelector('input[name="guestIconType"]:checked').value;
            let iconUrl = '';

            if (iconType === 'emoji') {
                let emoji = document.getElementById('guestEmoji').value.trim();
                // もし絵文字が入力されていなければ、名前の1文字目をアイコンにする
                if (!emoji) {
                    emoji = name.charAt(0);
                }
                iconUrl = emojiToDataURL(emoji);
            } else {
                iconUrl = document.getElementById('guestIcon').value.trim();
            }
            
            const newGuest = {
                id: 'guest_' + Date.now(),
                name: name,
                iconUrl: iconUrl,
                isGuest: true
            };
            
            guestCharacters.push(newGuest);
            localStorage.setItem(GUEST_CHARS_KEY, JSON.stringify(guestCharacters));
            
            // 自動的に選択状態にする
            selectedIds.add(newGuest.id);
            saveSelections();
            
            closeGuestModal();
            renderCharacterList();
            showToast(`${name} をゲストとして追加しました`);
        }

        function deleteGuest(id) {
            if (!confirm("このゲストキャラクターを削除しますか？")) return;
            guestCharacters = guestCharacters.filter(g => g.id !== id);
            localStorage.setItem(GUEST_CHARS_KEY, JSON.stringify(guestCharacters));
            
            selectedIds.delete(id);
            saveSelections();
            
            // エッジのクリーンアップも必要
            const edgesToRemove = relationEdges.get({
                filter: function (item) {
                    return item.from === id || item.to === id;
                }
            });
            relationEdges.remove(edgesToRemove);
            saveRelationData();
            
            renderCharacterList();
        }

        // ==========================
        // グループ（枠）機能
        // ==========================
        let relationGroups = [];
        
        function loadGroups() {
            const saved = localStorage.getItem(GROUPS_KEY);
            if (saved) {
                try {
                    relationGroups = JSON.parse(saved);
                } catch(e) {}
            }
            window._relationGroups = relationGroups;
        }
        
        function saveGroups() {
            localStorage.setItem(GROUPS_KEY, JSON.stringify(relationGroups));
            window._relationGroups = relationGroups;
            if (relationNetwork) relationNetwork.redraw();
            renderGroupList();
        }

        function toggleGroupPanel() {
            const panel = document.getElementById('groupPanel');
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                renderGroupList();
            }
        }
        
        function addGroup() {
            const name = document.getElementById('groupName').value.trim();
            const color = document.getElementById('groupColor').value;
            const style = document.getElementById('groupStyle').value;
            
            if (!name) {
                showToast("枠の名前を入力してください", "error");
                return;
            }
            
            const newGroup = {
                id: 'group_' + Date.now(),
                name: name,
                color: color,
                style: style,
                nodes: []
            };
            
            relationGroups.push(newGroup);
            saveGroups();
            document.getElementById('groupName').value = '';
            showToast(`枠「${name}」を作成しました`);
        }

        function deleteGroup(id) {
            if (!confirm("この枠を削除しますか？（キャラクターは削除されません）")) return;
            relationGroups = relationGroups.filter(g => g.id !== id);
            saveGroups();
        }

        function addNodeToGroup(groupId, nodeId) {
            const group = relationGroups.find(g => g.id === groupId);
            if (group && !group.nodes.includes(nodeId)) {
                group.nodes.push(nodeId);
                saveGroups();
            }
        }
        
        function removeNodeFromGroup(groupId, nodeId) {
            const group = relationGroups.find(g => g.id === groupId);
            if (group) {
                group.nodes = group.nodes.filter(id => id !== nodeId);
                saveGroups();
            }
        }

        function renderGroupList() {
            const container = document.getElementById('groupListArea');
            if (!container) return;
            container.innerHTML = '';
            
            if (relationGroups.length === 0) {
                container.innerHTML = '<div class="text-[10px] text-stone-500 text-center mt-2">作成された枠はありません</div>';
                return;
            }
            
            // 現在キャンバスにいるノード
            const currentNodes = relationNodes.getIds();
            const allChars = getAllAvailableCharacters();
            
            relationGroups.forEach(group => {
                const div = document.createElement('div');
                div.className = 'mb-3 bg-stone-900/50 p-2 rounded border border-stone-800';
                
                let nodesHtml = '';
                group.nodes.forEach(nodeId => {
                    if (currentNodes.includes(nodeId)) {
                        const c = allChars.find(ch => ch.id === nodeId);
                        if (c) {
                            nodesHtml += `
                                <span class="inline-flex items-center gap-1 bg-stone-800 text-[10px] px-1.5 py-0.5 rounded text-stone-300 border border-stone-700 mr-1 mb-1 max-w-full">
                                    <span class="truncate">${c.name}</span>
                                    <button onclick="removeNodeFromGroup('${group.id}', '${nodeId}')" class="text-stone-500 hover:text-red-400 shrink-0"><i data-lucide="x" class="w-3 h-3"></i></button>
                                </span>
                            `;
                        }
                    }
                });
                
                // 追加用セレクトボックス作成
                let selectHtml = `<select onchange="if(this.value) addNodeToGroup('${group.id}', this.value); this.value='';" class="w-full bg-[#0a0806] border border-amber-950/60 rounded p-1 text-[10px] text-amber-200 mt-1 focus:outline-none">
                    <option value="">+ キャラクターを追加</option>
                `;
                currentNodes.forEach(nodeId => {
                    if (!group.nodes.includes(nodeId)) {
                        const c = allChars.find(ch => ch.id === nodeId);
                        if (c) selectHtml += `<option value="${c.id}">${c.name}</option>`;
                    }
                });
                selectHtml += `</select>`;

                div.innerHTML = `
                    <div class="flex justify-between items-center mb-1">
                        <div class="flex items-center gap-1.5">
                            <div class="w-3 h-3 rounded-full" style="background-color: ${group.color}"></div>
                            <span class="text-xs font-bold text-stone-300">${group.name}</span>
                        </div>
                        <button onclick="deleteGroup('${group.id}')" class="text-stone-500 hover:text-red-400"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                    </div>
                    <div class="flex flex-wrap mt-1">
                        ${nodesHtml}
                    </div>
                    ${selectHtml}
                `;
                container.appendChild(div);
            });
            lucide.createIcons({root: container});
        }

        // ==========================
        // 相関図（vis-network）処理
        // ==========================
        function initRelationNetwork() {
            const container = document.getElementById('relationNetworkCanvas');
            const data = {
                nodes: relationNodes,
                edges: relationEdges
            };
            const options = {
                nodes: {
                    shape: 'circularImage',
                    size: 35,
                    font: { color: '#fbbf24', size: 14, face: 'M PLUS Rounded 1c', strokeWidth: 3, strokeColor: '#1c1917', multi: true, vadjust: -5 },
                    borderWidth: 2,
                    color: { border: '#b45309', background: '#292524', highlight: { border: '#fbbf24', background: '#451a03' } },
                    shadow: true,
                    shapeProperties: {
                        useBorderWithImage: true
                    }
                },
                edges: {
                    font: { color: '#d6d3d1', size: 12, strokeWidth: 3, strokeColor: '#1c1917', align: 'horizontal' },
                    color: { color: '#9a3412', highlight: '#ea580c' },
                    arrows: { to: { enabled: true, scaleFactor: 0.8 } },
                    // 重なりを解消するためにカーブさせる
                    smooth: { type: 'curvedCW', roundness: 0.2 },
                    width: 2
                },
                physics: {
                    enabled: false
                },
                interaction: {
                    dragNodes: true,
                    hover: true
                }
            };
            relationNetwork = new vis.Network(container, data, options);

            // 背景枠（グループ）の描画
            relationNetwork.on("beforeDrawing", function (ctx) {
                const groups = window._relationGroups || [];
                groups.forEach(group => {
                    const nodeIds = group.nodes;
                    if (!nodeIds || nodeIds.length === 0) return;
                    
                    const positions = relationNetwork.getPositions(nodeIds);
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    
                    nodeIds.forEach(id => {
                        const pos = positions[id];
                        if (pos) {
                            if (pos.x < minX) minX = pos.x;
                            if (pos.y < minY) minY = pos.y;
                            if (pos.x > maxX) maxX = pos.x;
                            if (pos.y > maxY) maxY = pos.y;
                        }
                    });

                    if (minX !== Infinity) {
                        const padding = 55;
                        minX -= padding;
                        minY -= padding;
                        maxX += padding;
                        maxY += padding;
                        const width = maxX - minX;
                        const height = maxY - minY;

                        ctx.save();
                        // Draw background
                        ctx.fillStyle = group.color ? group.color + '1a' : 'rgba(217, 119, 6, 0.1)'; 
                        
                        // Set line dash
                        if (group.style === 'dashed') {
                            ctx.setLineDash([8, 6]);
                        } else {
                            ctx.setLineDash([]);
                        }
                        
                        ctx.strokeStyle = group.color || '#d97706';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        if(ctx.roundRect) {
                            ctx.roundRect(minX, minY, width, height, 20);
                        } else {
                            ctx.rect(minX, minY, width, height); // fallback
                        }
                        ctx.fill();
                        ctx.stroke();

                        // Draw label
                        ctx.setLineDash([]);
                        ctx.fillStyle = group.color || '#d97706';
                        ctx.font = 'bold 16px "M PLUS Rounded 1c"';
                        ctx.fillText(group.name, minX + 15, minY + 25);
                        ctx.restore();
                    }
                });
            });

            // ノードのドラッグ終了時に位置を保存
            relationNetwork.on("dragEnd", function (params) {
                if (params.nodes.length > 0) {
                    saveRelationData();
                }
            });

            // ダブルクリックで関係性編集
            relationNetwork.on("doubleClick", function (params) {
                if (params.edges.length > 0 && params.nodes.length === 0) {
                    openEditEdgeModal(params.edges[0]);
                }
            });

            // 右クリックで関係性編集
            relationNetwork.on("oncontext", function (params) {
                const edgeId = relationNetwork.getEdgeAt(params.pointer.DOM);
                const nodeId = relationNetwork.getNodeAt(params.pointer.DOM);
                if (edgeId && !nodeId) {
                    params.event.preventDefault();
                    openEditEdgeModal(edgeId);
                }
            });

            loadRelationData();
            syncRelationNodes();
        }

        function loadRelationData() {
            const savedEdges = localStorage.getItem('weby_trpg_relationships_edges');
            const savedPositions = localStorage.getItem('weby_trpg_relationships_positions');
            
            if (savedEdges) {
                try {
                    const parsed = JSON.parse(savedEdges);
                    relationEdges.clear();
                    relationEdges.add(parsed);
                } catch(e) { console.error(e); }
            }
            if (savedPositions) {
                try {
                    window._savedRelationPositions = JSON.parse(savedPositions);
                } catch(e) { console.error(e); }
            } else {
                window._savedRelationPositions = {};
            }
        }

        function saveRelationData() {
            const edges = relationEdges.get();
            localStorage.setItem('weby_trpg_relationships_edges', JSON.stringify(edges));
            
            if (relationNetwork) {
                const positions = relationNetwork.getPositions();
                const saved = window._savedRelationPositions || {};
                for (let id in positions) {
                    saved[id] = positions[id];
                }
                window._savedRelationPositions = saved;
                localStorage.setItem('weby_trpg_relationships_positions', JSON.stringify(saved));
            }
        }

        function processAndCropImage(id, dataUrl) {
            const img = new Image();
            img.onload = () => {
                const size = Math.min(img.width, img.height);
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                // Landscapeの場合は中央、Portraitの場合は上部(顔周辺)を基準にクロップ
                const sx = img.width > img.height ? (img.width - size) / 2 : 0;
                const sy = 0; 
                ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
                relationNodes.update({ id: id, image: canvas.toDataURL('image/png') });
            };
            img.src = dataUrl;
        }

        // Base64に変換してCanvas汚染を防ぐ非同期関数
        async function loadSafeImage(id, url) {
            if (!url) return;
            if (url.startsWith('data:')) {
                processAndCropImage(id, url);
                return;
            }

            // 1. まずは直接読み込みを試す（image.iaproject.app 等、CORS許可されているサーバー用）
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        processAndCropImage(id, reader.result);
                    };
                    reader.readAsDataURL(blob);
                    return; // 成功したら終了
                }
            } catch (e) {
                console.warn(`Direct fetch failed: ${url}`, e);
            }

            // 2. 直接読み込みが失敗した場合のみ、中継サーバーを順番に試す
            const proxies = [
                `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
                `https://corsproxy.io/?${encodeURIComponent(url)}`,
                `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
            ];

            for (const proxyUrl of proxies) {
                try {
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        const blob = await response.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            processAndCropImage(id, reader.result);
                        };
                        reader.readAsDataURL(blob);
                        return;
                    }
                } catch (e) {
                    console.warn(`Proxy failed: ${proxyUrl}`, e);
                }
            }

            console.warn("All image loading methods failed, falling back to direct URL. Canvas WILL be tainted.");
            // 失敗した場合はCanvas汚染覚悟で直接画像を読み込む（画像は表示されるが保存時にエラーになる）
            processAndCropImage(id, url);
        }

        function syncRelationNodes() {
            const allChars = getAllAvailableCharacters();
            const allSelectedChars = allChars.filter(c => selectedIds.has(String(c.id)) || selectedIds.has(c.id));
            const currentNodes = relationNodes.getIds().map(String);
            const selectedSet = new Set(allSelectedChars.map(c => String(c.id)));

            // 削除すべきノード
            const toRemove = relationNodes.getIds().filter(id => !selectedSet.has(String(id)));
            relationNodes.remove(toRemove);

            // 追加すべきノード、更新すべきノード
            const toAdd = [];
            const toUpdate = [];
            const savedPos = window._savedRelationPositions || {};
            
            const loadingSvg = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23292524'/%3E%3Ctext x='50' y='50' fill='%23fbbf24' font-size='12' text-anchor='middle' alignment-baseline='middle'%3ELoading...%3C/text%3E%3C/svg%3E";
            const noImgSvg = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23292524'/%3E%3Ctext x='50' y='50' fill='%23fbbf24' font-size='14' text-anchor='middle' alignment-baseline='middle'%3ENo Img%3C/text%3E%3C/svg%3E";

            const addedIds = new Set(); // ループ内での重複追加を完全防止
            const loadTasks = []; // 画像読み込みタスクを後でまとめて実行する

            allSelectedChars.forEach(c => {
                const strId = String(c.id);
                if (!addedIds.has(strId)) {
                    addedIds.add(strId);
                    let originalImg = c.iconUrl || noImgSvg;
                    const nameStr = c.name || '名無し';
                    
                    // 名前のスペースを改行に変換して、キャンバス上で折り返して表示
                    const formattedName = nameStr.replace(/[\s　]+/g, '\n');

                    let nodeObj = {
                        id: strId, // 強制的に文字列にする
                        label: `*${formattedName}*`,
                        brokenImage: noImgSvg
                    };

                    if (!currentNodes.includes(strId)) {
                        nodeObj.image = loadingSvg;
                        if (savedPos[strId] || savedPos[c.id]) {
                            const pos = savedPos[strId] || savedPos[c.id];
                            nodeObj.x = pos.x;
                            nodeObj.y = pos.y;
                        } else {
                            // ランダム初期配置（広いキャンバス用）
                            nodeObj.x = (Math.random() - 0.5) * 800;
                            nodeObj.y = (Math.random() - 0.5) * 600;
                        }
                        toAdd.push(nodeObj);
                        loadTasks.push({ id: strId, url: originalImg });
                    } else {
                        toUpdate.push(nodeObj);
                        const existingNode = relationNodes.get(strId);
                        if (!existingNode.image || existingNode.image === loadingSvg || existingNode.image === noImgSvg) {
                            loadTasks.push({ id: strId, url: originalImg });
                        }
                    }
                }
            });
            
            if (toAdd.length > 0) {
                try {
                    relationNodes.add(toAdd);
                } catch(e) {
                    console.error("Batch add failed, trying individually:", e);
                    toAdd.forEach(node => {
                        try { relationNodes.add(node); } catch(err) {}
                    });
                }
            }
            if (toUpdate.length > 0) {
                try {
                    relationNodes.update(toUpdate);
                } catch(e) {}
            }

            // 全てのノードがキャンバスに登録された後に、安全に画像を更新する
            loadTasks.forEach(task => {
                loadSafeImage(task.id, task.url);
            });

            updateRelationSelects(allSelectedChars);
            
            // グループ再描画
            if(relationNetwork) relationNetwork.redraw();
            renderGroupList();
        }

        function updateRelationSelects(allSelectedChars) {
            const selectA = document.getElementById('relCharA');
            const selectB = document.getElementById('relCharB');
            if(!selectA || !selectB) return;

            let html = '<option value="">▼ キャラクターを選択</option>';
            allSelectedChars.forEach(c => {
                html += `<option value="${c.id}">${c.name}</option>`;
            });

            const valA = selectA.value;
            const valB = selectB.value;
            selectA.innerHTML = html;
            selectB.innerHTML = html;
            selectA.value = valA;
            selectB.value = valB;
        }

        function swapRelationChars() {
            const selectA = document.getElementById('relCharA');
            const selectB = document.getElementById('relCharB');
            if (!selectA || !selectB) return;
            const temp = selectA.value;
            selectA.value = selectB.value;
            selectB.value = temp;
        }

        function addRelationship() {
            const idA = document.getElementById('relCharA').value;
            const idB = document.getElementById('relCharB').value;
            const label = document.getElementById('relLabel').value;
            const color = document.getElementById('relColor').value;
            const style = document.getElementById('relStyle').value;
            const arrow = document.getElementById('relArrow').value;

            if (!idA || !idB || !label) {
                showToast("キャラクターA、B、および関係性をすべて入力してください。", "error");
                return;
            }
            if (idA === idB) {
                showToast("同じキャラクター同士を繋ぐことはできません。", "error");
                return;
            }

            let edgeObj = {
                from: idA,
                to: idB,
                label: label,
                id: `${idA}_${idB}_${Date.now()}`,
                color: { color: color, highlight: color },
                font: { color: '#d6d3d1' }, // label color
                arrows: arrow === 'none' ? '' : (arrow === 'both' ? 'to, from' : arrow)
            };
            
            if (style === 'dashed') {
                edgeObj.dashes = [5, 5];
                edgeObj.width = 2;
            } else if (style === 'thick') {
                edgeObj.width = 5;
            } else {
                edgeObj.width = 2;
                edgeObj.dashes = false;
            }

            relationEdges.add(edgeObj);

            document.getElementById('relLabel').value = '';
            saveRelationData();
            showToast("関係性を追加しました。");
        }

        function downloadRelationChart() {
            if (!relationNetwork) return;
            const canvas = document.querySelector('#relationNetworkCanvas canvas');
            if (!canvas) return;

            try {
                const tempCanvas = document.createElement('canvas');
                const ctx = tempCanvas.getContext('2d');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;

                // 背景色を塗る
                ctx.fillStyle = '#050403';
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                ctx.drawImage(canvas, 0, 0);

                const dataUrl = tempCanvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `関係性相関図_${new Date().getTime()}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error("Canvas export failed:", err);
                showToast("画像保存に失敗しました。外部アイコン画像によるセキュリティ制限(CORS)の可能性があります。スクリーンショット機能をご利用ください。", "error");
            }
        }

        // ==========================
        // 関係性（エッジ）管理機能
        // ==========================
        function toggleRelationListPanel() {
            const panel = document.getElementById('relationListPanel');
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                renderRelationList();
            }
        }

        function renderRelationList() {
            const container = document.getElementById('relationListArea');
            if (!container) return;
            container.innerHTML = '';
            
            const edges = relationEdges.get();
            if (edges.length === 0) {
                container.innerHTML = '<div class="text-[10px] text-stone-500 text-center mt-2">結ばれた関係性はありません</div>';
                return;
            }
            
            const allChars = getAllAvailableCharacters();
            
            edges.forEach(edge => {
                const nodeA = allChars.find(c => String(c.id) === String(edge.from));
                const nodeB = allChars.find(c => String(c.id) === String(edge.to));
                if(!nodeA || !nodeB) return;

                const nameA = (nodeA.name || '名無し').split(/[\s　]+/)[0];
                const nameB = (nodeB.name || '名無し').split(/[\s　]+/)[0];
                let arrowText = '->';
                if(edge.arrows && edge.arrows.includes('from') && edge.arrows.includes('to')) arrowText = '<->';
                else if(!edge.arrows) arrowText = '-';

                const div = document.createElement('div');
                div.className = 'bg-stone-900/50 p-2 rounded border border-stone-800 flex items-center justify-between';
                
                div.innerHTML = `
                    <div class="flex-grow truncate pr-2">
                        <div class="text-[10px] text-stone-400 font-bold mb-0.5">${nameA} ${arrowText} ${nameB}</div>
                        <div class="flex items-center gap-1.5">
                            <div class="w-2.5 h-2.5 rounded-full" style="background-color: ${edge.color ? (edge.color.color || edge.color) : '#ea580c'}"></div>
                            <span class="text-xs text-amber-200 truncate">${edge.label}</span>
                        </div>
                    </div>
                    <div class="flex gap-1 shrink-0">
                        <button onclick="openEditEdgeModal('${edge.id}')" class="p-1.5 text-stone-400 hover:text-amber-400 bg-stone-800 hover:bg-stone-700 rounded transition-colors" title="編集">
                            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                        </button>
                        <button onclick="deleteRelationship('${edge.id}')" class="p-1.5 text-stone-400 hover:text-red-400 bg-stone-800 hover:bg-stone-700 rounded transition-colors" title="削除">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                `;
                container.appendChild(div);
            });
            lucide.createIcons({root: container});
        }

        function deleteRelationship(edgeId) {
            if (confirm("この関係性を削除しますか？")) {
                relationEdges.remove(edgeId);
                saveRelationData();
                renderRelationList();
            }
        }

        function openEditEdgeModal(edgeId) {
            const edge = relationEdges.get(edgeId);
            if (!edge) return;
            
            const allChars = getAllAvailableCharacters();
            const nodeA = allChars.find(c => String(c.id) === String(edge.from));
            const nodeB = allChars.find(c => String(c.id) === String(edge.to));
            const nameA = nodeA ? (nodeA.name || '名無し').split(/[\s　]+/)[0] : '不明';
            const nameB = nodeB ? (nodeB.name || '名無し').split(/[\s　]+/)[0] : '不明';

            document.getElementById('editEdgeId').value = edge.id;
            document.getElementById('editEdgeNodesLabel').textContent = `${nameA} - ${nameB}`;
            document.getElementById('editEdgeLabel').value = edge.label;
            document.getElementById('editEdgeColor').value = edge.color ? (edge.color.color || edge.color) : '#ea580c';
            
            let arrowVal = 'none';
            if (edge.arrows) {
                if (edge.arrows.includes('to') && edge.arrows.includes('from')) arrowVal = 'both';
                else if (edge.arrows.includes('to') || edge.arrows === 'to') arrowVal = 'to';
            }
            document.getElementById('editEdgeArrow').value = arrowVal;
            
            let styleVal = 'solid';
            if (edge.width === 5) styleVal = 'thick';
            else if (edge.dashes) styleVal = 'dashed';
            document.getElementById('editEdgeStyle').value = styleVal;

            document.getElementById('editEdgeModal').classList.remove('hidden');
        }

        function closeEditEdgeModal() {
            document.getElementById('editEdgeModal').classList.add('hidden');
        }

        function deleteEditEdge() {
            const edgeId = document.getElementById('editEdgeId').value;
            if (confirm("この関係性を削除しますか？")) {
                relationEdges.remove(edgeId);
                saveRelationData();
                renderRelationList();
                closeEditEdgeModal();
                showToast("関係性を削除しました。");
            }
        }

        function saveEditEdge() {
            const edgeId = document.getElementById('editEdgeId').value;
            const label = document.getElementById('editEdgeLabel').value;
            const color = document.getElementById('editEdgeColor').value;
            const arrow = document.getElementById('editEdgeArrow').value;
            const style = document.getElementById('editEdgeStyle').value;

            if (!label) {
                showToast("関係性を入力してください。", "error");
                return;
            }

            const edgeObj = relationEdges.get(edgeId);
            if (!edgeObj) return;

            edgeObj.label = label;
            edgeObj.color = { color: color, highlight: color };
            edgeObj.arrows = arrow === 'none' ? '' : (arrow === 'both' ? 'to, from' : arrow);

            if (style === 'dashed') {
                edgeObj.dashes = [5, 5];
                edgeObj.width = 2;
            } else if (style === 'thick') {
                edgeObj.width = 5;
                edgeObj.dashes = false;
            } else {
                edgeObj.width = 2;
                edgeObj.dashes = false;
            }

            relationEdges.update(edgeObj);
            saveRelationData();
            renderRelationList();
            closeEditEdgeModal();
            showToast("関係性を更新しました。");
        }

        // ==========================
        // トースト通知（共通）
        // ==========================
        function showToast(message, type = 'success') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            
            const isError = type === 'error';
            const bgColor = isError ? 'bg-red-950/90' : 'bg-emerald-950/90';
            const borderColor = isError ? 'border-red-900' : 'border-emerald-900';
            const textColor = isError ? 'text-red-200' : 'text-emerald-200';
            const icon = isError ? 'alert-circle' : 'check-circle';
            
            toast.className = `${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-y-full opacity-0 font-header text-sm tracking-wider`;
            
            toast.innerHTML = `
                <i data-lucide="${icon}" class="w-5 h-5"></i>
                <span>${message}</span>
            `;
            
            container.appendChild(toast);
            lucide.createIcons({ root: toast });
            
            setTimeout(() => {
                toast.classList.remove('translate-y-full', 'opacity-0');
            }, 10);
            
            setTimeout(() => {
                toast.classList.add('translate-y-full', 'opacity-0');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }
