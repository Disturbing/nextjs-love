# Wrangler Service Binding Configuration

## wrangler.jsonc

```jsonc
{
  "services": [
    { "binding": "MY_SERVICE", "service": "my-worker" },
    { "binding": "OTHER_SERVICE", "service": "other-worker" },
    { "binding": "USAGE_SERVICE", "service": "usage" }
  ],
  "version_metadata": {
    "binding": "CF_VERSION_METADATA"
  }
}
```

## After Modifying wrangler.jsonc

Always regenerate env types:

```bash
pnpm run codegen
```

## Binding Naming Convention

- Binding name (uppercase): `MY_SERVICE`
- Service name (the worker's name in wrangler): `my-worker`
- The binding is accessed as `env.MY_SERVICE` or `this.env.MY_SERVICE`

## Durable Object Bindings

```jsonc
{
  "durable_objects": {
    "bindings": [
      { "name": "MY_DO", "class_name": "MyDO" },
      { "name": "OTHER_DO", "class_name": "OtherDO", "script_name": "other-worker" }
    ]
  }
}
```

- `class_name` matches the exported class name in `src/index.ts`
- `script_name` is only needed for DOs defined in a different worker
- Never hardcode service URLs — always use bindings
