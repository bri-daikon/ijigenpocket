"// ä¾é ¼å®è¡ãã³ãã©
if (aiGenerateBtn) {
  aiGenerateBtn.addEventListener('click', async () => {
    const theme = aiThemeSelect.value;
    const numPlayers = parseInt(aiPlayersSelect.value, 10);
    const layoutType = aiLayoutSelect.value;
    const customPrompt = aiPromptInput ? aiPromptInput.value.trim() : '';
    const genBg = aiGenBgToggle ? aiGenBgToggle.checked : false;
    const genParts = aiGenPartsToggle ? aiGenPartsToggle.checked : false;
    
    // UIãã­ã¼ãç¶æã«ãã
    aiGenerateBtn.disabled = true;
    aiGenerateBtn.innerHTML = '<i data-lucide="loader" class="animate-spin mr-1.5 w-4 h-4"></i>ä½æä¸­...';
    if (typeof lucide !== 'undefined') lucide.createIcons();

    aiChatBox.innerHTML = '';
    aiChatBox.classList.remove('hidden');

    const apiKey = localStorage.getItem('stampToolApiKey');
    
    if (apiKey && (theme === 'custom' || customPrompt !== '')) {
      // ãªã¢ã«AIçæã¢ã¼ã
      addChatMessage(employees.takumi, `CEOããè¦æãæ¿ãã¾ããï¼ãªã¯ã¨ã¹ãã${customPrompt || theme}ãã«ã¤ãã¦ãããããã¢ãªã¤ã¨ç¸è«ãã¦æé©ãªé¨å±ãä½ãã¾ãï¼`);
      
      try {
        const responseText = await callGeminiApiForLayout(apiKey, theme, numPlayers, layoutType, customPrompt);
        let cleanedJson = responseText.replace(/```json|```/g, '').trim();
        const responseData = JSON.parse(cleanedJson);
        
        // è­°è«ã­ã°ãé æ¬¡è¡¨ç¤º
        const steps = responseData.discussion || [];
        for (let idx = 0; idx < steps.length; idx++) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const msg = steps[idx];
          const speakerObj = msg.speaker === 'aoi' ? employees.aoi : employees.takumi;
          addChatMessage(speakerObj, msg.text);
        }
        
        let bgImageUrl = null;
        if (genBg) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          addChatMessage(employees.aoi, "è¦æã«
<truncated 7037 bytes>