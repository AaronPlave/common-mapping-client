# Customizing the Help Modal Component

Let's extend the Core Help component to suit our needs. The Help component is responsible for displaying a modal menu with several subpages populated by content from markdown files. What we'll do now is extend this component and override the constructor so that we can load our own markdown files.

## Adding New Markdown Files

If we take a look at the constructor of the Core Help component we'll see that it's requiring markdown files from `default-data/_core_default-data/help/`. Since we made a copy of the `default-data` directory earlier in this walkthrough let's go ahead and start modifying our versions of those files. In `default-data/demo-default-data/help/about.md` let's add something like:

```
### Common Mapping Client Walkthrough

This application is a demonstration of the Common Mapping Client.
```

