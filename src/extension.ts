// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let formatDisposable = vscode.commands.registerCommand('contacts-formatter.format', () => {

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

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
    context.subscriptions.push(formatDisposable);

    let cleanDisposable = vscode.commands.registerCommand('contacts-formatter.clean', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const totalLines = document.lineCount;

        editor.edit(editBuilder => {
            for (let i = 0; i < totalLines; i++) {
                const line = document.lineAt(i);
                const text = line.text;
                const cleanedText = cleanPhoneNumber(text);
                editBuilder.replace(line.range, cleanedText);
            }
        });
    });
    context.subscriptions.push(cleanDisposable);

    let generateNamesDisposable = vscode.commands.registerCommand('contacts-formatter.generateNames', async () => {
        const prefix = await vscode.window.showInputBox({
            prompt: 'Enter the prefix for the names',
            placeHolder: 'e.g., 2025 PI RS'
        });

        if (!prefix) {
            vscode.window.showErrorMessage('Prefix is required!');
            return;
        }

        const countInput = await vscode.window.showInputBox({
            prompt: 'Enter the number of names to generate',
            placeHolder: 'e.g., 100'
        });

        if (!countInput || isNaN(Number(countInput))) {
            vscode.window.showErrorMessage('A valid number is required!');
            return;
        }

        const count = parseInt(countInput, 10);
        if (count <= 0) {
            vscode.window.showErrorMessage('Number of names must be greater than 0!');
            return;
        }

        const startNumberInput = await vscode.window.showInputBox({
            prompt: 'Enter the starting number',
            placeHolder: 'e.g., 1'
        });

        if (!startNumberInput || isNaN(Number(startNumberInput))) {
            vscode.window.showErrorMessage('A valid starting number is required!');
            return;
        }

        const startNumber = parseInt(startNumberInput, 10);
        if (startNumber < 0) {
            vscode.window.showErrorMessage('Starting number must be non-negative!');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        const names = generateNamesWithStart(prefix, count, startNumber);

        editor.edit(editBuilder => {
            const position = editor.selection.active;
            editBuilder.insert(position, names.join('\n'));
        });

        vscode.window.showInformationMessage(`Generated ${count} names with prefix "${prefix}" starting from ${startNumber}.`);
    });
    context.subscriptions.push(generateNamesDisposable);

    let cleanNamesDisposable = vscode.commands.registerCommand('contacts-formatter.cleanNames', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const totalLines = document.lineCount;

        editor.edit(editBuilder => {
            for (let i = 0; i < totalLines; i++) {
                const line = document.lineAt(i);
                const text = line.text;
                const cleanedText = cleanNameSpacing(text);
                editBuilder.replace(line.range, cleanedText);
            }
        });
    });
    context.subscriptions.push(cleanNamesDisposable);
}

function formatPhoneNumber(input: string): string {
    const phoneNumbers = input.split(':::').map(num => num.trim());
    const formattedNumbers = phoneNumbers.map(num => {
        const prefix = '+62 ';
        let formatted = '';

        if (num.startsWith('08')) {
            num = num.slice(1);
        } else if (num.startsWith('8')) {
            num = num;
        } else if (num.startsWith('628')) {
            num = num.slice(2);
        } else if (num.startsWith('+62 8')) {
            num = num.slice(4);
        } else if (num.startsWith('+628')) {
            num = num.slice(3);
        } else {
            return num; // Return original if it doesn't match any rule
        }

        let cleaned = num.replace(/[^\d]/g, ''); // Remove non-numeric characters
        
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

// Function to clean phone numbers by removing all non-numeric characters
function cleanPhoneNumber(input: string): string {
    const phoneNumbers = input.split(':::').map(num => num.trim());
    const cleanedNumbers = phoneNumbers.map(num => num.replace(/[^\d]/g, ''));
    return cleanedNumbers.join(' ::: ');
}

function generateNamesWithStart(prefix: string, count: number, start: number): string[] {
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
        const paddedNumber = (start + i).toString().padStart(3, '0');
        names.push(`${prefix} ${paddedNumber}`);
    }
    return names;
}

function cleanNameSpacing(input: string): string {
    return input
        .split('\n')
        .map(line =>
            line
                .replace(/\s+/g, ' ')
                .trim()
        )
        .join('\n');
}

// This method is called when your extension is deactivated
export function deactivate() {}
