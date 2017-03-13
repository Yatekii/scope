import m from 'mithril';

export const radioSelection = {
    view: (vnode) =>
        m('.form-group', [
            vnode.attrs.items.map(function(item){
                return m('label.form-radio', [
                    m('input[' + (item == vnode.attrs.type ? 'checked' : '') + ']', {
                        type: 'radio',
                        name: vnode.attrs.id + '-items',
                        id: vnode.attrs.id + '-item-' + item,
                        onchange: m.withAttr('value', function(value) {
                            vnode.attrs.onchange(value);
                        }),
                        value: item
                    }),
                    m('i.form-icon'),
                    item
                ]);
            }),
        ])
};