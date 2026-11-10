import re

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Add call to initApp in module script
    module_replacement = '''window.firebaseApp = { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged, collection, getDocs, doc, setDoc, deleteDoc };
        if (window.initAppAfterFirebase) window.initAppAfterFirebase();'''
    text = text.replace('window.firebaseApp = { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged, collection, getDocs, doc, setDoc, deleteDoc };', module_replacement)

    # 2. Extract DOMContentLoaded block dynamically and replace it
    match = re.search(r'window\.addEventListener\("DOMContentLoaded", \(\) => \{\n\s*if \(window\.firebaseApp\) \{.*?\n\s*\}\n\s*\}\);', text, re.DOTALL)
    
    init_app_func_better = '''window.initAppAfterFirebase = function() {
        if (window.appInitialized) return;
        window.appInitialized = true;
        if (window.firebaseApp) {
            window.firebaseApp.onAuthStateChanged(window.firebaseApp.auth, async (user) => {
                currentUser = user;
                updateAuthUI();
                await loadAllQuizData();
                checkUrlParameter();
                renderHeader();
                renderHome();
                updateSettingsVisibility();
            });
        } else {
            loadAllQuizData().then(() => {
                checkUrlParameter();
                renderHeader();
                renderHome();
                updateSettingsVisibility();
            });
        }
    };
    
    window.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            if (!window.firebaseApp && !window.appInitialized) {
                window.initAppAfterFirebase();
            }
        }, 3000);
    });'''

    if match:
        text = text.replace(match.group(0), init_app_func_better)
        with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
            f.write(text)
        print('Initialization logic replaced successfully.')
    else:
        print('Could not find DOMContentLoaded block.')

if __name__ == '__main__':
    main()
