const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC API securely
contextBridge.exposeInMainWorld('electronAPI', {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, callback) => {
        const subscription = (event, ...args) => callback(event, ...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },
    once: (channel, callback) => ipcRenderer.once(channel, (event, ...args) => callback(event, ...args)),
    removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});

// Expose xterm securely via factory pattern
contextBridge.exposeInMainWorld('terminalFactory', {
    create: (options) => {
        const { Terminal } = require('xterm');
        const { FitAddon } = require('xterm-addon-fit');

        const term = new Terminal(options);
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        // We return a proxy object because contextBridge can't pass the full Terminal instance
        return {
            open: (container) => term.open(container),
            write: (data) => term.write(data),
            onData: (callback) => {
                const disposable = term.onData(callback);
                return { dispose: () => disposable.dispose() };
            },
            resize: (cols, rows) => term.resize(cols, rows),
            fit: () => fitAddon.fit(),
            focus: () => term.focus(),
            getSelection: () => term.getSelection(),
            hasSelection: () => term.hasSelection(),
            onSelectionChange: (callback) => {
                const disposable = term.onSelectionChange(callback);
                return { dispose: () => disposable.dispose() };
            },
            onResize: (callback) => {
                const disposable = term.onResize(callback);
                return { dispose: () => disposable.dispose() };
            },
            attachCustomKeyEventHandler: (handler) => {
                term.attachCustomKeyEventHandler(handler);
            },
            dispose: () => term.dispose(),

            // Properties accessors
            get cols() { return term.cols; },
            get rows() { return term.rows; }
        };
    }
});
