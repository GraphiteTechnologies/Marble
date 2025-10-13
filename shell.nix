let
  moz_overlay = import (builtins.fetchTarball "https://github.com/mozilla/nixpkgs-mozilla/archive/master.tar.gz");
  nixpkgs = import <nixpkgs> { overlays = [ moz_overlay ]; };
in
nixpkgs.mkShell {
  buildInputs = with nixpkgs; [
    (rustChannels.nightly.rust.override {
      extensions = [ "rust-src" "clippy-preview" "rustfmt-preview" ];
    })
    pkg-config
    openssl
    cargo-watch
    cargo-edit
    rust-analyzer
    nodejs
    bun
    webkitgtk_4_1
    gtk3
    glib
    cairo
    pango
    gdk-pixbuf
    libsoup_3
    libxml2
    libxslt
    at-spi2-atk
    at-spi2-core
    gobject-introspection
  ]

  ++ (with nixpkgs; [
    libdrm
    libxkbcommon
    wayland
  ]);

  nativeBuildInputs = with nixpkgs; [ pkg-config ];

  LD_LIBRARY_PATH = nixpkgs.lib.makeLibraryPath [
    nixpkgs.openssl
    nixpkgs.webkitgtk_4_1
    nixpkgs.gtk3
    nixpkgs.glib
    nixpkgs.cairo
    nixpkgs.pango
    nixpkgs.gdk-pixbuf
    nixpkgs.libsoup_3
    nixpkgs.libxml2
    nixpkgs.libxslt
    nixpkgs.at-spi2-atk
    nixpkgs.at-spi2-core
    nixpkgs.gobject-introspection
    nixpkgs.libdrm
    nixpkgs.libxkbcommon
    nixpkgs.wayland
  ];

  PKG_CONFIG_PATH = "${nixpkgs.openssl.dev}/lib/pkgconfig";
  OPENSSL_DIR = "${nixpkgs.openssl.dev}";
  OPENSSL_LIB_DIR = "${nixpkgs.openssl.out}/lib";
  OPENSSL_INCLUDE_DIR = "${nixpkgs.openssl.dev}/include";

  shellHook = ''
    export LD_LIBRARY_PATH=${nixpkgs.libsoup_3}/lib:${nixpkgs.webkitgtk_4_1}/lib:$LD_LIBRARY_PATH
  '';
}
