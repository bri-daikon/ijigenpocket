        // ==========================
        // キャラクター相関図（vis-network）
        // ==========================
        let relationNetwork = null;
        let relationNodes = new vis.DataSet();
        let relationEdges = new vis.DataSet();

        function switchCompareView(view) {
            if (view === 'table') {
                document.getElementById('compareView_table').classList.remove('hidden');
                document.getElementById('compareView_relation').classList.add('hidden');
                document.getElementById('viewTab_table').classList.replace('border-transparent', 'border-amber-500');
                document.getElementById('viewTab_table').classList.replace('text-stone-500', 'text-amber-400');
                document.getElementById('viewTab_relation').classList.replace('border-amber-500', 'border-transparent');
                document.getElementById('viewTab_relation').classList.replace('text-amber-400', 'text-stone-500');
            } else {
                document.getElementById('compareView_table').classList.add('hidden');
                document.getElementById('compareView_relation').classList.remove('hidden');
                document.getElementById('viewTab_relation').classList.replace('border-transparent', 'border-amber-500');
                document.getElementById('viewTab_relation').classList.replace('text-stone-500', 'text-amber-400');
                document.getElementById('viewTab_table').classList.replace('border-amber-500', 'border-transparent');
                document.getElementById('viewTab_table').classList.replace('text-amber-400', 'text-stone-500');
                
                if (!relationNetwork) {
                    initRelationNetwork();
                }
                syncRelationNodes(); // 常に最新の選択状態を反映
            }
        }

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
                    font: { color: '#fbbf24', size: 14, face: 'M PLUS Rounded 1c', strokeWidth: 3, strokeColor: '#1c1917', multi: true },
                    borderWidth: 2,
                    color: { border: '#b45309', background: '#292524', highlight: { border: '#fbbf24', background: '#451a03' } },
                    shadow: true
                },
                edges: {
                    font: { color: '#d6d3d1', size: 12, strokeWidth: 3, strokeColor: '#1c1917', align: 'horizontal' },
                    color: { color: '#9a3412', highlight: '#ea580c' },
                    arrows: { to: { enabled: true, scaleFactor: 0.8 } },
                    smooth: { type: 'dynamic' },
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

            // ノードのドラッグ終了時に位置を保存
            relationNetwork.on("dragEnd", function (params) {
                if (params.nodes.length > 0) {
                    saveRelationData();
                }
            });

            // ダブルクリックで関係性削除
            relationNetwork.on("doubleClick", function (params) {
                if (params.edges.length > 0 && params.nodes.length === 0) {
                    if (confirm("選択した関係性を削除しますか？")) {
                        relationEdges.remove(params.edges[0]);
                        saveRelationData();
                    }
                }
            });

            loadRelationData();
            updateRelationSelects();
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

        function syncRelationNodes() {
            const allSelectedChars = characters.filter(c => selectedIds.has(c.id));
            const currentNodes = relationNodes.getIds();
            const selectedSet = new Set(allSelectedChars.map(c => c.id));

            const toRemove = currentNodes.filter(id => !selectedSet.has(id));
            relationNodes.remove(toRemove);

            const toAdd = [];
            const savedPos = window._savedRelationPositions || {};
            
            allSelectedChars.forEach(c => {
                if (!currentNodes.includes(c.id)) {
                    let nodeObj = {
                        id: c.id,
                        label: '<b>' + c.name.split(/[\s　]+/)[0] + '</b>',
                        image: c.iconUrl || 'https://placehold.co/100x100/1c1917/fbbf24?text=No+Img',
                        brokenImage: 'https://placehold.co/100x100/1c1917/fbbf24?text=No+Img'
                    };
                    if (savedPos[c.id]) {
                        nodeObj.x = savedPos[c.id].x;
                        nodeObj.y = savedPos[c.id].y;
                    } else {
                        nodeObj.x = Math.random() * 400 - 200;
                        nodeObj.y = Math.random() * 400 - 200;
                    }
                    toAdd.push(nodeObj);
                }
            });
            if (toAdd.length > 0) relationNodes.add(toAdd);

            updateRelationSelects();
        }

        function updateRelationSelects() {
            const selectA = document.getElementById('relCharA');
            const selectB = document.getElementById('relCharB');
            if(!selectA || !selectB) return;

            const allSelectedChars = characters.filter(c => selectedIds.has(c.id));
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

        function addRelationship() {
            const idA = document.getElementById('relCharA').value;
            const idB = document.getElementById('relCharB').value;
            const label = document.getElementById('relLabel').value;

            if (!idA || !idB || !label) {
                showToast("キャラクターA、B、および関係性をすべて入力してください。", "error");
                return;
            }
            if (idA === idB) {
                showToast("同じキャラクター同士を繋ぐことはできません。", "error");
                return;
            }

            relationEdges.add({
                from: idA,
                to: idB,
                label: label,
                id: idA + '_' + idB + '_' + Date.now()
            });

            document.getElementById('relLabel').value = '';
            saveRelationData();
            showToast("関係性を追加しました。");
        }

        function downloadRelationChart() {
            if (!relationNetwork) return;
            const canvas = document.querySelector('#relationNetworkCanvas canvas');
            if (!canvas) return;

            const tempCanvas = document.createElement('canvas');
            const ctx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            ctx.fillStyle = '#090705';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas, 0, 0);

            const dataUrl = tempCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `関係性相関図_${new Date().getTime()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        const originalUpdateComparison = updateComparison;
        updateComparison = function() {
            originalUpdateComparison();
            if (document.getElementById('compareView_relation') && !document.getElementById('compareView_relation').classList.contains('hidden')) {
                syncRelationNodes();
            }
        };
