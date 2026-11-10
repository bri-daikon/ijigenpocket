using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: System.Reflection.AssemblyTitle("セショサポ")]
[assembly: System.Reflection.AssemblyVersion("2.0.3.0")]
[assembly: System.Reflection.AssemblyFileVersion("2.0.3.0")]
[assembly: System.Reflection.AssemblyInformationalVersion("2.0.3")]

static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new ConverterWindow(args));
    }
}

sealed class ConverterWindow : Form
{
    const string Host = "pdfeasyconverter.local";
    readonly WebView2 view = new WebView2();
    readonly CheckBox topMostCheck = new CheckBox();
    readonly string root = AppDomain.CurrentDomain.BaseDirectory;
    readonly string preferenceFile = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "IjigenPocket", "PdfEasyConverter", "topmost.txt");
    readonly string testFolder;
    readonly string testScript;
    bool testing;
    bool closing;
    bool ready;

    public ConverterWindow(string[] args)
    {
        Text = "セショサポ — Windows版";
        ClientSize = new Size(1440, 920);
        MinimumSize = new Size(380, 500);
        StartPosition = FormStartPosition.CenterScreen;
        AutoScaleMode = AutoScaleMode.Dpi;
        bool keepOnTop = LoadTopMostPreference();
        TopMost = keepOnTop;
        topMostCheck.Text = "常に手前に表示";
        topMostCheck.Checked = keepOnTop;
        topMostCheck.Dock = DockStyle.Top;
        topMostCheck.Height = 30;
        topMostCheck.Padding = new Padding(10, 0, 0, 0);
        topMostCheck.BackColor = Color.FromArgb(241, 245, 249);
        topMostCheck.ForeColor = Color.FromArgb(51, 65, 85);
        topMostCheck.CheckedChanged += delegate
        {
            TopMost = topMostCheck.Checked;
            if (!testing) SaveTopMostPreference(topMostCheck.Checked);
        };
        view.Dock = DockStyle.Fill;
        Controls.Add(view);
        Controls.Add(topMostCheck);
        if (args.Length == 3 && args[0] == "--self-test")
        {
            testing = true;
            testFolder = Path.GetFullPath(args[1]);
            testScript = Path.GetFullPath(args[2]);
            Directory.CreateDirectory(testFolder);
            ShowInTaskbar = false;
            StartPosition = FormStartPosition.Manual;
            Location = new Point(-16000, -16000);
        }
        Shown += async delegate { await Initialize(); };
        FormClosing += OnClosing;
    }

    bool LoadTopMostPreference()
    {
        try
        {
            bool value;
            return !File.Exists(preferenceFile) || !bool.TryParse(File.ReadAllText(preferenceFile), out value) ? true : value;
        }
        catch { return true; }
    }

    void SaveTopMostPreference(bool value)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(preferenceFile));
            File.WriteAllText(preferenceFile, value.ToString());
        }
        catch { }
    }

    async Task Initialize()
    {
        try
        {
            string content = Path.Combine(root, "www");
            if (!File.Exists(Path.Combine(content, "index.html")))
                throw new FileNotFoundException("www フォルダーが見つかりません。ZIPをすべて展開してから起動してください。");
            string data = testing ? Path.Combine(testFolder, "profile") :
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "IjigenPocket", "PdfEasyConverter", "WebView2");
            var env = await CoreWebView2Environment.CreateAsync(null, data);
            await view.EnsureCoreWebView2Async(env);
            var core = view.CoreWebView2;
            core.SetVirtualHostNameToFolderMapping(Host, content, CoreWebView2HostResourceAccessKind.DenyCors);
            core.Settings.AreDevToolsEnabled = testing;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.AreBrowserAcceleratorKeysEnabled = false;
            core.Settings.IsWebMessageEnabled = testing;
            core.NavigationStarting += delegate(object sender, CoreWebView2NavigationStartingEventArgs e)
            {
                Uri uri;
                if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out uri) || uri.Scheme != "https" || uri.Host != Host)
                {
                    e.Cancel = true;
                    if (e.IsUserInitiated) OpenExternal(e.Uri);
                }
            };
            core.NewWindowRequested += delegate(object sender, CoreWebView2NewWindowRequestedEventArgs e)
            {
                e.Handled = true;
                if (e.IsUserInitiated) OpenExternal(e.Uri);
            };
            core.DownloadStarting += SaveDownload;
            if (testing)
            {
                // Block network fetches during the actual WebView2 integration test.
                core.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All);
                core.WebResourceRequested += delegate(object sender, CoreWebView2WebResourceRequestedEventArgs e)
                {
                    Uri uri;
                    if (Uri.TryCreate(e.Request.Uri, UriKind.Absolute, out uri) &&
                        (uri.Scheme == "https" || uri.Scheme == "http") && uri.Host != Host)
                    {
                        File.AppendAllText(Path.Combine(testFolder, "blocked-network.txt"), e.Request.Uri + Environment.NewLine);
                        e.Response = env.CreateWebResourceResponse(new MemoryStream(), 403, "Offline test", "");
                    }
                };
                core.WebMessageReceived += async delegate(object sender, CoreWebView2WebMessageReceivedEventArgs e)
                {
                    if (!e.Source.StartsWith("https://" + Host + "/", StringComparison.Ordinal)) return;
                    string message = e.TryGetWebMessageAsString();
                    if (!message.StartsWith("SELFTEST:")) return;
                    File.WriteAllText(Path.Combine(testFolder, "result.json"), message.Substring(9));
                    using (var stream = File.Create(Path.Combine(testFolder, "app.png")))
                        await core.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png, stream);
                    closing = true;
                    Close();
                };
            }
            core.NavigationCompleted += async delegate(object sender, CoreWebView2NavigationCompletedEventArgs e)
            {
                if (!e.IsSuccess) { Fail("画面を読み込めませんでした: " + e.WebErrorStatus); return; }
                ready = true;
                if (testing) await core.ExecuteScriptAsync(File.ReadAllText(testScript));
            };
            core.Navigate("https://" + Host + "/index.html");
        }
        catch (WebView2RuntimeNotFoundException)
        {
            Fail("Microsoft Edge WebView2 Runtime が必要です。READMEのMicrosoft公式リンクからインストールして、再度起動してください。");
        }
        catch (Exception ex) { Fail(ex.Message); }
    }

    void OpenExternal(string address)
    {
        Uri uri;
        if (!Uri.TryCreate(address, UriKind.Absolute, out uri) || (uri.Scheme != "https" && uri.Scheme != "http")) return;
        if (testing) return;
        try { Process.Start(new ProcessStartInfo(uri.AbsoluteUri) { UseShellExecute = true }); }
        catch (Exception ex) { MessageBox.Show(this, ex.Message, "リンクを開けませんでした"); }
    }

    void SaveDownload(object sender, CoreWebView2DownloadStartingEventArgs e)
    {
        e.Handled = true;
        if (testing)
        {
            e.ResultFilePath = Path.Combine(testFolder, Path.GetFileName(e.ResultFilePath));
            return;
        }
        using (var save = new SaveFileDialog())
        {
            save.Title = "編集データを保存";
            save.FileName = Path.GetFileName(e.ResultFilePath);
            save.Filter = "PDF楽々変換プロジェクト (*.pec)|*.pec|すべてのファイル (*.*)|*.*";
            save.DefaultExt = "pec";
            if (save.ShowDialog(this) != DialogResult.OK) { e.Cancel = true; return; }
            e.ResultFilePath = save.FileName;
        }
        var download = e.DownloadOperation;
        download.StateChanged += async delegate
        {
            if (download.State == CoreWebView2DownloadState.Interrupted)
                MessageBox.Show(this, "保存できませんでした: " + download.InterruptReason, "保存エラー");
            else if (download.State == CoreWebView2DownloadState.Completed && !view.IsDisposed)
                await view.CoreWebView2.ExecuteScriptAsync("showToast('保存完了','編集データを保存しました。','success')");
        };
    }

    async void OnClosing(object sender, FormClosingEventArgs e)
    {
        if (closing || !ready || testing) return;
        e.Cancel = true;
        try
        {
            string shouldClose = await view.CoreWebView2.ExecuteScriptAsync(
                "(()=>{try{" +
                "document.activeElement?.blur();" +
                "for(const item of processedItems){if(item.isEditing)syncEditState(item.id);}" +
                "saveToLocalStorage();" +
                "if(typeof hasUnsavedChanges === 'function' && hasUnsavedChanges()){" +
                "return confirm('保存されていない変更があります。保存せずに閉じてもよろしいですか？\\n\\n※画面の「保存」ボタンから .pec ファイルとして保存できます。');" +
                "}" +
                "return true;" +
                "}catch(e){return true;}})()");
            if (shouldClose != "true")
            {
                return;
            }
            closing = true;
            Close();
        }
        catch
        {
            MessageBox.Show(this, "自動保存中にエラーが発生しました。未保存の編集内容がある場合は失われる可能性があります。\n\nこのウィンドウは閉じます。", "保存の確認");
            closing = true;
            Close();
        }
    }

    void Fail(string message)
    {
        if (testing) File.WriteAllText(Path.Combine(testFolder, "error.txt"), message);
        else MessageBox.Show(this, message, "PDF楽々変換ツール", MessageBoxButtons.OK, MessageBoxIcon.Error);
        closing = true;
        Close();
    }
}
