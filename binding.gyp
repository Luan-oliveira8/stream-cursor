{
  "targets": [
    {
      "target_name": "x11_addon",
      "sources": ["src/native/x11_addon.cc"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "libraries": ["-lX11", "-lXfixes"],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "cflags_cc": ["-std=c++17"],
      "defines": ["NAPI_VERSION=9"],
      "conditions": [
        ["OS=='linux'", {
          "defines": ["LINUX"]
        }]
      ]
    }
  ]
}
