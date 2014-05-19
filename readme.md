# Corporeal

The best CMS on the planet, a perfect compliment to GhostJS.

## How to Install

### New Projects
```
npm install -g yo
npm install corporeal corporeal-generator
yo generate corporeal-project
# follow the onscreen instructions
```

### Existing Express Projects
```
npm install corporeal
```

Inside your express app
```
require('corporeal')(app, {
    template_dir: '/templates',
    mongo: {
        username: user,
        password: pass,
        host: localhost
    },
    url_prefix: 'corporeal' //this will add /corporeal/ to all urls
})
```

## Creating Templates
Creating templates is super simple. Use any express compatible template inside the templates_dir.
Add a template.json file that defines your variables inside the template.

```
{
    variables: [
        {
            name: 'myVar',
            type: 'string'
            defaultValue: 'myVar default value' //removing the defaultValue means the field is required
        },
        {
            name: 'myList',
            type: 'array',
            inner: {
                name: 'listItem',
                type: 'string'
            }
        }
    ]
}
```
