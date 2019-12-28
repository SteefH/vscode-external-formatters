# External Formatters

This is a simple extension that allows you to define an external program as
formatter for your code. This program should take a file's content at `stdin`
and outputs the formatted code at `stdout`.

## Working directory:
* When formatting an existing file, the command is run from the directory
  where the file resides.
* When the file is not saved yet, the command is run from the root directory
  of your workspace.
* When none of those directories are available, the command will use
  the directory where Visual Studio Code is running.


## Configuration
In your `settings.json`, add the following setting:

```
"externalFormatters": {
    "<language id>": {
        "command": "<command to run>",
        "arguments": [
            "<first argument>",
            "<second argument>",
            ...
        ]
    }
}
```

So, for instance, for `Terraform` code, you can use these settings:
```
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

## TODO

 * Better error reporting
 * Fancy icon
