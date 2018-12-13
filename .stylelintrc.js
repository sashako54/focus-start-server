module.exports = {
    extends: 'stylelint-config-standard',
    rules: {
        'declaration-empty-line-before': [
            'always',
            {
                except: ['first-nested', 'after-comment'],
                ignore: ['after-declaration']
            }
        ]
        // indent: ['error', 4]
    }
};
