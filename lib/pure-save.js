'use babel';

import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pure-save:save': () => this.save()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  save() {
    // Atom's way to get the item to save in core:save
    const item = atom.workspace.getCenter().getActivePane().getActiveItem()
    const buffer = item.getBuffer && item.getBuffer()
    if (!buffer) {
      return
    }
    // Replacing and backuping all save hooks
    const willSave = buffer.emitter.handlersByEventName['will-save']
    const didSave = buffer.emitter.handlersByEventName['did-save']
    buffer.emitter.handlersByEventName['will-save'] = []
    buffer.emitter.handlersByEventName['did-save'] = []
    // Run save on buffer instead of editor:
    // This also bypass atom-ide-ui audacious monkey patch
    buffer.save().then(() => {
      // When save (async) is done, restore hooks
      buffer.emitter.handlersByEventName['will-save'] = willSave
      buffer.emitter.handlersByEventName['did-save'] = didSave
    }).catch(() => {
      // Replace both with finally when it's available
      buffer.emitter.handlersByEventName['will-save'] = willSave
      buffer.emitter.handlersByEventName['did-save'] = didSave
    })
  }

};
