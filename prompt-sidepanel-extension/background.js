// QuickPrompt SidePanel - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  // ツールバーのアクションアイコンをクリックした際にサイドパネルを開く設定
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
    console.error("Failed to set panel behavior:", error);
  });
});
