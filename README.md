# External Formatters

This is a simple extension that lets you use an external command as formatter
for your code. This command should take a document's content at `stdin` and
return the formatted code at `stdout`.

## Formatting trigger

When a formatter for a language is configured for this extension, it will be
used when the `Format Document` command is run from the command palette,
or when the document is saved while the `editor.formatOnSave` setting is set
to `true` for the document's language.

## Working directory

* When formatting an existing file, the command is run from the directory
  where the file resides.
* When the file is not saved yet, the command is run from the root directory
  of your workspace.
* When neither directory is available, the command will use the directory
  where Visual Studio Code is running.

## Configuration

In your `settings.json`, add the following setting:

```json
"externalFormatters": {
    "<language id>": {
        "command": "<command to run>",
        "arguments": [
            "<first argument>",
            "<second argument>",
            ...
        ]
    },
    ...
}
```

So, for instance, for `Terraform` code, you can use these settings:

```json
"externalFormatters": {
    "terraform": {
        "command": "terraform",
        "arguments": [
            "fmt",
            "-"
        ]
    }
}
```

The `arguments` key is optional.  
You can define formatters for multiple languages, just add multiple entries
under the `externalFormatters` configuration key:

```json
"externalFormatters": {
    "foolang": {
        "command": "foofmt",
        "arguments": [
            "arg1",
            "arg2",
            "arg3"
        ]
    },
    "barlang": {
        "command": "format-bar"
    }
}
```

## TODO

 * Language-specific working directory override
