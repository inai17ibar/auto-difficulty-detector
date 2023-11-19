import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function saveEditHistory(context: vscode.ExtensionContext, document: vscode.TextDocument, contentChanges: readonly vscode.TextDocumentContentChangeEvent[]) {
	console.log("ファイル変更検出:", document.uri.toString());
	
	// ファイルの変更を記録する
	const historyPath = path.join(context.extensionPath, 'editHistory.json');
    let history = [];

    if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    }

    const editEntry = {
        documentUri: document.uri.toString(),
        timestamp: new Date().toISOString(), // 現在の時刻をISOフォーマットで記録
        changes: contentChanges.map(change => ({
            range: change.range,
            text: change.text
        }))
    };

	// 編集内容のログ
    console.log("編集内容:", editEntry);

	try {
        history.push(editEntry);
        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    } catch (error) {
        // エラーログ
        console.error("履歴保存エラー:", error);
    }
}

export function activate(context: vscode.ExtensionContext) {
    // vscode.workspace.onDidChangeTextDocument(event => {
    //     let activeEditor = vscode.window.activeTextEditor;

    //     // アクティブなエディタとイベントドキュメントの情報をログに出力
    //     console.log("アクティブなエディタ:", activeEditor?.document.uri.toString());
    //     console.log("イベントドキュメント:", event.document.uri.toString());

    //     if (activeEditor && event.document === activeEditor.document) {
    //         // 変更内容をログに出力
    //         event.contentChanges.forEach(change => {
    //             //console.log("変更されたテキスト:", change.text);
    //             //console.log("変更範囲:", change.range);
    //         });
    //     }
    // }, null, context.subscriptions);

    // // アクティブなエディタが変わったときのイベントリスナー
    // vscode.window.onDidChangeActiveTextEditor(editor => {
    //     console.log("アクティブなエディタが変更されました:", editor?.document.uri.toString());
    // }, null, context.subscriptions);

    // 拡張機能がアクティブになったことをログに記録
    console.log("拡張機能がアクティブになりました");

    let changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(event => {
        saveEditHistory(context, event.document, event.contentChanges);
    });

    context.subscriptions.push(changeDocumentSubscription);

    let disposable = vscode.commands.registerCommand('auto-difficulty-detector.activateExtension', () => {
        // 拡張機能がアクティベートされたときのロジック
        console.log('Auto Difficulty Detector is now active!');
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
