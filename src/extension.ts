// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('phone-number-formatter.format', () => {

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const totalLines = document.lineCount;

        editor.edit(editBuilder => {
            for (let i = 0; i < totalLines; i++) {
                const line = document.lineAt(i);
                const text = line.text;
                const formattedText = formatPhoneNumber(text);
                editBuilder.replace(line.range, formattedText);
            }
        });
    });

    context.subscriptions.push(disposable);
}

function formatPhoneNumber(input: string): string {
    const phoneNumbers = input.split(':::').map(num => num.trim());
    const formattedNumbers = phoneNumbers.map(num => {
        let cleaned = num.replace(/[^\d]/g, ''); // Remove non-numeric characters
        const prefix = '+62 ';
        let formatted = '';

        if (cleaned.startsWith('08')) {
            cleaned = cleaned.slice(1);
        } else if (cleaned.startsWith('8')) {
            cleaned = cleaned;
        } else if (cleaned.startsWith('628')) {
            cleaned = cleaned.slice(2);
        } else if (cleaned.startsWith('+62 8')) {
            cleaned = cleaned.slice(4);
        } else {
            return num; // Return original if it doesn't match any rule
        }

        if (cleaned.length === 8) {
            formatted = `${prefix}${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 9) {
            formatted = `${prefix}${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 10) {
            formatted = `${prefix}${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 11) {
            formatted = `${prefix}${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
        } else if (cleaned.length === 12) {
            formatted = `${prefix}${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
        } else {
            formatted = num; // Return original if it doesn't match any rule
        }
        return formatted;
    });

    return formattedNumbers.join(' ::: ');
}

// This method is called when your extension is deactivated
export function deactivate() {}
